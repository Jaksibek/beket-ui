import { memo } from 'react';
import { Typography } from 'antd';
import styles from './Seat.module.scss';

const { Text } = Typography;

export type SeatStatus = 'available' | 'booked' | 'selected';

interface SeatProps {
    seatNumber: string | number;
    status: SeatStatus;
    isAisle?: boolean; // new prop to distinguish window vs aisle seats 
    isVip?: boolean;
    style?: React.CSSProperties;
    onClick: (seatNumber: string | number) => void;
    children?: React.ReactNode;
}

export const Seat = memo((props: SeatProps) => {
    const { seatNumber, status, isAisle, style, onClick, children } = props;

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
            style={style}
        >
            <Text className={styles.seatNumber} style={style?.color ? { color: style.color } : undefined}>{seatNumber}</Text>
            {children}
        </div>
    );
});
