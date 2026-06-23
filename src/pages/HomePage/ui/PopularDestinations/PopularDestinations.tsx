import { Card, Col, Row, Typography, Badge } from "antd";
import { ArrowRightOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./PopularDestinations.module.scss";

const { Title, Text } = Typography;

interface DestinationCardProps {
  from: string;
  to: string;
  price: string;
  duration: string;
  gradient: string;
}

const destinations: DestinationCardProps[] = [
  {
    from: "Алматы",
    to: "Астана",
    price: "8 500 ₸",
    duration: "12 ч. 30 мин.",
    gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  },
  {
    from: "Алматы",
    to: "Иссык-Куль",
    price: "7 000 ₸",
    duration: "8 ч. 15 мин.",
    gradient: "linear-gradient(135deg, #1d976c 0%, #93f9b9 100%)",
  },
  {
    from: "Шымкент",
    to: "Тараз",
    price: "2 500 ₸",
    duration: "3 ч. 00 мин.",
    gradient: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
  },
  {
    from: "Караганда",
    to: "Астана",
    price: "3 200 ₸",
    duration: "4 ч. 20 мин.",
    gradient: "linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)",
  },
];

export function PopularDestinations() {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <Title level={3} className={styles.sectionTitle}>
          {t("Популярные направления")}
        </Title>
        <Text type="secondary" className={styles.sectionSubtitle}>
          {t("Лучшие цены на популярные автобусные рейсы по Казахстану")}
        </Text>
      </div>

      <Row gutter={[20, 20]} className={styles.grid}>
        {destinations.map((dest, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className={styles.card}
              style={{ background: dest.gradient }}
              bordered={false}
              hoverable
            >
              <div className={styles.cardOverlay}></div>
              <div className={styles.cardContent}>
                <Badge count={t("Популярно")} className={styles.badge} />
                <div className={styles.route}>
                  <Text className={styles.city}>{t(dest.from)}</Text>
                  <ArrowRightOutlined className={styles.arrow} />
                  <Text className={styles.city}>{t(dest.to)}</Text>
                </div>
                <div className={styles.details}>
                  <span className={styles.duration}>
                    <ClockCircleOutlined className={styles.icon} />
                    {dest.duration}
                  </span>
                  <div className={styles.priceContainer}>
                    <span className={styles.priceLabel}>{t("от")}</span>
                    <span className={styles.priceValue}>{dest.price}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
