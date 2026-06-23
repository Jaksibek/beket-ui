import { useEffect, useState } from "react";
import { Table, Button, Typography, message, Modal, Form, Input, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { authApi } from "@/shared/api";
import styles from "./CarrierFleetPage.module.scss";

const { Title } = Typography;

function CarrierFleetPage() {
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await authApi.get("/api/Buses");
            setBuses(res.data);
        } catch (err: any) {
            console.error(err);
            message.error("Не удалось загрузить автопарк");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    const handleAddBus = async (values: any) => {
        try {
            await authApi.post("/api/Buses", {
                plateNumber: values.plateNumber,
                hasAC: values.hasAC || false,
                hasCharger: values.hasCharger || false,
                hasWifi: values.hasWifi || false,
                hasTv: values.hasTv || false,
            });
            message.success("Автобус успешно добавлен");
            setIsModalVisible(false);
            form.resetFields();
            fetchBuses();
        } catch (err: any) {
            console.error(err);
            message.error("Ошибка при добавлении автобуса");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Удалить этот автобус?")) return;
        try {
            await authApi.delete(`/api/Buses/${id}`);
            message.success("Автобус удален");
            fetchBuses();
        } catch (err: any) {
            console.error(err);
            message.error(err.response?.data?.title || err.response?.data || "Ошибка удаления");
        }
    };

    const columns = [
        {
            title: "Гос. номер",
            dataIndex: "plateNumber",
            key: "plateNumber",
        },
        {
            title: "Кондиционер",
            dataIndex: "hasAC",
            key: "hasAC",
            render: (val: boolean) => (val ? "Да" : "Нет"),
        },
        {
            title: "Wi-Fi",
            dataIndex: "hasWifi",
            key: "hasWifi",
            render: (val: boolean) => (val ? "Да" : "Нет"),
        },
        {
            title: "Действия",
            key: "action",
            render: (_: any, record: any) => (
                <Button danger onClick={() => handleDelete(record.id)}>
                    Удалить
                </Button>
            ),
        },
    ];

    return (
        <Section className={styles.fleetSection}>
            <Container>
                <div className={styles.headerRow}>
                    <Title level={3}>Мой автопарк</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Добавить автобус
                    </Button>
                </div>

                <Table
                    dataSource={buses}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    bordered
                />

                <Modal
                    title="Добавить новый автобус"
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                    }}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleAddBus}>
                        <Form.Item
                            name="plateNumber"
                            label="Государственный номер"
                            rules={[{ required: true, message: "Введите гос. номер" }]}
                        >
                            <Input placeholder="Например: 123ABC01" />
                        </Form.Item>
                        <Form.Item name="hasAC" valuePropName="checked" label="Есть кондиционер?">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="hasWifi" valuePropName="checked" label="Есть Wi-Fi?">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="hasCharger" valuePropName="checked" label="Есть зарядки?">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="hasTv" valuePropName="checked" label="Есть TV?">
                            <Switch />
                        </Form.Item>
                    </Form>
                </Modal>
            </Container>
        </Section>
    );
}

export default CarrierFleetPage;
