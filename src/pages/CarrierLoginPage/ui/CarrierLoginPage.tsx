import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Card, Tabs } from "antd";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import API from "@/shared/api";
import { appRoutes } from "@/shared/config/router";
import styles from "./CarrierLoginPage.module.scss";

const { Title } = Typography;

function CarrierLoginPage() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("1");
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await API.post("/api/Auth/login", {
                email: values.email,
                password: values.password,
            });

            if (res.data && res.data.token) {
                localStorage.setItem("carrier_token", res.data.token);
                message.success("Успешная авторизация!");
                navigate(appRoutes.carrierDashboard);
            }
        } catch (err: any) {
            console.error(err);
            message.error("Неверный логин или пароль");
        } finally {
            setLoading(false);
        }
    };

    const onRegister = async (values: any) => {
        setLoading(true);
        try {
            await API.post("/api/Auth/register-carrier", {
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                carrierName: values.carrierName,
            });
            message.success("Регистрация успешна! Выполняется вход...");
            await onFinish({ email: values.email, password: values.password }); // auto login after register
        } catch (err: any) {
            console.error(err);
            message.error(err.response?.data?.title || err.response?.data || "Ошибка при регистрации");
        } finally {
            setLoading(false);
        }
    };

    const loginForm = (
        <Form
            name="carrier_login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
        >
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Пожалуйста, введите Email!" },
                    { type: "email", message: "Некорректный Email!" }
                ]}
            >
                <Input placeholder="Введите email" />
            </Form.Item>

            <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}
            >
                <Input.Password placeholder="Введите пароль" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Войти
                </Button>
            </Form.Item>
        </Form>
    );

    const registerForm = (
        <Form
            name="carrier_register"
            layout="vertical"
            onFinish={onRegister}
            autoComplete="off"
        >
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Придумайте логин (Email) для входа!" },
                    { type: "email", message: "Введите корректный Email" }
                ]}
            >
                <Input placeholder="Например: ceo@mybus.kz" />
            </Form.Item>

            <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Придумайте надежный пароль!" }, { min: 6, message: "Минимум 6 символов" }]}
            >
                <Input.Password placeholder="Введите пароль" />
            </Form.Item>

            <Form.Item
                label="Имя"
                name="firstName"
                rules={[{ required: true, message: "Введите Имя!" }]}
            >
                <Input placeholder="Иван" />
            </Form.Item>

            <Form.Item
                label="Фамилия"
                name="lastName"
                rules={[{ required: true, message: "Введите Фамилию!" }]}
            >
                <Input placeholder="Иванов" />
            </Form.Item>

            <Form.Item
                label="Название Автопарка (Компании)"
                name="carrierName"
                rules={[{ required: true, message: "Введите название компании!" }]}
            >
                <Input placeholder="Например: ИП Иванов" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Зарегистрироваться
                </Button>
            </Form.Item>
        </Form>
    );

    const tabItems = [
        { key: "1", label: "Вход", children: loginForm },
        { key: "2", label: "Регистрация", children: registerForm },
    ];

    return (
        <Section className={styles.loginSection}>
            <Container>
                <Card className={styles.loginCard} bordered={false}>
                    <Title level={3} className={styles.title}>
                        Портал Перевозчиков
                    </Title>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered />
                </Card>
            </Container>
        </Section>
    );
}

export default CarrierLoginPage;
