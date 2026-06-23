import { Card, Flex, Typography, Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import styles from "./TripItemBottom.module.scss";
import { useTranslation } from "react-i18next";

const { Paragraph, Title, Text } = Typography;

interface IProps {
  seatType: string;
  seatsCount: number;
  price: number;
  onSelectSeats?: () => void;
}

function TripItemBottom({ price, seatType, seatsCount, onSelectSeats }: IProps) {
  const { t } = useTranslation();
  const isSeatsLow = seatsCount > 0 && seatsCount < 5;

  return (
    <Flex className={styles.wrapper} gap={10} align="center" justify="space-between">
      <Card className={styles.card}>
        <Paragraph className={styles.desc} type="secondary">
          {seatType} •{" "}
          {isSeatsLow ? (
            <Text className={styles.urgencyText} strong>
              <WarningOutlined style={{ marginRight: 4 }} />
              {t("Осталось всего")} {seatsCount} {t("мест!")}
            </Text>
          ) : (
            <Text style={{ color: "#64748b" }}>
              {seatsCount} {t("мест")}
            </Text>
          )}
        </Paragraph>
        <Title level={5} className={styles.title}>
          {t("Price from")} <span className={styles.priceHighlight}>{price} ₸</span>
        </Title>
      </Card>

      <Button
        type="primary"
        size="large"
        onClick={onSelectSeats}
        className={styles.actionBtn}
      >
        {t("Select Seats") || "Выбрать места"}
      </Button>
    </Flex>
  );
}

export default TripItemBottom;
