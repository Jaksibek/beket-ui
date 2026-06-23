import { Typography, Card, Row, Col, Statistic, Button } from "antd";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { appRoutes } from "@/shared/config/router";
import { useNavigate } from "react-router-dom";
import styles from "./CarrierDashboardPage.module.scss";

const { Title } = Typography;

function CarrierDashboardPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("carrier_token");
        navigate(appRoutes.carrierLogin);
    };

    return (
        <Section className={styles.dashboardSection}>
            <Container>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2}>Кабинет Перевозчика</Title>
                    <Button onClick={handleLogout} danger>Выйти</Button>
                </div>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card hoverable onClick={() => navigate(appRoutes.carrierFleet)}>
                            <Statistic title="Мой Автопарк" value="Управление автобусами" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card hoverable onClick={() => navigate(appRoutes.carrierRoutes)}>
                            <Statistic title="Мои Направления" value="Управление маршрутами" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card hoverable onClick={() => navigate(appRoutes.carrierTrips)}>
                            <Statistic title="Ближайшие Рейсы" value="Управление расписанием" />
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Section>
    );
}

export default CarrierDashboardPage;
