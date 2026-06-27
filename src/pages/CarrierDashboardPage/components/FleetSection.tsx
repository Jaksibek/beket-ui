import { Button, Card, Flex, Table, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface FleetSectionProps {
  buses: any[];
  loading: boolean;
  profileCarrierId: string | null;
  onStartEdit: (bus: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export function FleetSection({
  buses,
  loading,
  profileCarrierId,
  onStartEdit,
  onDelete,
  onOpenAddModal,
}: FleetSectionProps) {
  const columns = [
    {
      title: "Гос. номер",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text: string) => <Text strong style={{ fontSize: 15 }}>{text}</Text>
    },
    {
      title: "Марка",
      dataIndex: "brandName",
      key: "brandName",
      render: (text: string) => text || <Text type="secondary">—</Text>
    },
    {
      title: "Модель",
      dataIndex: "modelName",
      key: "modelName",
      render: (text: string) => text || <Text type="secondary">—</Text>
    },
    {
      title: "Цвет",
      dataIndex: "colorName",
      key: "colorName",
      render: (text: string) => text || <Text type="secondary">—</Text>
    },
    {
      title: "Удобства",
      key: "comfort",
      render: (_: any, record: any) => (
        <Flex gap={4} wrap="wrap">
          {record.hasAC && <Tag color="success" className={styles.comfortTag}>AC</Tag>}
          {record.hasWifi && <Tag color="processing" className={styles.comfortTag}>Wi-Fi</Tag>}
          {record.hasCharger && <Tag color="warning" className={styles.comfortTag}>Зарядки</Tag>}
          {record.hasTv && <Tag color="default" className={styles.comfortTag}>TV</Tag>}
        </Flex>
      )
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
      title={<Title level={4} style={{ margin: 0 }}>Управление автобусами</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal} disabled={!profileCarrierId}>
          Добавить автобус
        </Button>
      }
    >
      <Table
        dataSource={buses}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
}
