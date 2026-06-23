import { Card, Col, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./BeketFeatures.module.scss";

const { Title, Text } = Typography;

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function BeketFeatures() {
  const { t } = useTranslation();

  const features: FeatureProps[] = [
    {
      title: t("Быстрая покупка"),
      description: t("Покупайте и бронируйте билеты онлайн всего за пару минут без очередей на автовокзалах."),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: t("Безопасная оплата"),
      description: t("Все платежи надежно защищены 3D-Secure. Ваши платежные данные полностью зашифрованы."),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 11" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: t("Легкий возврат"),
      description: t("Вынуждены отменить поездку? Верните билет в личном кабинете быстро и по правилам перевозчиков."),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12L9 6" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12L9 18" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: t("Поддержка 24/7"),
      description: t("Наша дружелюбная служба заботы поможет решить любой вопрос по поездкам в любое время дня и ночи."),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5C21.0034 12.8198 20.6951 14.1219 20.1 15.3C19.3937 16.7118 18.3129 17.9058 16.96 18.77C15.6071 19.6342 14.0336 20.1336 12.4 20.22C11.0802 20.2234 9.77807 19.9151 8.6 19.32L3 21L4.68 15.4C4.08493 14.2219 3.77661 12.9198 3.78 11.5C3.86638 9.86642 4.36577 8.29288 5.23 6.94C6.0942 5.58714 7.2882 4.50631 8.7 3.8C9.87807 3.20493 11.0802 2.89661 12.4 2.9H12.5C14.7523 2.92212 16.9038 3.83446 18.4905 5.44026C20.0772 7.04605 20.9779 9.20786 21 11.46V11.5Z" stroke="#0091FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <Title level={3} className={styles.sectionTitle}>
          {t("Почему бронируют на Beket?")}
        </Title>
        <Text type="secondary" className={styles.sectionSubtitle}>
          {t("Мы делаем поездки на автобусах доступными, легкими и безопасными")}
        </Text>
      </div>

      <Row gutter={[20, 20]} className={styles.grid}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className={styles.card} bordered={false} hoverable>
              <div className={styles.iconContainer}>{feature.icon}</div>
              <Title level={4} className={styles.cardTitle}>
                {feature.title}
              </Title>
              <Text className={styles.cardDescription}>{feature.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
export default BeketFeatures;
