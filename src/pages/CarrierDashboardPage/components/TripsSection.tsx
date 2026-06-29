import { useState } from "react";
import { Button, Card, Flex, Switch, Table, Tag, Typography, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface TripsSectionProps {
  trips: any[];
  buses: any[];
  isCashier: boolean;
  loading: boolean;
  profileCarrierId: string | null;
  isAdmin?: boolean;
  onToggleTripStatus: (id: string) => void;
  onOpenSeatManagement: (trip: any) => void;
  onStartEdit: (trip: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onSearch?: (params: { search?: string; carrierName?: string }) => void;
}

export function TripsSection({
  trips,
  buses,
  isCashier,
  loading,
  profileCarrierId,
  isAdmin,
  onToggleTripStatus,
  onOpenSeatManagement,
  onStartEdit,
  onDelete,
  onOpenAddModal,
  onSearch,
}: TripsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [searchCarrier, setSearchCarrier] = useState("");

  const handleSearch = () => {
    onSearch?.({
      search: searchText,
      carrierName: searchCarrier,
    });
  };

  const handleReset = () => {
    setSearchText("");
    setSearchCarrier("");
  };

  const columns = [
    {
      title: "Маршрут",
      key: "routeName",
      render: (_: any, record: any) => {
        const name = record.routeName || "";
        const parts = name.split(" → ");
        if (parts.length < 2) return <Text strong style={{ fontSize: 13 }}>{name}</Text>;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, lineHeight: "1.2", minWidth: 150 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{parts[0]}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", display: "inline-block", margin: "2px 0 2px 4px" }}>↓</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{parts[1]}</span>
          </div>
        );
      }
    },
    ...(!profileCarrierId ? [
      {
        title: "Автопарк",
        dataIndex: "carrierName",
        key: "carrierName",
        render: (_: any, record: any) => {
          const name = record.carrierName || record.CarrierName;
          return name ? <span style={{ fontSize: 13 }}>{name}</span> : <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        }
      }
    ] : []),
    {
      title: "Автобус",
      key: "busPlateNumber",
      render: (_: any, record: any) => {
        const bs = buses.find(b => b.id === record.busId);
        return bs ? <Tag color="purple" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>{bs.plateNumber}</Tag> : <Tag color="default" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>{record.busPlateNumber}</Tag>;
      }
    },
    {
      title: "Отправление",
      dataIndex: "departureTime",
      key: "departureTime",
      render: (val: string) => <span style={{ fontSize: 13 }}>{dayjs(val).format("DD.MM.YYYY HH:mm")}</span>
    },
    {
      title: "Прибытие",
      dataIndex: "arrivalTime",
      key: "arrivalTime",
      render: (val: string) => <span style={{ fontSize: 13 }}>{dayjs(val).format("DD.MM.YYYY HH:mm")}</span>
    },
    {
      title: "Свободные места",
      key: "seatsStat",
      render: (_: any, record: any) => (
        <Tag color={record.freeSeats === 0 ? "error" : "success"} style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>
          {record.freeSeats}
        </Tag>
      )
    },
    {
      title: "Статус",
      key: "status",
      width: 70,
      render: (_: any, record: any) => (
        <Switch
          size="small"
          checked={record.status === 1}
          onChange={() => onToggleTripStatus(record.id)}
          disabled={!profileCarrierId && !isAdmin}
        />
      )
    },
    {
      title: "Действия",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Flex gap={6}>
          {!isCashier && (
            <Button
              size="small"
              icon={<SettingOutlined style={{ fontSize: 12 }} />}
              onClick={() => onOpenSeatManagement(record)}
              disabled={!profileCarrierId && !isAdmin}
              title="Настройка мест и цен"
            />
          )}
          {!isCashier && (
            <Button
              size="small"
              icon={<EditOutlined style={{ fontSize: 12 }} />}
              onClick={() => onStartEdit(record)}
              disabled={!profileCarrierId && !isAdmin}
              title="Редактировать рейс"
            />
          )}
          <Button
            danger
            size="small"
            icon={<DeleteOutlined style={{ fontSize: 12 }} />}
            onClick={() => onDelete(record.id)}
            disabled={!profileCarrierId && !isAdmin}
            title="Удалить рейс"
          />
        </Flex>
      )
    }
  ];

  return (
    <Card
      className={styles.glassCard}
      title={<Title level={4} style={{ margin: 0 }}>Расписание рейсов</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal} disabled={!profileCarrierId && !isAdmin}>
          Добавить рейс
        </Button>
      }
    >
      <Flex gap={12} style={{ marginBottom: 20 }} wrap="wrap" align="center">
        <Input
          placeholder="Поиск рейса / станции"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 220 }}
          onPressEnter={handleSearch}
        />
        {!profileCarrierId && (
          <Input
            placeholder="Автопарк"
            value={searchCarrier}
            onChange={e => setSearchCarrier(e.target.value)}
            style={{ width: 180 }}
            onPressEnter={handleSearch}
          />
        )}
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Найти</Button>
        <Button icon={<UndoOutlined />} onClick={handleReset}>Сбросить</Button>
      </Flex>

      <Table
        dataSource={trips}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
}
