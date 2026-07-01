import { memo } from 'react';
import { Seat } from '@/shared/ui/Seat';
import type { SeatStatus } from '@/shared/ui/Seat';
import type { ISeat } from '@/pages/SearchPage/model/types';
import styles from './BusScheme.module.scss';

interface Props {
    seatsData: ISeat[];
    selectedSeats: (string | number)[];
    onSeatClick: (num: string | number) => void;
    isAgent?: boolean;
}

// Dynamic premium bus scheme layout mapping coordinates

export const BusScheme53Seats = memo(({ seatsData, selectedSeats, onSeatClick, isAgent }: Props) => {
    if (!seatsData || seatsData.length === 0) return null;

    const maxRow = Math.max(...seatsData.map(s => s.row ?? 0), 0);
    const maxCol = Math.max(...seatsData.map(s => s.column ?? 0), 0);

    const grid: any[][] = [];
    for (let r = 0; r <= maxRow; r++) {
        grid[r] = new Array(maxCol + 1).fill(null);
    }
    seatsData.forEach(s => {
        const row = s.row ?? 0;
        const col = s.column ?? 0;
        if (row <= maxRow && col <= maxCol) {
            grid[row][col] = s;
        }
    });

    // Helper to determine the actual seat state based on API data
    const getSeatProps = (apiSeat: any) => {
        let status: SeatStatus = 'available';
        const seatNum = apiSeat.number || apiSeat.Number || apiSeat.seatNumber || '';
        const isSelected = selectedSeats.some(s => String(s) === String(seatNum));

        const apiStatus = apiSeat.status || apiSeat.Status;

        if (isSelected) {
            status = 'selected';
        } else if (apiStatus === 'Booked') {
            status = 'booked';
        } else if (apiStatus === 'Reserved') {
            status = isAgent ? 'reserved' : 'booked';
        }

        return { status };
    };

    return (
        <div className={styles.schemeContainer}>
            <div className={styles.seatRow}>
                {[...grid].reverse().map((rowCells, rIdx) => (
                    <div key={rIdx} className={styles.seatsGrid}>
                        {rowCells.map((cell, cIdx) => {
                            if (!cell) {
                                return <div key={`empty-${rIdx}-${cIdx}`} className={styles.emptySpace} />;
                            }

                            const code = cell.cellTypeCode || cell.CellTypeCode || "empty";
                            if (code === 'aisle' || code === 'empty') {
                                return <div key={`aisle-${rIdx}-${cIdx}`} className={styles.emptySpace} />;
                            }
                            if (code === 'driver') {
                                return (
                                    <div key={`driver-${rIdx}-${cIdx}`} className={styles.driverCell}>
                                        <div className={styles.wheel}></div>
                                    </div>
                                );
                            }
                            if (code === 'door') {
                                return <div key={`door-${rIdx}-${cIdx}`} className={styles.facility}>EXIT</div>;
                            }
                            if (code === 'wc') {
                                return <div key={`wc-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: '#7f1d1d', color: '#fca5a5' }}>WC</div>;
                            }

                            // It's a Seat Number
                            const seatNum = cell.number || cell.Number || cell.seatNumber || '';
                            const { status } = getSeatProps(cell);
                            const isVip = cell.type?.toUpperCase() === 'VIP' || cell.Type?.toUpperCase() === 'VIP';
                            const price = cell.price || cell.Price || 0;

                            return (
                                <Seat
                                    key={String(seatNum)}
                                    seatNumber={seatNum}
                                    status={status}
                                    isVip={isVip}
                                    disabled={isAgent ? false : undefined}
                                    price={isAgent && price > 0 ? price : undefined}
                                    style={{
                                        cursor: isAgent ? 'pointer' : undefined,
                                        ...(isVip && status === 'available' ? {
                                            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                            borderColor: '#ca8a04',
                                            color: '#fff'
                                        } : {})
                                    }}
                                    onClick={() => onSeatClick(seatNum)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
});
