import { useState } from "react";
import { Button, Card, Flex, Switch, Table, Tag, Typography, Input } from "antd";
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
  const [searchQuery, setSearchQuery] = useState("");
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
      title: "Компания",
      key: "carrierName",
      render: (_: any, record: any) => {
        const name = record.carrierName || record.CarrierName;
        return name ? <Tag color="purple">{name}</Tag> : <Text type="secondary">—</Text>;
      }
    },
    {
      title: "Роль",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => {
        const getRoleTag = (r: string) => {
          switch (r) {
            case "Admin": return <Tag color="blue" key={r}>Администратор</Tag>;
            case "Agent": return <Tag color="green" key={r}>Агент</Tag>;
            case "Carrier": return <Tag color="orange" key={r}>Перевозчик</Tag>;
            default: return <Tag color="default" key={r}>{r}</Tag>;
          }
        };
        return (
          <Flex gap={4}>
            {(roles || []).map(getRoleTag)}
          </Flex>
        );
      }
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
            title="Редактировать сотрудника"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            title="Удалить сотрудника"
          />
        </Flex>
      )
    }
  ];

  const filteredEmployees = employees.filter((emp: any) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
    const phone = (emp.phoneNumber || "").toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const company = (emp.carrierName || emp.CarrierName || "").toLowerCase();

    // Check role translations as well
    const rolesStr = (emp.roles || []).map((r: string) => {
      if (r === "Admin") return "администратор";
      if (r === "Agent") return "агент кассир";
      if (r === "Carrier") return "перевозчик";
      return r.toLowerCase();
    }).join(" ");

    return (
      fullName.includes(query) ||
      phone.includes(query) ||
      email.includes(query) ||
      rolesStr.includes(query) ||
      company.includes(query)
    );
  });

  return (
    <Card
      className={styles.glassCard}
      title={<Title level={4} style={{ margin: 0 }}>Управление сотрудниками автопарка</Title>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddModal}>
          Добавить сотрудника
        </Button>
      }
    >
      <Flex vertical gap={16}>
        <Input.Search
          placeholder="Поиск сотрудника по имени, телефону, email или роли..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 400 }}
        />
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          rowKey="id"
          loading={employeesLoading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Flex>
    </Card>
  );
}
