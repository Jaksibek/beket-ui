import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Typography, Progress, Flex } from "antd";
import { BarChartOutlined, DollarOutlined, SolutionOutlined, DashboardOutlined } from "@ant-design/icons";
import { authApi } from "@/shared/api";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface SalesStatsSectionProps {
  trips: any[];
  buses: any[];
  loading: boolean;
  profile: {
    contactId: string | null;
    fullName: string | null;
    roles: string[];
  };
}

export function SalesStatsSection({ trips, buses, loading, profile }: SalesStatsSectionProps) {
  // Agent personal offline statistics
  const [loadingAgentStats, setLoadingAgentStats] = useState(false);
  const [agentSalesCount, setAgentSalesCount] = useState(0);
  const [agentSalesSum, setAgentSalesSum] = useState(0);

  useEffect(() => {
    if (!profile?.contactId || trips.length === 0) return;

    let isMounted = true;
    const fetchAllTripSeats = async () => {
      setLoadingAgentStats(true);
      try {
        let count = 0;
        let sum = 0;
        const promises = trips.map(trip => authApi.get(`/api/v1/carrier/trips/${trip.id}/seats`));
        const responses = await Promise.all(promises);
        
        if (!isMounted) return;

        responses.forEach(res => {
          const seatsData = res.data || [];
          seatsData.forEach((s: any) => {
            const isManual = s.passenger?.buyerEmail === "manual@beket.kz";
            if (isManual && s.passenger?.createdById === profile.contactId) {
              count++;
              sum += s.price || 0;
            }
          });
        });

        setAgentSalesCount(count);
        setAgentSalesSum(sum);
      } catch (e) {
        console.error("Error fetching agent stats:", e);
      } finally {
        if (isMounted) setLoadingAgentStats(false);
      }
    };

    fetchAllTripSeats();

    return () => {
      isMounted = false;
    };
  }, [trips, profile?.contactId]);

  // Aggregate statistics
  const totalTrips = trips.length;
  const totalSeats = trips.reduce((acc, t) => acc + (t.totalSeats || 0), 0);
  const totalBooked = trips.reduce((acc, t) => acc + (t.bookedSeats || 0), 0);
  const occupancyRate = totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0;
  const totalRevenue = trips.reduce((acc, t) => acc + ((t.bookedSeats || 0) * (t.price || 0)), 0);

  // Trips breakdown columns
  const columns = [
    {
      title: "Рейс / Маршрут",
      dataIndex: "routeName",
      key: "routeName",
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: "Автобус",
      key: "busPlateNumber",
      render: (_: any, record: any) => {
        const bs = buses.find(b => b.id === record.busId);
        return bs ? <Tag color="purple">{bs.plateNumber}</Tag> : <Tag color="default">{record.busPlateNumber}</Tag>;
      }
    },
    {
      title: "Базовая цена (KZT)",
      dataIndex: "price",
      key: "price",
      render: (val: number) => <Text strong>{val.toLocaleString()} ₸</Text>
    },
    {
      title: "Заполняемость мест",
      key: "occupancy",
      width: 250,
      render: (_: any, record: any) => {
        const pct = record.totalSeats > 0 ? Math.round((record.bookedSeats / record.totalSeats) * 100) : 0;
        return (
          <Flex vertical gap={4} style={{ width: "100%" }}>
            <Progress percent={pct} size="small" status={pct === 100 ? "success" : "active"} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Продано: {record.bookedSeats} из {record.totalSeats}
            </Text>
          </Flex>
        );
      }
    },
    {
      title: "Выручка рейса",
      key: "revenue",
      render: (_: any, record: any) => {
        const rev = (record.bookedSeats || 0) * (record.price || 0);
        return <Text strong style={{ color: "#16a34a", fontSize: 15 }}>{rev.toLocaleString()} ₸</Text>;
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Agent Personal Offline Stats */}
      {profile?.contactId && (
        <div>
          <Title level={5} style={{ margin: "0 0 12px 0", color: "#475569" }}>Личная статистика (Оффлайн)</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card className={styles.glassCard} style={{ margin: 0, padding: 16, background: "rgba(34, 197, 94, 0.02)", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
                <Statistic
                  title="Оформлено мной билетов"
                  value={agentSalesCount}
                  loading={loadingAgentStats}
                  prefix={<SolutionOutlined style={{ color: "#16a34a" }} />}
                  valueStyle={{ color: "#16a34a", fontWeight: "700" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className={styles.glassCard} style={{ margin: 0, padding: 16, background: "rgba(139, 92, 246, 0.02)", border: "1px solid rgba(139, 92, 246, 0.1)" }}>
                <Statistic
                  title="Моя оффлайн-выручка"
                  value={agentSalesSum}
                  suffix=" ₸"
                  loading={loadingAgentStats}
                  prefix={<DollarOutlined style={{ color: "#7c3aed" }} />}
                  valueStyle={{ color: "#7c3aed", fontWeight: "700" }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* General Fleet Metrics */}
      <div>
        <Title level={5} style={{ margin: "0 0 12px 0", color: "#475569" }}>Общие показатели автопарка</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.glassCard} style={{ margin: 0, padding: 16 }}>
              <Statistic
                title="Всего рейсов"
                value={totalTrips}
                prefix={<DashboardOutlined style={{ color: "#3b82f6" }} />}
                valueStyle={{ color: "#3b82f6", fontWeight: "700" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.glassCard} style={{ margin: 0, padding: 16 }}>
              <Statistic
                title="Продано билетов"
                value={totalBooked}
                suffix={`/ ${totalSeats}`}
                prefix={<SolutionOutlined style={{ color: "#10b981" }} />}
                valueStyle={{ color: "#10b981", fontWeight: "700" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.glassCard} style={{ margin: 0, padding: 16 }}>
              <Statistic
                title="Заполняемость"
                value={occupancyRate}
                suffix="%"
                prefix={<BarChartOutlined style={{ color: "#8b5cf6" }} />}
                valueStyle={{ color: "#8b5cf6", fontWeight: "700" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.glassCard} style={{ margin: 0, padding: 16 }}>
              <Statistic
                title="Общая выручка"
                value={totalRevenue}
                suffix=" ₸"
                prefix={<DollarOutlined style={{ color: "#ea580c" }} />}
                valueStyle={{ color: "#ea580c", fontWeight: "700" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Breakdown by trips Table */}
      <Card className={styles.glassCard} title={<Title level={4} style={{ margin: 0 }}>Аналитика по рейсам</Title>}>
        <Table
          dataSource={trips}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}


