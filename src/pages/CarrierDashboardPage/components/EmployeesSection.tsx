import { Button, Card, Flex, Switch, Table, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface EmployeesSectionProps {
  employees: any[];
  employeesLoading: boolean;
  onToggleActive: (id: string) => void;
  onStartEdit: (emp: any) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export function EmployeesSection({
  employees,
  employeesLoading,
  onToggleActive,
  onStartEdit,
  onDelete,
  onOpenAddModal,
}: EmployeesSectionProps) {
  const columns = [
    {
      title: "Имя",
      dataIndex: "firstName",
      key: "firstName",
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: "Фамилия",
      dataIndex: "lastName",
      key: "lastName",
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: "Номер телефона (Логин)",
      dataIndex: "phoneNumber",
      key: "phoneNumber"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => text || <Text type="secondary">—</Text>
    },
    {
      title: "Роли",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <Flex gap={4}>
          {roles.map(r => (
            <Tag key={r} color={r === "Admin" ? "blue" : "green"}>{r}</Tag>
          ))}
        </Flex>
      )
    },
    {
      title: "Статус",
      key: "isActive",
      width: 80,
      render: (_: any, record: any) => (
        <Switch
          size="small"
          checked={record.isActive}
          onChange={() => onToggleActive(record.id)}
        />
      )
    },
    {
      title: "Дата создания",
      dataIndex: "createdOn",
      key: "createdOn",
      render: (val: string) => val ? dayjs(val).format("DD.MM.YYYY HH:mm") : "—"
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
            title="Редактировать агента"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            title="Удалить агента"
          />
        </Flex>
      )
    }
  ];

  return (
    <Card
      className={styles.glassCard}
      title={<Title level={4} style={{ margin: 0 }}>Управление агентами автопарка</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal}>
          Добавить агента
        </Button>
      }
    >
      <Table
        dataSource={employees}
        columns={columns}
        rowKey="id"
        loading={employeesLoading}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
}
