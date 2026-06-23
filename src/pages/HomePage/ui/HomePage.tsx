import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { Typography } from "antd";
import styles from "./HomePage.module.scss";
import { useTranslation } from "react-i18next";
import SearchingTicket from "./SearchingTicket/SearchingTicket";
import { StepsTicket } from "@/shared/ui/StepsTicket";
import { useResponsive } from "@/shared/lib/hooks/useResponsive";
import { PopularDestinations } from "./PopularDestinations/PopularDestinations";
import { BeketFeatures } from "./BeketFeatures/BeketFeatures";

const { Title, Paragraph } = Typography;

function HomePage() {
  const { t } = useTranslation();
  const { xs } = useResponsive();

  return (
    <div className={styles.homeWrapper}>
      {/* Immersive Deep Navy Hero section */}
      <div className={styles.heroSection}>
        <Container>
          <div className={styles.heroContent}>
            <Title level={xs ? 3 : 1} className={styles.heroTitle}>
              {t("Быстрые и надежные автобусные рейсы")}
            </Title>
            <Paragraph className={styles.heroSubtitle}>
              {t("Покупайте автобусные билеты онлайн по всему Казахстану и СНГ по выгодным ценам")}
            </Paragraph>
            <SearchingTicket />
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <Section className={styles.mainContent}>
        <Container>
          <StepsTicket />
          <PopularDestinations />
          <BeketFeatures />
        </Container>
      </Section>
    </div>
  );
}

export default HomePage;
