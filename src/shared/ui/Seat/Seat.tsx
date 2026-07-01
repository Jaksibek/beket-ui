import { memo } from 'react';
import { Typography } from 'antd';
import styles from './Seat.module.scss';

const { Text } = Typography;

export type SeatStatus = 'available' | 'booked' | 'selected' | 'reserved';

interface SeatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
    seatNumber: string | number;
    status: SeatStatus;
    isAisle?: boolean; // new prop to distinguish window vs aisle seats 
    isVip?: boolean;
    style?: React.CSSProperties;
    onClick: (seatNumber: string | number) => void;
    children?: React.ReactNode;
    disabled?: boolean;
    price?: number;
}

export const Seat = memo((props: SeatProps) => {
    const { seatNumber, status, isAisle, style, onClick, children, disabled, price, ...rest } = props;

    const isSeatDisabled = disabled ?? (status === 'booked');

    const handleClick = () => {
        if (!isSeatDisabled) {
            onClick(seatNumber);
        }
    };

    let statusClass = styles.available;
    if (status === 'booked') {
        statusClass = styles.booked;
    } else if (status === 'reserved') {
        statusClass = styles.reserved;
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
            {...rest}
        >
            {price && price > 0 ? (
                <div className={styles.seatContent}>
                    <span className={styles.seatNumberWithPrice} style={style?.color ? { color: style.color } : undefined}>
                        {seatNumber}
                    </span>
                    <span className={styles.price} style={style?.color ? { color: style.color } : undefined}>
                        {price}
                    </span>
                </div>
            ) : (
                <Text className={styles.seatNumber} style={style?.color ? { color: style.color } : undefined}>
                    {seatNumber}
                </Text>
            )}
            {children}
        </div>
    );
});
