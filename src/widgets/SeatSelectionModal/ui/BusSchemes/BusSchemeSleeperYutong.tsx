import { memo } from 'react';
import { Tooltip } from 'antd';
import { Seat } from '@/shared/ui/Seat';
import type { SeatStatus } from '@/shared/ui/Seat';
import type { ISeat } from '@/pages/SearchPage/model/types';
import styles from './BusScheme.module.scss';

interface Props {
    seatsData: ISeat[];
    selectedSeats: (string | number)[];
    onSeatClick: (num: string | number) => void;
}

export const BusSchemeSleeperYutong = memo(({ seatsData, selectedSeats, onSeatClick }: Props) => {
    if (!seatsData || seatsData.length === 0) return null;

    // Helper to determine the actual seat state based on API data
    const getSeatProps = (apiSeat: ISeat) => {
        let status: SeatStatus = 'available';
        const seatId = apiSeat.id || '';
        const isSelected = selectedSeats.some(
            s => String(s).trim() === String(seatId).trim()
        );

        if (apiSeat.status === 'Booked' || apiSeat.status === 'Reserved') {
            status = 'booked';
        } else if (isSelected) {
            status = 'selected';
        }

        return { status, seatNum: apiSeat.number || '' };
    };

    const normalizeSleeperSeats = (seats: ISeat[]) => {
        return seats.map(s => {
            let row = s.row;
            let col = s.column;
            const isBack = s.isLastSeat || s.IsLastSeat;

            if (isBack) {
                const num = Number(s.number || 0);
                if (num === 15) col = 0;
                else if (num === 16) col = 1;
                else if (num === 17) col = 3;
                else if (num === 18) col = 4;
            }

            const code = s.cellTypeCode;
            if (code === 'driver') {
                col = 0;
            } else if (code === 'door') {
                col = 4;
            }

            return {
                ...s,
                row,
                column: col
            };
        });
    };

    const buildGrid = (seats: ISeat[]) => {
        if (seats.length === 0) return [];
        const maxRow = Math.max(...seats.map(s => s.row), 0);
        const maxCol = Math.max(...seats.map(s => s.column), 0);

        const grid: (ISeat | null)[][] = [];
        for (let r = 0; r <= maxRow; r++) {
            grid[r] = new Array(maxCol + 1).fill(null);
        }
        seats.forEach(s => {
            const row = s.row;
            const col = s.column;
            if (row <= maxRow && col <= maxCol) {
                grid[row][col] = s;
            }
        });
        return grid;
    };

    const normalizedSeats = normalizeSleeperSeats(seatsData);
    const unifiedGrid = buildGrid(normalizedSeats);

    const renderDeckGrid = (grid: (ISeat | null)[][]) => {
        if (grid.length === 0) return null;

        return (
            <div className={styles.seatRow} style={{ alignItems: 'stretch' }}>
                {[...grid].reverse().map((rowCells, rIdx) => {
                    const isBackRow = rowCells.some(cell => cell && (cell.isLastSeat || cell.IsLastSeat));

                    return (
                        <div key={rIdx} className={styles.seatsGrid} style={isBackRow ? { alignSelf: 'stretch' } : {}}>
                            {rowCells.map((cell, cIdx) => {
                                if (!cell) {
                                    if (isBackRow && cIdx === 2) return null;
                                    return <div key={`empty-${rIdx}-${cIdx}`} className={styles.emptySpace} style={cIdx === 2 ? { height: '12px' } : undefined} />;
                                }

                                const code = cell.cellTypeCode || "empty";
                                if (code === 'aisle' || code === 'empty') {
                                    if (isBackRow && cIdx === 2) return null;
                                    return <div key={`aisle-${rIdx}-${cIdx}`} className={styles.emptySpace} style={cIdx === 2 ? { height: '12px' } : undefined} />;
                                }
                                if (code === 'driver') {
                                    return (
                                        <div key={`driver-${rIdx}-${cIdx}`} className={styles.driverCell}>
                                            <div className={styles.wheel}></div>
                                        </div>
                                    );
                                }
                                if (code === 'door') {
                                    return <div key={`door-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: '#15803d', borderColor: '#166534', color: '#fff' }}>EXIT</div>;
                                }
                                if (code === 'wc') {
                                    return <div key={`wc-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: '#7f1d1d', borderColor: '#991b1b', color: '#fca5a5' }}>WC</div>;
                                }

                                const { status, seatNum } = getSeatProps(cell);
                                const isUpper = cell.level === 2;

                                let customStyle = {};
                                if (status === 'available') {
                                    if (isUpper) {
                                        customStyle = {
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            borderColor: '#2563eb',
                                            color: '#fff'
                                        };
                                    } else {
                                        customStyle = {
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            borderColor: '#16a34a',
                                            color: '#fff'
                                        };
                                    }
                                } else if (status === 'selected') {
                                    customStyle = {
                                        background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                        borderColor: '#ca8a04',
                                        color: '#fff',
                                        boxShadow: '0 0 8px #eab308'
                                    };
                                } else if (status === 'booked') {
                                    customStyle = {
                                        background: '#e2e8f0',
                                        borderColor: '#cbd5e1',
                                        color: '#94a3b8'
                                    };
                                }

                                const tooltipTitle = isUpper ? "Верхний" : "Нижний";

                                return (
                                    <div key={String(seatNum)} style={{ display: 'inline-block', flex: isBackRow ? '1' : 'none', height: isBackRow ? '100%' : 'auto' }}>
                                        <Tooltip title={tooltipTitle}>
                                            <Seat
                                                seatNumber={seatNum}
                                                status={status}
                                                style={{
                                                    ...customStyle,
                                                    position: 'relative',
                                                    width: '64px',
                                                    height: isBackRow ? '100%' : '32px',
                                                    borderRadius: '6px',
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold'
                                                }}
                                                onClick={() => onSeatClick(cell.id)}
                                            >
                                                <span className={styles.bunkBadge}>
                                                    {isUpper ? '↑' : '↓'}
                                                </span>
                                                <div className={`${styles.bedPillow} ${isUpper ? styles.upperPillow : styles.lowerPillow}`} />
                                            </Seat>
                                        </Tooltip>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={styles.sleeperLayoutWrapper}>
            <div className={styles.deckOutline} style={{ borderColor: "#cbd5e1" }}>
                <div className={styles.deckGrid}>
                    {renderDeckGrid(unifiedGrid)}
                </div>
            </div>
        </div>
    );
});
