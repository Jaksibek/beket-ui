import { useEffect, useState } from "react";
import { Table, Button, Typography, message, Modal, Form, Select, DatePicker, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { authApi } from "@/shared/api";
import dayjs from "dayjs";
import styles from "./CarrierTripsPage.module.scss";

const { Title } = Typography;

function CarrierTripsPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await authApi.get("/api/TripsCarrier");
            setTrips(res.data);
        } catch (err: any) {
            console.error(err);
            message.error("Не удалось загрузить рейсы");
        } finally {
            setLoading(false);
        }
    };

    const fetchDependencies = async () => {
        try {
            const [busRes, routeRes] = await Promise.all([
                authApi.get("/api/Buses"),
                authApi.get("/api/RoutesCarrier")
            ]);
            setBuses(busRes.data);
            setRoutes(routeRes.data);
        } catch (err: any) {
            console.error(err);
            message.error("Не удалось загрузить справочники");
        }
    };

    useEffect(() => {
        fetchTrips();
        fetchDependencies();
    }, []);

    const handleAddTrip = async (values: any) => {
        try {
            await authApi.post("/api/TripsCarrier", {
                routeId: values.routeId,
                busId: values.busId,
                departureTime: values.time[0].toISOString(),
                arrivalTime: values.time[1].toISOString(),
                price: values.price,
            });
            message.success("Рейс успешно добавлен (Места сгенерированы!)");
            setIsModalVisible(false);
            form.resetFields();
            fetchTrips();
        } catch (err: any) {
            console.error(err);
            message.error("Ошибка при создании рейса");
        }
    };

    const columns = [
        {
            title: "ID Маршрута",
            dataIndex: "routeId",
            key: "routeId",
        },
        {
            title: "Автобус (ID)",
            dataIndex: "busId",
            key: "busId",
        },
        {
            title: "Отправление",
            dataIndex: "departureTime",
            key: "departureTime",
            render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm"),
        },
        {
            title: "Прибытие",
            dataIndex: "arrivalTime",
            key: "arrivalTime",
            render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm"),
        },
        {
            title: "Цена",
            dataIndex: "price",
            key: "price",
        }
    ];

    return (
        <Section className={styles.tripsSection}>
            <Container>
                <div className={styles.headerRow}>
                    <Title level={3}>Расписание (Рейсы)</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Добавить рейс
                    </Button>
                </div>

                <Table
                    dataSource={trips}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    bordered
                />

                <Modal
                    title="Запланировать новый рейс"
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                    }}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleAddTrip}>
                        <Form.Item
                            name="routeId"
                            label="Маршрут"
                            rules={[{ required: true, message: "Выберите маршрут" }]}
                        >
                            <Select placeholder="Выберите маршрут">
                                {routes.map((r: any) => (
                                    <Select.Option key={r.id} value={r.id}>
                                        Маршрут ID: {r.id} ({r.distanceKm} км)
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="busId"
                            label="Автобус"
                            rules={[{ required: true, message: "Выберите автобус" }]}
                        >
                            <Select placeholder="Выберите автобус">
                                {buses.map((b: any) => (
                                    <Select.Option key={b.id} value={b.id}>
                                        {b.plateNumber}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label="Время отправления и прибытия"
                            rules={[{ required: true, message: "Выберите время" }]}
                        >
                            <DatePicker.RangePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="price"
                            label="Цена билета (KZT)"
                            rules={[{ required: true, message: "Укажите цену" }]}
                        >
                            <InputNumber style={{ width: "100%" }} placeholder="5000" />
                        </Form.Item>
                    </Form>
                </Modal>
            </Container>
        </Section>
    );
}

export default CarrierTripsPage;
