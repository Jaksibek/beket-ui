import { Typography, Card, Flex, Divider, Button } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/kk";
import "dayjs/locale/en";
import type { ITrip } from "@/pages/SearchPage";
import styles from "../BookingPage.module.scss";

const { Title, Text } = Typography;

interface BookingSummaryProps {
  trip: ITrip;
  selectedSeats: number[];
  totalPrice: number;
  loading: boolean;
}

export function BookingSummary({ trip, selectedSeats, totalPrice, loading }: BookingSummaryProps) {
  const { t, i18n } = useTranslation();

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

  return (
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
          <Text>
            {selectedSeats.length} {t("взрослых")}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text type="secondary">{t("Места")}:</Text>
          <Text>{selectedSeats.join(", ")}</Text>
        </Flex>
      </Flex>

      <Divider style={{ margin: "24px 0 16px" }} />

      <Flex justify="space-between" align="end" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t("Итого к оплате")}
        </Title>
        <Title level={3} style={{ margin: 0, color: "var(--color-primary)" }}>
          {totalPrice} ₸
        </Title>
      </Flex>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={loading}
        className={styles.submitButton}
      >
        {t("Бронировать")}
      </Button>
    </Card>
  );
}
