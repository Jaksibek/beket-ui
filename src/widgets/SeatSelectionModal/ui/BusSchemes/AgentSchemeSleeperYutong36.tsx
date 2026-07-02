import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import type { ISeat } from "@/pages/SearchPage/model/types";
import { Seat } from "@/shared/ui/Seat/Seat";
import type { SeatStatus } from "@/shared/ui/Seat";
import { Yutong36LayoutTemplate } from "./templates/Yutong36LayoutTemplate";
import styles from "./BusScheme.module.scss";

interface AgentSchemeSleeperYutong36Props {
    seatsData: ISeat[];
    selectedSeats: (string | number)[];
    onSeatClick: (seatNum: string | number) => void;
}

export const AgentSchemeSleeperYutong36 = memo(({
    seatsData,
    selectedSeats,
    onSeatClick
}: AgentSchemeSleeperYutong36Props) => {
    const { t } = useTranslation();

    const renderSeat = (
        cell: ISeat,
        isUpper: boolean,
        isBackRow: boolean,
        levelBorderColor: string
    ) => {
        // Use the normalized displayName from the template (e.g. "01", "02", "3" etc.)
        const rawNum = cell.number || (cell as any).seatNumber || '';
        const displayName = cell.displayName || rawNum;
        const level = cell.level ?? (cell as any).Level ?? 1;

        // Selection key uses displayName to match what is shown on screen
        const selectionKey = `${displayName}_${level}`;

        const apiStatus = cell.status || (cell as any).Status;
        const isSelected = selectedSeats.some(s => String(s).trim() === selectionKey);

        let status: SeatStatus = 'available';
        if (isSelected) {
            status = 'selected';
        } else if (apiStatus === 'Booked') {
            status = 'booked';
        } else if (apiStatus === 'Reserved') {
            status = 'reserved';
        }

        const price = cell.price || (cell as any).Price || 0;

        let customStyle: React.CSSProperties = {
            borderColor: levelBorderColor,
            borderWidth: '2px',
            borderStyle: 'solid'
        };

        if (status === 'available') {
            customStyle.background = isUpper
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            customStyle.color = '#fff';
        } else if (status === 'selected') {
            customStyle.background = 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)';
            customStyle.color = '#fff';
            customStyle.boxShadow = '0 0 8px #eab308';
        } else if (status === 'booked') {
            customStyle.background = '#e2e8f0';
            customStyle.color = '#94a3b8';
        } else if (status === 'reserved') {
            customStyle.background = '#ffedd5';
            customStyle.color = '#ea580c';
        }

        const tooltipTitle = isUpper ? t('Upper') : t('Lower');

        return (
            <Tooltip key={selectionKey} title={tooltipTitle}>
                <div style={{ display: 'inline-block', flex: isBackRow ? '1' : 'none', height: isBackRow ? '100%' : 'auto' }}>
                    <Seat
                        seatNumber={displayName}
                        status={status}
                        disabled={false}
                        price={price > 0 ? price : undefined}
                        style={{
                            ...customStyle,
                            cursor: 'pointer',
                            position: 'relative',
                            width: '64px',
                            height: isBackRow ? '100%' : '32px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => onSeatClick(selectionKey)}
                    >
                        <span
                            className={styles.bunkBadge}
                            style={{
                                color: status === 'available' || status === 'selected' ? '#fff' : levelBorderColor
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
        <Yutong36LayoutTemplate
            seatsData={seatsData}
            renderSeat={renderSeat}
        />
    );
});
