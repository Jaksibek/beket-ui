import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Row, Col, Form, Input, Button, Card, Flex, Divider, Select } from "antd";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/shared/config/router";
import { LeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/kk";
import "dayjs/locale/en";
import type { ITrip } from "@/pages/SearchPage";
import styles from "./BookingPage.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;

interface BookingLocationState {
    trip: ITrip;
    selectedSeats: number[];
}

function BookingPage() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const state = location.state as BookingLocationState;

    // Protect route
    useEffect(() => {
        if (!state?.trip || !state?.selectedSeats || state.selectedSeats.length === 0) {
            navigate(appRoutes.home);
        }
    }, [state, navigate]);

    if (!state?.trip || !state?.selectedSeats) return null;

    const { trip, selectedSeats } = state;
    const totalPrice = trip.price * selectedSeats.length;

    // Helper to format date strings to short format like "25 мар. ср."
    const formatDate = (dateStr: string) => {
        try {
            const lang = i18n.language === "kz" ? "kk" : (i18n.language || "ru");
            return dayjs(dateStr)
                .locale(lang)
                .format(lang === "ru" ? "DD MMM dd" : "DD MMM. dd");
        } catch (e) {
            return dateStr;
        }
    };

    const onFinish = (values: Record<string, unknown>) => {
        console.log("Booking values:", values);
        // Here we would typically make an API call to create the booking
        alert(t("Booking successfully created!") || "Бронь успешно создана!");
        navigate(appRoutes.home);
    };

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
                requiredMark={false}
            >
                <Row gutter={[24, 24]}>
                    {/* Main Content (Forms) */}
                    <Col xs={24} lg={16}>
                        <Flex vertical gap={24}>
                            {selectedSeats.map((seatNumber, index) => (
                                <Card key={seatNumber} className={styles.card} bordered={false}>
                                    <Flex justify="space-between" align="center" className={styles.cardHeader}>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {t("Пассажир")} {index + 1}
                                        </Title>
                                        <Text className={styles.seatBadge}>
                                            {t("Место")} {seatNumber}
                                        </Text>
                                    </Flex>
                                    <Divider style={{ margin: "16px 0" }} />

                                    <Row gutter={16}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["passengers", index, "lastName"]}
                                                label={t("Фамилия")}
                                                rules={[{ required: true, message: t("Введите фамилию") || "Введите фамилию" }]}
                                            >
                                                <Input size="large" placeholder={t("Иванов") || "Иванов"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["passengers", index, "firstName"]}
                                                label={t("Имя")}
                                                rules={[{ required: true, message: t("Введите имя") || "Введите имя" }]}
                                            >
                                                <Input size="large" placeholder={t("Иван") || "Иван"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["passengers", index, "middleName"]}
                                                label={t("Отчество")}
                                            >
                                                <Input size="large" placeholder={t("Иванович") || "Иванович"} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["passengers", index, "documentType"]}
                                                label={t("Тип документа")}
                                                initialValue="id_card"
                                                rules={[{ required: true }]}
                                            >
                                                <Select size="large">
                                                    <Option value="id_card">{t("Удостоверение личности") || "Удостоверение личности"}</Option>
                                                    <Option value="passport">{t("Паспорт") || "Паспорт"}</Option>
                                                    <Option value="birth_certificate">{t("Свидетельство о рождении") || "Свидетельство о рождении"}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["passengers", index, "documentNumber"]}
                                                label={t("Номер документа")}
                                                rules={[{ required: true, message: t("Введите номер документа") || "Введите номер документа" }]}
                                            >
                                                <Input size="large" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["passengers", index, "iin"]}
                                                label={t("ИИН")}
                                                rules={[
                                                    { required: true, message: t("Введите ИИН") || "Введите ИИН" },
                                                    { len: 12, message: t("ИИН должен состоять из 12 цифр") || "ИИН должен состоять из 12 цифр" }
                                                ]}
                                            >
                                                <Input size="large" maxLength={12} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}

                            {/* Contact Details */}
                            <Card className={styles.card} bordered={false}>
                                <Title level={4} style={{ marginTop: 0 }}>
                                    {t("Контактные данные покупателя")}
                                </Title>
                                <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
                                    {t("На этот email и номер телефона мы отправим билеты и чек") || "На этот email и номер телефона мы отправим билеты и чек"}
                                </Text>

                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="email"
                                            label={t("Электронная почта")}
                                            rules={[
                                                { required: true, message: t("Введите email") || "Введите email" },
                                                { type: "email", message: t("Некорректный email") || "Некорректный email" }
                                            ]}
                                        >
                                            <Input size="large" placeholder="example@mail.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="phone"
                                            label={t("Телефон")}
                                            rules={[{ required: true, message: t("Введите телефон") || "Введите телефон" }]}
                                        >
                                            <Input size="large" placeholder="+7 (777) 000-00-00" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Flex>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <Card className={`${styles.card} ${styles.stickySidebar}`} bordered={false}>
                            <Title level={4} style={{ marginTop: 0 }}>
                                {trip.route.fromCity} — {trip.route.toCity}
                            </Title>
                            <Text type="secondary" className={styles.busInfo}>
                                {trip.bus.brand} {trip.bus.model} • {t("Класс ЗЛ")}
                            </Text>

                            <Divider style={{ margin: "16px 0" }} />

                            <Flex vertical gap={12}>
                                <Flex justify="space-between">
                                    <Text type="secondary">{t("Отправление")}:</Text>
                                    <Text>{formatDate(trip.route.departureTime)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text type="secondary">{t("Прибытие")}:</Text>
                                    <Text>{formatDate(trip.route.arrivalTime)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text type="secondary">{t("Пассажиры")}:</Text>
                                    <Text>{selectedSeats.length} {t("взрослых")}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text type="secondary">{t("Места")}:</Text>
                                    <Text>{selectedSeats.join(', ')}</Text>
                                </Flex>
                            </Flex>

                            <Divider style={{ margin: "24px 0 16px" }} />

                            <Flex justify="space-between" align="end" style={{ marginBottom: 24 }}>
                                <Title level={4} style={{ margin: 0 }}>{t("Итого к оплате")}</Title>
                                <Title level={3} style={{ margin: 0, color: '#3a22c5' }}>{totalPrice} ₸</Title>
                            </Flex>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                className={styles.submitButton}
                            >
                                {t("Оплатить")}
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

export default BookingPage;
