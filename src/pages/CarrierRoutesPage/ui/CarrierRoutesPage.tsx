import { useEffect, useState } from "react";
import { Table, Button, Typography, message, Modal, Form, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { authApi } from "@/shared/api";
import styles from "./CarrierRoutesPage.module.scss";

const { Title } = Typography;

function CarrierRoutesPage() {
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const res = await authApi.get("/api/RoutesCarrier");
            setRoutes(res.data);
        } catch (err: any) {
            console.error(err);
            message.error("Не удалось загрузить маршруты");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleAddRoute = async (values: any) => {
        try {
            await authApi.post("/api/RoutesCarrier", {
                fromStationId: values.fromStationId,
                toStationId: values.toStationId,
                distanceKm: values.distanceKm,
            });
            message.success("Маршрут успешно добавлен");
            setIsModalVisible(false);
            form.resetFields();
            fetchRoutes();
        } catch (err: any) {
            console.error(err);
            message.error("Ошибка при добавлении маршрута");
        }
    };

    const columns = [
        {
            title: "Откуда (ID станции)",
            dataIndex: "fromStationId",
            key: "fromStationId",
        },
        {
            title: "Куда (ID станции)",
            dataIndex: "toStationId",
            key: "toStationId",
        },
        {
            title: "Дистанция (км)",
            dataIndex: "distanceKm",
            key: "distanceKm",
        }
    ];

    return (
        <Section className={styles.routesSection}>
            <Container>
                <div className={styles.headerRow}>
                    <Title level={3}>Направления / Маршруты</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Добавить маршрут
                    </Button>
                </div>

                <Table
                    dataSource={routes}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    bordered
                />

                <Modal
                    title="Новый маршрут"
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                    }}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleAddRoute}>
                        <Form.Item
                            name="fromStationId"
                            label="ID Станции Отправления (число)"
                            rules={[{ required: true, message: "Введите ID станции" }]}
                        >
                            <InputNumber style={{ width: "100%" }} placeholder="1" />
                        </Form.Item>
                        <Form.Item
                            name="toStationId"
                            label="ID Станции Прибытия (число)"
                            rules={[{ required: true, message: "Введите ID станции" }]}
                        >
                            <InputNumber style={{ width: "100%" }} placeholder="2" />
                        </Form.Item>
                        <Form.Item
                            name="distanceKm"
                            label="Расстояние (в км)"
                            rules={[{ required: true, message: "Укажите дистанцию" }]}
                        >
                            <InputNumber style={{ width: "100%" }} placeholder="500" />
                        </Form.Item>
                    </Form>
                </Modal>
            </Container>
        </Section>
    );
}

export default CarrierRoutesPage;
