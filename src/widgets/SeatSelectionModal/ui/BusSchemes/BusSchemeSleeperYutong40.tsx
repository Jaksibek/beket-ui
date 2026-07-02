import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import type { ISeat } from "@/pages/SearchPage/model/types";
import { Seat } from "@/shared/ui/Seat/Seat";
import type { SeatStatus } from "@/shared/ui/Seat";
import { Yutong40LayoutTemplate } from "./templates/Yutong40LayoutTemplate";
import styles from "./BusScheme.module.scss";

interface BusSchemeSleeperYutong40Props {
    seatsData: ISeat[];
    selectedSeats: (string | number)[];
    onSeatClick: (seatId: string) => void;
}

export const BusSchemeSleeperYutong40 = memo(({
    seatsData,
    selectedSeats,
    onSeatClick
}: BusSchemeSleeperYutong40Props) => {
    const { t } = useTranslation();

    const getSeatProps = (apiSeat: ISeat) => {
        let status: SeatStatus = 'available';
        const seatId = apiSeat.id || '';
        const seatNum = apiSeat.number || (apiSeat as any).seatNumber || '';
        const isSelected = selectedSeats.some(
            s => String(s).trim() === String(seatId).trim()
        );

        const apiStatus = apiSeat.status || (apiSeat as any).Status;

        if (isSelected) {
            status = 'selected';
        } else if (apiStatus === 'Booked') {
            status = 'booked';
        } else if (apiStatus === 'Reserved') {
            status = 'booked'; // Passengers see reserved as booked
        }

        return { status, seatNum };
    };

    const renderSeat = (
        cell: ISeat,
        isUpper: boolean,
        isBackRow: boolean,
        _levelBorderColor: string
    ) => {
        const { status, seatNum } = getSeatProps(cell);

        let customStyle: React.CSSProperties = {};

        if (status === 'available') {
            if (isUpper) {
                customStyle.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                customStyle.color = '#fff';
            } else {
                customStyle.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                customStyle.color = '#fff';
            }
        } else if (status === 'selected') {
            customStyle.background = 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)';
            customStyle.color = '#fff';
            customStyle.boxShadow = '0 0 8px #eab308';
        } else if (status === 'booked') {
            customStyle.background = '#e2e8f0';
            customStyle.color = '#94a3b8';
        }

        const tooltipTitle = isUpper ? t('Upper') : t('Lower');

        return (
            <Tooltip key={cell.id} title={tooltipTitle}>
                <div style={{ display: 'inline-block', flex: isBackRow ? '1' : 'none', height: isBackRow ? '100%' : 'auto' }}>
                    <Seat
                        seatNumber={cell.displayName || seatNum}
                        status={status}
                        style={{
                            ...customStyle,
                            position: 'relative',
                            width: '64px',
                            height: isBackRow ? '100%' : '32px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => onSeatClick(cell.id)}
                    >
                        <span 
                            className={styles.bunkBadge} 
                            style={{ 
                                color: '#fff' 
                            }}
                        >
                            {isUpper ? '↑' : '↓'}
                        </span>
                        <div className={`${styles.bedPillow} ${isUpper ? styles.upperPillow : styles.lowerPillow}`} />
                    </Seat>
                </div>
            </Tooltip>
        );
    };

    return (
        <Yutong40LayoutTemplate
            seatsData={seatsData}
            renderSeat={renderSeat}
        />
    );
});
