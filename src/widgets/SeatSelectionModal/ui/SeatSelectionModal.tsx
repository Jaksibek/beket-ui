import { useState, useEffect, memo } from 'react';
import { Modal, Typography, Button, Flex, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { ITrip } from '@/pages/SearchPage';
import type { ITripSeatsResponse, ISeat } from '@/pages/SearchPage/model/types';
import API from '@/shared/api';
import { BusScheme53Seats } from './BusSchemes/BusScheme53Seats';
import { BusSchemeSleeperYutong40 } from './BusSchemes/BusSchemeSleeperYutong40';
import { BusSchemeSleeperYutong36 } from './BusSchemes/BusSchemeSleeperYutong36';
import styles from './SeatSelectionModal.module.scss';
import { appRoutes } from '@/shared/config/router';

const { Title, Text } = Typography;

interface SeatSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: ITrip;
}

export const SeatSelectionModal = memo((props: SeatSelectionModalProps) => {
    const { isOpen, onClose, trip } = props;
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
    const [seatsData, setSeatsData] = useState<ISeat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (isOpen && trip?.tripId) {
            setIsLoading(true);
            API.get<ITripSeatsResponse>(`/api/v1/trips/${trip.tripId}/seats`)
                .then(res => {
                    setSeatsData(res.data.seats || []);
                })
                .catch(err => {
                    console.error("Failed to fetch seats", err);
                    message.error(t('Failed to load seats') || 'Не удалось загрузить схему мест');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, trip?.tripId]);

    const handleSeatClick = (seatIdOrNumber: string | number) => {
        setSelectedSeats((prev: (string | number)[]) => {
            // If already selected, allow deselection
            if (prev.includes(seatIdOrNumber)) {
                return prev.filter((s: string | number) => s !== seatIdOrNumber);
            }
            // If adding a new item, check the maximum allowed threshold (4)
            if (prev.length >= 4) {
                message.warning(t('You can select a maximum of 4 seats') || 'Вы можете выбрать не более 4 мест');
                return prev;
            }
            return [...prev, seatIdOrNumber];
        });
    };

    const handleBook = async () => {
        if (selectedSeats.length === 0) {
            message.warning(t('Please select at least one seat') || 'Пожалуйста, выберите хотя бы одно место');
            return;
        }

        try {
            setIsBooking(true);
            const response = await API.post('/api/v1/bookings', {
                tripId: trip.tripId,
                seatNumbers: selectedSeats.map(String)
            });

            // Map selected seat values (GUIDs or numbers) to human readable names for booking confirmation page
            const isSleeper = seatsData.some(s => s.level === 2);
            const readableSeats = selectedSeats.map(val => {
                const seat = seatsData.find(s => s.id === val || String(s.number) === String(val));
                if (!seat) return val;
                if (isSleeper) {
                    const lvlName = seat.level === 2 ? t('Upper') : t('Lower');
                    return `${seat.number} (${lvlName})`;
                }
                return seat.number || val;
            });

            // Navigate to booking page, passing state plus the 15-minute lock details
            navigate(appRoutes.booking, {
                state: {
                    trip,
                    selectedSeats: readableSeats,
                    bookingId: response.data.bookingId,
                    expiresAt: response.data.expiresAt
                }
            });

            // Reset and close
            setSelectedSeats([]);
            onClose();
        } catch (err: any) {
            console.error("Booking failed:", err);
            const errorMessage = err.response?.data || t('Failed to book seats') || 'Не удалось забронировать места';
            message.error(typeof errorMessage === 'string' ? errorMessage : 'Ошибка бронирования. Места могли быть заняты.');
        } finally {
            setIsBooking(false);
        }
    };

    const handleClose = () => {
        setSelectedSeats([]);
        onClose();
    };

    const renderBusScheme = () => {
        if (isLoading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', width: '100%' }}>
                    <Spin size="large" />
                </div>
            );
        }

        const isSleeperData = seatsData.some(s => s.level === 2 || (s as any).Level === 2);
        const schemeName = (trip?.bus?.seatSchemeName || '').toLowerCase();
        if (isSleeperData || schemeName.includes('sleeper') || schemeName.includes('спальн') || schemeName.includes('спальный')) {
            if (schemeName.includes('36') || seatsData.length <= 38) {
                return <BusSchemeSleeperYutong36 seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
            }
            return <BusSchemeSleeperYutong40 seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
        }

        switch (trip?.bus?.seatSchemeName) {
            // case '49-seats':
            //     return <BusScheme49Seats seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
            default:
                return <BusScheme53Seats seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
        }
    };

    const isSleeper = seatsData.some(s => s.level === 2);

    const getSeatDisplayName = (val: string | number) => {
        const seat = seatsData.find(s => s.id === val || String(s.number) === String(val));
        if (!seat) return val;
        
        let displayName = seat.number || String(val);
        if (displayName === '0') displayName = '01';
        if (displayName === '00') displayName = '02';

        if (isSleeper) {
            const lvlName = seat.level === 2 ? t('Upper') : t('Lower');
            return `${displayName} (${lvlName})`;
        }
        return displayName;
    };

    const readableSelectedSeats = selectedSeats.map(getSeatDisplayName);

    const totalPrice = selectedSeats.reduce((sum: number, val) => {
        const seat = seatsData.find(s => s.id === val || String(s.number) === String(val));
        return sum + (seat?.price || trip.price);
    }, 0);

    return (
        <Modal
            title={<Text strong style={{ fontSize: 20 }}>{trip.bus.brand} {trip.bus.model}</Text>}
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width={1100} // Expanded to fit 14 horizontal seat columns
            destroyOnClose
            className={styles.modal}
        >
            <div className={styles.container}>
                <div className={styles.busLayoutWrapper}>
                    {renderBusScheme()}
                </div>

                <div className={styles.bottomSection}>
                    <div className={styles.legendWrapper}>
                        <Text strong className={styles.legendTitle}>{t('Class ZL')} — {trip.price} ₸</Text>
                        <Flex gap={24} className={styles.legend}>
                            {isSleeper && (
                                <>
                                    <Flex align="center" gap={8} className={styles.legendItem}>
                                        <div style={{ width: 14, height: 14, borderRadius: 2, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}></div>
                                        <Text>Нижние места</Text>
                                    </Flex>
                                    <Flex align="center" gap={8} className={styles.legendItem}>
                                        <div style={{ width: 14, height: 14, borderRadius: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}></div>
                                        <Text>Верхние места</Text>
                                    </Flex>
                                </>
                            )}
                            <Flex align="center" gap={8} className={`${styles.legendItem} ${styles.booked}`}>
                                <div className={`${styles.legendBox}`}></div>
                                <Text>{t('Booked')}</Text>
                            </Flex>
                            <Flex align="center" gap={8} className={`${styles.legendItem} ${styles.selected}`}>
                                <div className={`${styles.legendBox}`} style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', borderColor: '#ca8a04' }}></div>
                                <Text>{t('Selected')}</Text>
                            </Flex>
                        </Flex>
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryText}>
                            <Text type="secondary">{t('Selected seats')}</Text>
                            <Title level={4} style={{ margin: 0 }}>
                                {readableSelectedSeats.length > 0 ? readableSelectedSeats.join(', ') : '-'}
                            </Title>
                        </div>
                        <div className={styles.summaryText}>
                            <Text type="secondary">{t('To pay', 'К оплате')}</Text>
                            <Title level={4} style={{ margin: 0, color: 'var(--color-primary)' }}>
                                {totalPrice} ₸
                            </Title>
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            className={styles.bookButton}
                            onClick={handleBook}
                            disabled={selectedSeats.length === 0}
                            loading={isBooking}
                        >
                            {t('Select', 'Выбрать')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
});
