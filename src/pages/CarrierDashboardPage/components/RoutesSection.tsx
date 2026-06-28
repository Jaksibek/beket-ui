import { useState } from "react";
import { Button, Card, Flex, Table, Tag, Typography, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface RoutesSectionProps {
  routes: any[];
  loading: boolean;
  profileCarrierId: string | null;
  isAdmin?: boolean;
  onStartEdit: (route: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onSearch?: (params: { search?: string; carrierName?: string }) => void;
}

export function RoutesSection({
  routes,
  loading,
  profileCarrierId,
  isAdmin,
  onStartEdit,
  onDelete,
  onOpenAddModal,
  onSearch,
}: RoutesSectionProps) {
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
      title: "Пункт Отправления",
      key: "from",
      render: (_: any, record: any) => (
        <div style={{ fontSize: 13 }}>
          <Text strong style={{ fontSize: 13 }}>{record.fromCityName ? `${record.fromCityName} (${record.fromStationName})` : (record.fromStationName || "ID: " + record.fromStationId)}</Text>
        </div>
      )
    },
    {
      title: "Пункт Назначения",
      key: "to",
      render: (_: any, record: any) => (
        <div style={{ fontSize: 13 }}>
          <Text strong style={{ fontSize: 13 }}>{record.toCityName ? `${record.toCityName} (${record.toStationName})` : (record.toStationName || "ID: " + record.toStationId)}</Text>
        </div>
      )
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
      title: "Дистанция",
      dataIndex: "distanceKm",
      key: "distanceKm",
      width: 110,
      render: (val: number) => <Tag color="blue" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>{val} км</Tag>
    },
    {
      title: "Действия",
      key: "action",
      width: 90,
      render: (_: any, record: any) => (
        <Flex gap={6}>
          <Button
            size="small"
            icon={<EditOutlined style={{ fontSize: 12 }} />}
            onClick={() => onStartEdit(record)}
            disabled={!profileCarrierId && !isAdmin}
            title="Редактировать"
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined style={{ fontSize: 12 }} />}
            onClick={() => onDelete(record.id)}
            disabled={!profileCarrierId && !isAdmin}
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
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal} disabled={!profileCarrierId && !isAdmin}>
          Добавить маршрут
        </Button>
      }
    >
      <Flex gap={12} style={{ marginBottom: 20 }} wrap="wrap" align="center">
        <Input
          placeholder="Поиск по городу / станции"
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
        dataSource={routes}
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
