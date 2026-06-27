import { Button, Card, Flex, Table, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface RoutesSectionProps {
  routes: any[];
  loading: boolean;
  profileCarrierId: string | null;
  onStartEdit: (route: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export function RoutesSection({
  routes,
  loading,
  profileCarrierId,
  onStartEdit,
  onDelete,
  onOpenAddModal,
}: RoutesSectionProps) {
  const columns = [
    {
      title: "Пункт Отправления",
      key: "from",
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.fromCityName ? `${record.fromCityName} (${record.fromStationName})` : (record.fromStationName || "ID: " + record.fromStationId)}</Text>
        </div>
      )
    },
    {
      title: "Пункт Назначения",
      key: "to",
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.toCityName ? `${record.toCityName} (${record.toStationName})` : (record.toStationName || "ID: " + record.toStationId)}</Text>
        </div>
      )
    },
    {
      title: "Дистанция",
      dataIndex: "distanceKm",
      key: "distanceKm",
      render: (val: number) => <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>{val} км</Tag>
    },
    {
      title: "Действия",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Flex gap={8}>
          <Button
            icon={<EditOutlined />}
            onClick={() => onStartEdit(record)}
            disabled={!profileCarrierId}
            title="Редактировать"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            disabled={!profileCarrierId}
            title="Удалить"
          />
        </Flex>
      )
    }
  ];

  return (
    <Card
      className={styles.glassCard}
      title={<Title level={4} style={{ margin: 0 }}>Направления / Маршруты</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal} disabled={!profileCarrierId}>
          Добавить маршрут
        </Button>
      }
    >
      <Table
        dataSource={routes}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
}
