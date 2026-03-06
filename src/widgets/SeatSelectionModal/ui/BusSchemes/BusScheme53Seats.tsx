import { memo } from 'react';
import { Seat } from '@/shared/ui/Seat';
import type { SeatStatus } from '@/shared/ui/Seat';
import type { ISeat } from '@/pages/SearchPage/model/types';
import styles from './BusScheme.module.scss';

interface Props {
    seatsData: ISeat[];
    selectedSeats: number[];
    onSeatClick: (num: number) => void;
}

// Constant layout representation for a 53-seat bus model.
// numbers = seat number
// 'door'/'wc' = facilities
// null = empty space (aisle)
// Structure: array of rows (for horizontal rendering, a row here is a vertical column in the real world).
// Wait, the bus renders horizontally (driver on left).
// That means the matrix should map cleanly: each sub-array represents a vertical column of seats from top to bottom.
const LAYOUT_COLUMNS = [
    ['driver', null, null, null, 'door'], // Front of bus: Driver left(top), Door right(bottom)
    [1, 2, null, 3, 4],
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20],
    [21, 22, null, 23, 24],
    [null, null, null, null, 'door'], // Middle door on the right side (bottom)
    [25, 26, null, 27, 28],
    [29, 30, null, 31, 32],
    [33, 34, null, 35, 36],
    [37, 38, null, 39, 40],
    [41, 42, null, 43, 44],
    [45, 46, null, 47, 48],
    [49, 50, 51, 52, 53] // Back row has 5 seats 
];

export const BusScheme53Seats = memo(({ seatsData, selectedSeats, onSeatClick }: Props) => {

    // Helper to determine the actual seat state based on API data
    const getSeatProps = (seatNum: number) => {
        // Find seat by seat.number string logic
        const apiSeat = seatsData.find(s => s.number === String(seatNum));

        let status: SeatStatus = 'available';
        const isSelected = selectedSeats.includes(seatNum);

        if (apiSeat) {
            if (apiSeat.status === 'Booked' || apiSeat.status === 'Reserved') {
                status = 'booked';
            } else if (isSelected) {
                status = 'selected';
            }
        } else {
            // If the seat is not found in the DB, it's virtually "unavailable" / disabled 
            // but we'll show it as booked or unclickable for now.
            status = 'booked';
        }

        return { status };
    };

    // To render horizontally properly, we need to transpose our logical LAYOUT_COLUMNS 
    // into rendering ROWS if we use flex-direction: column for the grid.
    // Wait, if LAYOUT_COLUMNS represents [vertical block 1], [vertical block 2], ...
    // we can use flex-direction: row for the container, and each column is a flex-direction: column block.
    return (
        <div className={styles.schemeContainer}>
            <div className={styles.seatRow}>
                {[...LAYOUT_COLUMNS].reverse().map((col, colIndex) => (
                    <div key={colIndex} className={styles.seatsGrid}>
                        {col.map((cell, rowIndex) => {
                            if (cell === null) {
                                return <div key={`empty-${colIndex}-${rowIndex}`} className={styles.emptySpace} />;
                            }
                            if (cell === 'driver') {
                                return (
                                    <div key={`driver-${colIndex}-${rowIndex}`} className={styles.driverCell}>
                                        <div className={styles.wheel}></div>
                                    </div>
                                );
                            }
                            if (cell === 'door') {
                                return <div key={`door-${colIndex}-${rowIndex}`} className={styles.facility}>EXIT</div>;
                            }

                            // It's a Seat Number
                            const seatNum = cell as number;
                            const { status } = getSeatProps(seatNum);

                            return (
                                <Seat
                                    key={seatNum}
                                    seatNumber={seatNum}
                                    status={status}
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
