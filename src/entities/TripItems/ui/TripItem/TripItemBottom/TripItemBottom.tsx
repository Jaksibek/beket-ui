import { Card, Flex, Typography, Button } from "antd";
import styles from "./TripItemBottom.module.scss";
import { useTranslation } from "react-i18next";

const { Paragraph, Title } = Typography;

interface IProps {
  seatType: string;
  seatsCount: number;
  price: number;
  onSelectSeats?: () => void;
}

function TripItemBottom({ price, seatType, seatsCount, onSelectSeats }: IProps) {
  const { t } = useTranslation();

  return (
    <Flex className={styles.wrapper} gap={10} align="center" justify="space-between">
      <Card className={styles.card}>
        <Paragraph className={styles.desc} type="secondary">
          {seatType} {seatsCount}
        </Paragraph>
        <Title level={5} className={styles.title}>
          {t("Price from")} {price} ₸
        </Title>
      </Card>

      <Button
        type="primary"
        size="large"
        onClick={onSelectSeats}
        style={{ height: 'auto', padding: '12px 24px', borderRadius: '12px', flex: 1, maxWidth: '200px' }}
      >
        {t("Select Seats") || "Выбрать место"}
      </Button>
    </Flex>
  );
}

export default TripItemBottom;
