import { Button, Card, Flex, Switch, Table, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface TripsSectionProps {
  trips: any[];
  buses: any[];
  isCashier: boolean;
  loading: boolean;
  profileCarrierId: string | null;
  onToggleTripStatus: (id: string) => void;
  onOpenSeatManagement: (trip: any) => void;
  onStartEdit: (trip: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export function TripsSection({
  trips,
  buses,
  isCashier,
  loading,
  profileCarrierId,
  onToggleTripStatus,
  onOpenSeatManagement,
  onStartEdit,
  onDelete,
  onOpenAddModal,
}: TripsSectionProps) {
  const columns = [
    {
      title: "Маршрут",
      key: "routeName",
      render: (_: any, record: any) => {
        return <Text strong>{record.routeName}</Text>;
      }
    },
    {
      title: "Автобус",
      key: "busPlateNumber",
      render: (_: any, record: any) => {
        const bs = buses.find(b => b.id === record.busId);
        return bs ? <Tag color="purple" style={{ fontSize: 13 }}>{bs.plateNumber}</Tag> : <Tag color="default">{record.busPlateNumber}</Tag>;
      }
    },
    {
      title: "Отправление",
      dataIndex: "departureTime",
      key: "departureTime",
      render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
    },
    {
      title: "Прибытие",
      dataIndex: "arrivalTime",
      key: "arrivalTime",
      render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
    },
    {
      title: "Свободные места",
      key: "seatsStat",
      render: (_: any, record: any) => (
        <Tag color={record.freeSeats === 0 ? "error" : "success"} style={{ fontSize: 13 }}>
          {record.freeSeats}
        </Tag>
      )
    },
    {
      title: "Статус",
      key: "status",
      width: 80,
      render: (_: any, record: any) => (
        <Switch
          size="small"
          checked={record.status === 1}
          onChange={() => onToggleTripStatus(record.id)}
          disabled={!profileCarrierId}
        />
      )
    },
    {
      title: "Действия",
      key: "action",
      width: 160,
      render: (_: any, record: any) => (
        <Flex gap={8}>
          {!isCashier && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => onOpenSeatManagement(record)}
              disabled={!profileCarrierId}
              title="Настройка мест и цен"
            />
          )}
          {!isCashier && (
            <Button
              icon={<EditOutlined />}
              onClick={() => onStartEdit(record)}
              disabled={!profileCarrierId}
              title="Редактировать рейс"
            />
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            disabled={!profileCarrierId}
            title="Удалить рейс"
          />
        </Flex>
      )
    }
  ];

  return (
    <Card
      className={styles.glassCard}
      title={<Title level={4} style={{ margin: 0 }}>Планирование рейсов</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal} disabled={!profileCarrierId}>
          Добавить рейс
        </Button>
      }
    >
      <Table
        dataSource={trips}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
}
