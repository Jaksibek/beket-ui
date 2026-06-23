import { Layout, Flex, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import styles from "./FooterNav.module.scss";
import { appRoutes } from "@/shared/config/router";
import { useTranslation } from "react-i18next";
import {
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

function FooterNav() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <Row gutter={[30, 40]} className={styles.grid}>
          {/* Column 1: Logo and brand bio */}
          <Col xs={24} md={8} lg={7} className={styles.col}>
            <Flex vertical gap={16}>
              <div className={styles.footerLogo}>
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.logoIcon}
                >
                  <rect width="32" height="32" rx="9" fill="url(#blueFooterGradient)" />
                  <path
                    d="M8 16C8 11.58 11.58 8 16 8C20.42 8 24 11.58 24 16C24 18.5 22 21.5 19 23"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 23H23"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="16" cy="16" r="3" fill="white" />
                  <defs>
                    <linearGradient
                      id="blueFooterGradient"
                      x1="0"
                      y1="0"
                      x2="32"
                      y2="32"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#00C6FF" />
                      <stop offset="1" stopColor="#0072FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className={styles.logoText}>
                  BEKET<span className={styles.logoSubtext}>travel</span>
                </span>
              </div>
              <Paragraph className={styles.bioText}>
                {t(
                  "Быстрое и надежное бронирование автобусных билетов онлайн по всему Казахстану и странам СНГ по официальным тарифам автовокзалов."
                )}
              </Paragraph>
              <Flex gap={12} className={styles.socials}>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialLink}>
                  <InstagramOutlined />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className={styles.socialLink}>
                  <FacebookOutlined />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className={styles.socialLink}>
                  <TwitterOutlined />
                </a>
              </Flex>
            </Flex>
          </Col>

          {/* Column 2: Navigation Links */}
          <Col xs={12} sm={8} md={5} lg={5} className={styles.col}>
            <Title level={5} className={styles.colTitle}>
              {t("Навигация")}
            </Title>
            <ul className={styles.linkList}>
              <li>
                <Link to={appRoutes.home}>{t("Главная")}</Link>
              </li>
              <li>
                <Link to={appRoutes.about}>{t("О проекте")}</Link>
              </li>
              <li>
                <Link to={appRoutes.carrierLogin}>{t("Личный кабинет")}</Link>
              </li>
            </ul>
          </Col>

          {/* Column 3: Passenger Resources */}
          <Col xs={12} sm={8} md={5} lg={5} className={styles.col}>
            <Title level={5} className={styles.colTitle}>
              {t("Пассажирам")}
            </Title>
            <ul className={styles.linkList}>
              <li>
                <a href="#faq">{t("Вопросы и ответы")}</a>
              </li>
              <li>
                <a href="#refund">{t("Правила возврата")}</a>
              </li>
              <li>
                <a href="#payment">{t("Способы оплаты")}</a>
              </li>
            </ul>
          </Col>

          {/* Column 4: Contact details */}
          <Col xs={24} sm={8} md={6} lg={7} className={styles.col}>
            <Title level={5} className={styles.colTitle}>
              {t("Служба заботы")}
            </Title>
            <Flex vertical gap={12} className={styles.contactBlock}>
              <Flex gap={10} align="center">
                <PhoneOutlined className={styles.contactIcon} />
                <a href="tel:+77273560606" className={styles.phoneLink}>
                  +7 (727) 356-06-06
                </a>
              </Flex>
              <Flex gap={10} align="center">
                <MailOutlined className={styles.contactIcon} />
                <a href="mailto:support@beket.travel" className={styles.emailLink}>
                  support@beket.travel
                </a>
              </Flex>
              <Flex gap={10} align="center">
                <ClockCircleOutlined className={styles.contactIcon} />
                <Text className={styles.contactText}>
                  {t("Круглосуточно")} 24/7
                </Text>
              </Flex>
            </Flex>
          </Col>
        </Row>

        {/* Bottom copyright notice */}
        <div className={styles.footerBottom}>
          <Text className={styles.copyright}>
            © {currentYear} Beket Travel. {t("Все права защищены.")} {t("ИП BEKET-BUSGO")}.
          </Text>
        </div>
      </div>
    </Footer>
  );
}

export default FooterNav;
