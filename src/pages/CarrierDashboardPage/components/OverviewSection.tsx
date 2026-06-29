import { Card, Col, Row, Statistic, Tag, Typography } from "antd";
import { CarOutlined, CompassOutlined, CalendarOutlined } from "@ant-design/icons";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Text } = Typography;

interface OverviewSectionProps {
  busesCount: number;
  routesCount: number;
  tripsCount: number;
  profile: {
    carrierName: string | null;
    fullName: string | null;
    email: string | null;
  };
  onNavigateTab: (key: string) => void;
}

export function OverviewSection({
  busesCount,
  routesCount,
  tripsCount,
  profile,
  onNavigateTab,
}: OverviewSectionProps) {
  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} sm={8}>
        <Card className={`${styles.glassCard} ${styles.hoverEffect}`} onClick={() => onNavigateTab("fleet")}>
          <Statistic
            title="Автобусов в парке"
            value={busesCount}
            prefix={<CarOutlined style={{ color: "#3b82f6" }} />}
            valueStyle={{ color: "#3b82f6", fontWeight: "700" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card className={`${styles.glassCard} ${styles.hoverEffect}`} onClick={() => onNavigateTab("routes")}>
          <Statistic
            title="Направлений маршрутов"
            value={routesCount}
            prefix={<CompassOutlined style={{ color: "#10b981" }} />}
            valueStyle={{ color: "#10b981", fontWeight: "700" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card className={`${styles.glassCard} ${styles.hoverEffect}`} onClick={() => onNavigateTab("trips")}>
          <Statistic
            title="Рейсов в расписании"
            value={tripsCount}
            prefix={<CalendarOutlined style={{ color: "#8b5cf6" }} />}
            valueStyle={{ color: "#8b5cf6", fontWeight: "700" }}
          />
        </Card>
      </Col>

      {/* Useful Carrier details card */}
      <Col span={24}>
        <Card className={styles.glassCard} title="Информация об организации">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Наименование автопарка</Text>
                <Text strong style={{ fontSize: 16, color: "#1e293b" }}>{profile.carrierName || "Не привязан"}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Администратор</Text>
                <Text strong style={{ fontSize: 15, color: "#1e293b" }}>{profile.fullName || "—"}</Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Контактный Email</Text>
                <Text strong style={{ fontSize: 15, color: "#1e293b" }}>{profile.email || "—"}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Статус верификации</Text>
                <Tag color={profile.carrierName ? "success" : "error"} style={{ marginTop: 4 }}>
                  {profile.carrierName ? "Подтвержденный автопарк" : "Автопарк не настроен"}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card className={styles.glassCard} title="Добро пожаловать в Кабинет автопарка">
          <Typography.Paragraph style={{ fontSize: 15 }}>
            Здесь вы можете полноценно управлять автобусным парком вашего предприятия, создавать регулярные маршруты следования, а также планировать расписание поездок.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: 15 }}>
            Используйте меню слева для переключения разделов. На вкладке <strong>Рейсы</strong> вы можете управлять свободными местами: переопределять цены для каждого места отдельно и продавать билеты оффлайн пассажирам, обратившимся к вам напрямую.
          </Typography.Paragraph>
        </Card>
      </Col>
    </Row>
  );
}
