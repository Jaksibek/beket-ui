import { useEffect, useState } from "react";
import { Typography, Row, Col, Card, Flex, Divider, Form, Input, Button, Alert, message } from "antd";
import { useTranslation } from "react-i18next";
import { ClockCircleOutlined, CreditCardOutlined, MailOutlined } from "@ant-design/icons";
import type { ITrip } from "@/pages/SearchPage";
import type { IPassenger } from "../../model/types";
import styles from "../BookingPage.module.scss";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/kk";
import "dayjs/locale/en";
import API from '@/shared/api';

const { Title, Text } = Typography;

interface PaymentStepProps {
  trip: ITrip;
  selectedSeats: number[];
  passengers: IPassenger[];
  email: string;
  phone: string;
  bookingId: string;
  expiresAt: string;
  onPaymentSuccess: (ticketId: string) => void;
  onExpire: () => void;
}

export function PaymentStep({
  trip,
  selectedSeats,
  passengers,
  email,
  phone,
  bookingId,
  expiresAt,
  onPaymentSuccess,
  onExpire
}: PaymentStepProps) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(1080); // 18 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Timer effect using expiresAt from backend
  useEffect(() => {
    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      if (remaining <= 0) {
        setTimeLeft(0);
        onExpire();
        return false;
      }
      setTimeLeft(remaining);
      return true;
    };

    calculateTimeLeft(); // initial check
    const interval = setInterval(() => {
      const active = calculateTimeLeft();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePay = async (values: any) => {
    setLoading(true);
    try {
      const response = await API.post(`/api/v1/bookings/${bookingId}/pay`, {
        cardNumber: values.cardNumber,
        expiry: values.expiry,
        cvv: values.cvv,
        cardholderName: values.cardholder
      });
      onPaymentSuccess(response.data.ticketId);
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data || t("Ошибка при проведении платежа");
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Card formatting helpers
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : digits;
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`.substring(0, 5);
    }
    return digits;
  };

  const formatDate = (dateStr: string) => {
    try {
      const lang = i18n.language === "kz" ? "kk" : (i18n.language || "ru");
      return dayjs(dateStr)
        .locale(lang)
        .format("DD MMM. dd.");
    } catch (e) {
      return dateStr;
    }
  };

  const totalPrice = trip.price * selectedSeats.length;

  return (
    <Row gutter={[24, 24]}>
      {/* Payment Details Form */}
      <Col xs={24} lg={16}>
        <Flex vertical gap={24}>
          {/* Notification Alert */}
          <Alert
            message={
              <Flex align="center" gap={12}>
                <MailOutlined style={{ fontSize: 20, color: "var(--color-primary)" }} />
                <div>
                  <Text strong style={{ display: "block" }}>
                    {t("Бронь успешно создана!")}
                  </Text>
                  <Text type="secondary">
                    {t("Детали бронирования и ссылка для оплаты отправлены на email:")}{" "}
                    <Text strong>{email}</Text>
                  </Text>
                </div>
              </Flex>
            }
            type="info"
            showIcon={false}
            style={{ borderRadius: 12, padding: 16 }}
          />

          {/* Reserved Seats List */}
          <Card className={styles.card} bordered={false}>
            <Title level={4} style={{ marginTop: 0 }}>
              {t("Зарезервированные места")}
            </Title>
            <Divider style={{ margin: "16px 0" }} />
            <Flex vertical gap={12}>
              {passengers.map((passenger, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <div>
                    <Text strong>
                      {passenger.lastName} {passenger.firstName}
                    </Text>
                    <Text type="secondary" style={{ display: "block", fontSize: 13 }}>
                      {passenger.documentType === "foreign_passport"
                        ? t("Иностранный паспорт")
                        : t("Документ")}{": "}{passenger.documentNumber}
                    </Text>
                  </div>
                  <Text className={styles.seatBadge}>
                    {t("Место")} {selectedSeats[index]}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Card>

          {/* Simulated Card Payment Form */}
          <Card className={styles.card} bordered={false}>
            <Title level={4} style={{ marginTop: 0 }}>
              <CreditCardOutlined style={{ marginRight: 8, color: "var(--color-primary)" }} />
              {t("Оплата картой")}
            </Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
              {t("Симуляция безопасной оплаты билета банковской картой")}
            </Text>
            <Form form={form} layout="vertical" onFinish={handlePay}>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="cardNumber"
                    label={t("Номер карты")}
                    getValueFromEvent={(e) => formatCardNumber(e.target.value)}
                    rules={[
                      { required: true, message: t("Введите номер карты") },
                      { len: 19, message: t("Номер карты должен содержать 16 цифр") }
                    ]}
                  >
                    <Input size="large" placeholder="0000 0000 0000 0000" maxLength={19} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    name="expiry"
                    label={t("Срок действия")}
                    getValueFromEvent={(e) => formatExpiry(e.target.value)}
                    rules={[
                      { required: true, message: t("Укажите срок действия") },
                      { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: t("Формат MM/YY") }
                    ]}
                  >
                    <Input size="large" placeholder="MM/YY" maxLength={5} />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    name="cvv"
                    label="CVV / CVC"
                    rules={[
                      { required: true, message: t("Введите CVV код") },
                      { len: 3, message: t("Должно быть 3 цифры") },
                      { pattern: /^\d{3}$/, message: t("Только цифры") }
                    ]}
                  >
                    <Input.Password size="large" placeholder="123" maxLength={3} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="cardholder"
                    label={t("Имя владельца карты")}
                    rules={[{ required: true, message: t("Введите имя на латинице") }]}
                  >
                    <Input size="large" placeholder="IVAN IVANOV" style={{ textTransform: "uppercase" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ margin: "24px 0 16px" }} />
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className={styles.submitButton}
              >
                {t("Оплатить")} {totalPrice} ₸
              </Button>
            </Form>
          </Card>
        </Flex>
      </Col>

      {/* Countdown Timer and Sidebar info */}
      <Col xs={24} lg={8}>
        <Flex vertical gap={24}>
          {/* Timer Card */}
          <Card
            className={styles.card}
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #fff1f0 0%, #fff 100%)",
              border: "1px solid #ffa39e"
            }}
          >
            <Flex vertical align="center" gap={8}>
              <ClockCircleOutlined style={{ fontSize: 32, color: "#f5222d" }} />
              <Text strong style={{ fontSize: 14, color: "#cf1322" }}>
                {t("Осталось времени на оплату")}
              </Text>
              <Title level={2} style={{ margin: 0, color: "#cf1322", fontFamily: "monospace" }}>
                {formatTimer(timeLeft)}
              </Title>
              <Text type="secondary" style={{ textAlign: "center", fontSize: 12 }}>
                {t("По истечении этого времени ваша бронь автоматически аннулируется")}
              </Text>
            </Flex>
          </Card>

          {/* Trip Summary Card */}
          <Card className={styles.card} bordered={false}>
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
                <Text>
                  {selectedSeats.length} {t("взрослых")}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text type="secondary">{t("Места")}:</Text>
                <Text>{selectedSeats.join(", ")}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text type="secondary">{t("Телефон")}:</Text>
                <Text>{phone}</Text>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Col>
    </Row>
  );
}
