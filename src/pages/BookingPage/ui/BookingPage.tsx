import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Row, Col, Form, Button, Flex, message } from "antd";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/shared/config/router";
import { LeftOutlined } from "@ant-design/icons";
import type { BookingLocationState, IBookingFormValues, IBookingSession, BookingStep } from "../model/types";
import { PassengerCard } from "./PassengerCard/PassengerCard";
import { ContactInfo } from "./ContactInfo/ContactInfo";
import { BookingSummary } from "./BookingSummary/BookingSummary";
import { PaymentStep } from "./PaymentStep/PaymentStep";
import { TicketStep } from "./TicketStep/TicketStep";
import styles from "./BookingPage.module.scss";
import API from "@/shared/api";

const { Title } = Typography;

function BookingPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm<IBookingFormValues>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<BookingStep>("form");
    const [session, setSession] = useState<IBookingSession | null>(null);

    const state = location.state as BookingLocationState;

    // Protect route and restore session from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("busgo_booking_session");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as IBookingSession;
                // Calculate expiration using backend's expiresAt
                const expiresTime = new Date(parsed.expiresAt).getTime();
                const remaining = expiresTime - Date.now();
                if (remaining <= 0) {
                    localStorage.removeItem("busgo_booking_session");
                    message.warning(t("Время сессии бронирования истекло") || "Время сессии бронирования истекло");
                    navigate(appRoutes.home);
                } else {
                    setSession(parsed);
                    setStep(parsed.step);
                }
                return;
            } catch (e) {
                console.error("Failed to parse booking session:", e);
            }
        }

        // If no stored session, fallback to router state
        if (!state?.trip || !state?.selectedSeats || state.selectedSeats.length === 0 || !state?.bookingId || !state?.expiresAt) {
            navigate(appRoutes.home);
        } else {
            // Save initial form step session to localStorage so refresh doesn't lose it
            const initialSession: IBookingSession = {
                step: "form",
                trip: state.trip,
                selectedSeats: state.selectedSeats,
                passengers: [],
                email: "",
                phone: "",
                createdAt: Date.now(),
                bookingId: state.bookingId,
                expiresAt: state.expiresAt
            };
            localStorage.setItem("busgo_booking_session", JSON.stringify(initialSession));
            setSession(initialSession);
        }
    }, [state, navigate, t]);

    // Restore form values from loaded session
    useEffect(() => {
        if (session && step === "form") {
            form.setFieldsValue({
                passengers: session.passengers || [],
                email: session.email || "",
                phone: session.phone || ""
            });
        }
    }, [session, step, form]);

    // Update session storage in real-time on value changes to survive page reloads
    const handleValuesChange = (_changedValues: any, allValues: IBookingFormValues) => {
        if (!session) return;
        const updatedSession = {
            ...session,
            passengers: allValues.passengers || [],
            email: allValues.email || "",
            phone: allValues.phone || ""
        };
        setSession(updatedSession);
        localStorage.setItem("busgo_booking_session", JSON.stringify(updatedSession));
    };

    // Handles initial booking form submission
    const onFinish = async (values: IBookingFormValues) => {
        const currentBookingId = session?.bookingId || state?.bookingId;
        const currentExpiresAt = session?.expiresAt || state?.expiresAt;
        const currentTrip = session?.trip || state?.trip;
        const currentSelectedSeats = session?.selectedSeats || state?.selectedSeats;

        if (!currentBookingId || !currentExpiresAt || !currentTrip || !currentSelectedSeats) return;

        setIsSubmitting(true);
        try {
            // Call backend API to confirm passenger details and contact info
            await API.put(`/api/v1/bookings/${currentBookingId}/confirm`, {
                email: values.email,
                phone: values.phone,
                passengers: (values.passengers || []).map((pass, idx) => ({
                    seatNumber: String(currentSelectedSeats[idx]),
                    firstName: pass.firstName,
                    lastName: pass.lastName,
                    middleName: pass.middleName,
                    documentType: pass.documentType,
                    documentNumber: pass.documentNumber,
                    iin: pass.iin
                }))
            });

            const newSession: IBookingSession = {
                step: "payment",
                trip: currentTrip,
                selectedSeats: currentSelectedSeats,
                passengers: values.passengers,
                email: values.email,
                phone: values.phone,
                createdAt: Date.now(),
                bookingId: currentBookingId,
                expiresAt: currentExpiresAt
            };

            localStorage.setItem("busgo_booking_session", JSON.stringify(newSession));
            setSession(newSession);
            setStep("payment");
            message.success(t("Данные пассажиров успешно подтверждены!") || "Данные пассажиров успешно подтверждены!");
        } catch (error: any) {
            console.error("Booking confirmation error:", error);
            const errMsg = error.response?.data || t("Произошла ошибка при бронировании");
            message.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = (ticketId: string) => {
        if (!session) return;

        const updatedSession: IBookingSession = {
            ...session,
            step: "success",
            ticketId
        };

        localStorage.setItem("busgo_booking_session", JSON.stringify(updatedSession));
        setSession(updatedSession);
        setStep("success");
    };

    const handleExpire = () => {
        localStorage.removeItem("busgo_booking_session");
        message.error(t("Время на оплату заказа истекло. Бронь аннулирована.") || "Время на оплату заказа истекло. Бронь аннулирована.");
        navigate(appRoutes.home);
    };

    const handleReset = () => {
        localStorage.removeItem("busgo_booking_session");
        navigate(appRoutes.home);
    };

    // Render step 2: Payment Simulator
    if (step === "payment" && session) {
        return (
            <div className={styles.bookingPage}>
                <Flex align="center" gap={12} className={styles.header} style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>
                        {t("Оплата заказа")}
                    </Title>
                </Flex>
                <PaymentStep
                    trip={session.trip}
                    selectedSeats={session.selectedSeats}
                    passengers={session.passengers}
                    email={session.email}
                    phone={session.phone}
                    bookingId={session.bookingId}
                    expiresAt={session.expiresAt}
                    onPaymentSuccess={handlePaymentSuccess}
                    onExpire={handleExpire}
                />
            </div>
        );
    }

    // Render step 3: Electronic Ticket Success
    if (step === "success" && session) {
        return (
            <div className={styles.bookingPage}>
                <TicketStep
                    trip={session.trip}
                    selectedSeats={session.selectedSeats}
                    passengers={session.passengers}
                    email={session.email}
                    phone={session.phone}
                    ticketId={session.ticketId || ""}
                    onReset={handleReset}
                />
            </div>
        );
    }

    // Render step 1: Form Filling (default fallback)
    const activeTrip = session?.trip || state?.trip;
    const activeSelectedSeats = session?.selectedSeats || state?.selectedSeats;

    if (!activeTrip || !activeSelectedSeats || activeSelectedSeats.length === 0) return null;

    const totalPrice = activeTrip.price * activeSelectedSeats.length;

    return (
        <div className={styles.bookingPage}>
            <Flex align="center" gap={12} className={styles.header}>
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => navigate(-1)}
                    className={styles.backButton}
                />
                <Title level={2} style={{ margin: 0 }}>
                    {t("Оформление заказа")}
                </Title>
            </Flex>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                requiredMark={false}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Flex vertical gap={24}>
                            {activeSelectedSeats.map((seatNumber, index) => (
                                <PassengerCard 
                                    key={seatNumber} 
                                    index={index} 
                                    seatNumber={seatNumber} 
                                />
                            ))}
                            <ContactInfo />
                        </Flex>
                    </Col>
                    <Col xs={24} lg={8}>
                        <BookingSummary 
                            trip={activeTrip} 
                            selectedSeats={activeSelectedSeats} 
                            totalPrice={totalPrice} 
                            loading={isSubmitting} 
                        />
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

export default BookingPage;
