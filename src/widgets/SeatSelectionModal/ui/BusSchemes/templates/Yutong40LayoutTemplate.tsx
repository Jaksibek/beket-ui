import React, { memo } from "react";
import type { ISeat } from "@/pages/SearchPage/model/types";
import styles from "../BusScheme.module.scss";

export interface Yutong40TemplateProps {
    seatsData: ISeat[];
    renderSeat: (
        cell: ISeat,
        isUpper: boolean,
        isBackRow: boolean,
        levelBorderColor: string
    ) => React.ReactNode;
}

export const Yutong40LayoutTemplate = memo(({ seatsData, renderSeat }: Yutong40TemplateProps) => {
    const normalizeSleeperSeats = (seats: ISeat[]) => {
        // DEBUG: log raw seats for row=1 to diagnose 01/02 numbering
        const row1seats = seats.filter(s => {
            const r = s.row ?? (s as any).Row ?? (s as any).row;
            return Number(r) === 1;
        });
        if (row1seats.length > 0) {
            console.log('[Yutong40] Raw row=1 seats:', JSON.stringify(row1seats, null, 2));
        }

        let mapped = seats.map(s => {
            let row = s.row ?? (s as any).Row ?? 0;
            let col = s.column ?? (s as any).Column ?? 0;
            let level = s.level ?? (s as any).Level ?? 1;

            const rawNum = s.number ?? (s as any).Number ?? (s as any).seatNumber ?? (s as any).SeatNumber ?? (s as any).seatNo ?? (s as any).SeatNo ?? "";
            let numStr = String(rawNum).trim();
            if (numStr === "null" || numStr === "undefined") numStr = "";
            let displayName = numStr;

            const rowNum = Number(row);
            const lvlNum = Number(level);

            if (rowNum === 1) {
                const isZeroOrOne = numStr === "0" || numStr === "01" || numStr === "1";
                const isDoubleZeroOrTwo = numStr === "00" || numStr === "02" || numStr === "2";

                console.log(`[Yutong40] row=1 seat: numStr="${numStr}", lvlNum=${lvlNum}, isZeroOrOne=${isZeroOrOne}, isDoubleZeroOrTwo=${isDoubleZeroOrTwo}`);

                if (isDoubleZeroOrTwo && lvlNum === 2) {
                    displayName = "02";
                    row = 1;
                    col = 1;
                } else if (isDoubleZeroOrTwo && lvlNum === 1) {
                    displayName = "02";
                    row = 2;
                    col = 1;
                } else if (isZeroOrOne && lvlNum === 2) {
                    displayName = "01";
                    row = 1;
                    col = 0;
                } else if (isZeroOrOne && lvlNum === 1) {
                    displayName = "01";
                    row = 2;
                    col = 0;
                }

                console.log(`[Yutong40] → displayName="${displayName}"`);
            } else if (rowNum >= 2) {
                row = rowNum + 1;
            }

            const isBack = s.isLastSeat || s.IsLastSeat;
            if (isBack) {
                const num = Number(numStr || 0);
                if (num === 15) col = 0;
                else if (num === 16) col = 1;
                else if (num === 17) col = 3;
                else if (num === 18) col = 4;
            }

            let code = s.cellTypeCode;
            if (code === 'driver') {
                col = 0;
            } else if (code === 'door') {
                if (row === 0) {
                    code = 'empty';
                } else {
                    col = 4;
                }
            }

            return {
                ...s,
                number: numStr,
                Number: numStr,
                displayName: displayName,
                row: row,
                Row: row,
                column: col,
                Column: col,
                level: lvlNum,
                Level: lvlNum,
                cellTypeCode: code,
                CellTypeCode: code
            };
        });

        // Inject EXIT door in Row 2 Col 4
        mapped.push({
            id: "virtual-exit-door-row2",
            cellTypeCode: "door",
            row: 2,
            column: 4,
            level: 1,
            status: "Free",
            price: 0,
            isWindow: false,
            type: "door",
            number: ""
        } as any);

        return mapped;
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
                    const isBackRow = rowCells.some(cell => {
                        if (!cell) return false;
                        const num = Number(cell.number || (cell as any).seatNumber || 0);
                        return cell.isLastSeat || (cell as any).IsLastSeat || (num >= 15 && num <= 18);
                    });

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
                                            <div className={styles.wheel}>
                                                <div className={styles.spoke}></div>
                                                <div className={styles.spoke}></div>
                                                <div className={styles.spoke}></div>
                                            </div>
                                        </div>
                                    );
                                }
                                if (code === 'door') {
                                    return <div key={`door-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: '#15803d', borderColor: '#166534', color: '#fff' }}>EXIT</div>;
                                }
                                if (code === 'wc') {
                                    return <div key={`wc-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: '#7f1d1d', borderColor: '#991b1b', color: '#fca5a5' }}>WC</div>;
                                }

                                const isUpper = cell.level === 2;
                                const levelBorderColor = isUpper ? '#2563eb' : '#16a34a';

                                return renderSeat(cell, isUpper, isBackRow, levelBorderColor);
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
