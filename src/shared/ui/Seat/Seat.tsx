import { memo } from 'react';
import { Typography } from 'antd';
import styles from './Seat.module.scss';

const { Text } = Typography;

export type SeatStatus = 'available' | 'booked' | 'selected';

interface SeatProps {
    seatNumber: number;
    status: SeatStatus;
    isAisle?: boolean; // new prop to distinguish window vs aisle seats 
    onClick: (seatNumber: number) => void;
}

export const Seat = memo((props: SeatProps) => {
    const { seatNumber, status, isAisle, onClick } = props;

    const handleClick = () => {
        if (status !== 'booked') {
            onClick(seatNumber);
        }
    };

    let statusClass = styles.available;
    if (status === 'booked') {
        statusClass = styles.booked;
    } else if (status === 'selected') {
        statusClass = styles.selected;
    } else if (isAisle) {
        statusClass = `${styles.available} ${styles.aisle}`;
    }

    return (
        <div
            className={`${styles.seat} ${statusClass}`}
            onClick={handleClick}
        >
            <Text className={styles.seatNumber}>{seatNumber}</Text>
        </div>
    );
});
