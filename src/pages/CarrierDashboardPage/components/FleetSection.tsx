import { useState } from "react";
import { Button, Card, Flex, Table, Tag, Typography, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface FleetSectionProps {
  buses: any[];
  loading: boolean;
  profileCarrierId: string | null;
  isAdmin?: boolean;
  onStartEdit: (bus: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onSearch?: (params: { search?: string; carrierName?: string; city?: string }) => void;
}

export function FleetSection({
  buses,
  loading,
  profileCarrierId,
  isAdmin,
  onStartEdit,
  onDelete,
  onOpenAddModal,
  onSearch,
}: FleetSectionProps) {
  const [searchPlate, setSearchPlate] = useState("");
  const [searchCarrier, setSearchCarrier] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const handleSearch = () => {
    onSearch?.({
      search: searchPlate,
      carrierName: searchCarrier,
      city: searchCity
    });
  };

  const handleReset = () => {
    setSearchPlate("");
    setSearchCarrier("");
    setSearchCity("");
  };

  const columns = [
    {
      title: "Гос. номер",
      dataIndex: "plateNumber",
      key: "plateNumber",
      width: 110,
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>
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
      title: "Марка",
      dataIndex: "brandName",
      key: "brandName",
      render: (text: string) => text ? <span style={{ fontSize: 13 }}>{text}</span> : <Text type="secondary" style={{ fontSize: 13 }}>—</Text>
    },
    {
      title: "Модель",
      dataIndex: "modelName",
      key: "modelName",
      render: (text: string) => text ? <span style={{ fontSize: 13 }}>{text}</span> : <Text type="secondary" style={{ fontSize: 13 }}>—</Text>
    },
    {
      title: "Цвет",
      dataIndex: "colorName",
      key: "colorName",
      render: (text: string) => text ? <span style={{ fontSize: 13 }}>{text}</span> : <Text type="secondary" style={{ fontSize: 13 }}>—</Text>
    },
    {
      title: "Удобства",
      key: "comfort",
      render: (_: any, record: any) => (
        <Flex gap={4} wrap="wrap">
          {record.hasAC && <Tag color="success" style={{ fontSize: 10, margin: 0, padding: "0 4px" }}>AC</Tag>}
          {record.hasWifi && <Tag color="processing" style={{ fontSize: 10, margin: 0, padding: "0 4px" }}>Wi-Fi</Tag>}
          {record.hasCharger && <Tag color="warning" style={{ fontSize: 10, margin: 0, padding: "0 4px" }}>Зарядки</Tag>}
          {record.hasTv && <Tag color="default" style={{ fontSize: 10, margin: 0, padding: "0 4px" }}>TV</Tag>}
        </Flex>
      )
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
      title={<Title level={4} style={{ margin: 0 }}>Управление автопарком</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal} disabled={!profileCarrierId && !isAdmin}>
          Добавить автобус
        </Button>
      }
    >
      <Flex gap={12} style={{ marginBottom: 20 }} wrap="wrap" align="center">
        <Input
          placeholder="Гос. номер"
          value={searchPlate}
          onChange={e => setSearchPlate(e.target.value)}
          style={{ width: 180 }}
          onPressEnter={handleSearch}
        />
        {!profileCarrierId && (
          <>
            <Input
              placeholder="Автопарк"
              value={searchCarrier}
              onChange={e => setSearchCarrier(e.target.value)}
              style={{ width: 180 }}
              onPressEnter={handleSearch}
            />
            <Input
              placeholder="Город"
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              style={{ width: 180 }}
              onPressEnter={handleSearch}
            />
          </>
        )}
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Найти</Button>
        <Button icon={<UndoOutlined />} onClick={handleReset}>Сбросить</Button>
      </Flex>

      <Table
        dataSource={buses}
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
