import { useState, useEffect, memo } from 'react';
import { Modal, Typography, Button, Flex, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { ITrip } from '@/pages/SearchPage';
import type { ITripSeatsResponse, ISeat } from '@/pages/SearchPage/model/types';
import API from '@/shared/api';
import { BusScheme53Seats } from './BusSchemes/BusScheme53Seats';
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

    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
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

    const handleSeatClick = (seatNumber: number) => {
        setSelectedSeats((prev: number[]) => {
            // If already selected, allow deselection
            if (prev.includes(seatNumber)) {
                return prev.filter((s: number) => s !== seatNumber);
            }
            // If adding a new item, check the maximum allowed threshold (4)
            if (prev.length >= 4) {
                message.warning(t('You can select a maximum of 4 seats') || 'Вы можете выбрать не более 4 мест');
                return prev;
            }
            return [...prev, seatNumber];
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

            // Navigate to booking page, passing state plus the 15-minute lock details
            navigate(appRoutes.booking, {
                state: {
                    trip,
                    selectedSeats,
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

        // We can use a switch statement here to render different constant layouts 
        // based on the bus model or seatSchemeName from the API
        // For demonstration, we default to the 53-seat template.
        switch (trip?.bus?.seatSchemeName) {
            // case '49-seats':
            //     return <BusScheme49Seats seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
            default:
                return <BusScheme53Seats seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seatNum) => {
        const seat = seatsData.find(s => s.number === String(seatNum));
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
                        <Text strong className={styles.legendTitle}>{t('Класс ЗЛ')} — {trip.price} ₸</Text>
                        <Flex gap={24} className={styles.legend}>
                            <Flex align="center" gap={8} className={`${styles.legendItem} ${styles.available}`}>
                                <div className={`${styles.legendBox}`}></div>
                                <Text>{t('Свободно', 'Свободно')}</Text>
                            </Flex>
                            <Flex align="center" gap={8} className={`${styles.legendItem} ${styles.booked}`}>
                                <div className={`${styles.legendBox}`}></div>
                                <Text>{t('Занято', 'Занято')}</Text>
                            </Flex>
                            <Flex align="center" gap={8} className={`${styles.legendItem} ${styles.selected}`}>
                                <div className={`${styles.legendBox}`}></div>
                                <Text>{t('Ваш выбор', 'Ваш выбор')}</Text>
                            </Flex>
                        </Flex>
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryText}>
                            <Text type="secondary">{t('Выбранные места')}</Text>
                            <Title level={4} style={{ margin: 0 }}>
                                {selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}
                            </Title>
                        </div>
                        <div className={styles.summaryText}>
                            <Text type="secondary">{t('К оплате', 'К оплате')}</Text>
                            <Title level={4} style={{ margin: 0, color: '#3a22c5' }}>
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
                            {t('Выбрать', 'Выбрать')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
});
