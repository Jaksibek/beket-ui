import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Card, Tabs, Space, Row, Col } from "antd";
import { LockOutlined, MailOutlined, UserOutlined, ShopOutlined, KeyOutlined, ArrowLeftOutlined, PhoneOutlined } from "@ant-design/icons";
import API from "@/shared/api";
import { appRoutes } from "@/shared/config/router";
import styles from "./CarrierLoginPage.module.scss";

const { Title, Text } = Typography;

function CarrierLoginPage() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("1");
    const navigate = useNavigate();

    // Password recovery wizard states
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState<"email" | "reset">("email");
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [devToken, setDevToken] = useState("");

    const [forgotForm] = Form.useForm();
    const [resetForm] = Form.useForm();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Strip any non-digits from the phone number for the API request
            const cleanPhone = values.phoneNumber.replace(/\D/g, "");
            const res = await API.post("/api/Auth/login", {
                phoneNumber: cleanPhone,
                password: values.password,
            });

            if (res.data && res.data.token) {
                localStorage.setItem("carrier_token", res.data.token);
                localStorage.setItem("carrier_name", res.data.carrierName || "");
                localStorage.setItem("carrier_id", res.data.carrierId || "");
                localStorage.setItem("carrier_email", res.data.email || "");
                localStorage.setItem("carrier_fullname", res.data.fullName || "");
                localStorage.setItem("carrier_roles", JSON.stringify(res.data.roles || []));
                localStorage.setItem("carrier_phone", res.data.phoneNumber || "");
                message.success("Успешная авторизация!");
                navigate(appRoutes.carrierDashboard);
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.response?.data || "Неверный номер телефона или пароль");
        } finally {
            setLoading(false);
        }
    };

    const onRegister = async (values: any) => {
        setLoading(true);
        try {
            const cleanPhone = values.phoneNumber.replace(/\D/g, "");
            await API.post("/api/Auth/register-carrier", {
                email: values.email || null,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                carrierName: values.carrierName,
                phoneNumber: cleanPhone,
            });
            message.success("Регистрация успешна! Выполняется вход...");
            await onFinish({ phoneNumber: values.phoneNumber, password: values.password });
        } catch (err: any) {
            console.error(err);
            message.error(err.response?.data?.title || err.response?.data || "Ошибка при регистрации");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordRequest = async (values: any) => {
        setLoading(true);
        try {
            const res = await API.post("/api/Auth/forgot-password", {
                email: values.email
            });
            message.success(res.data.message || "Токен восстановления сгенерирован!");
            setRecoveryEmail(values.email);
            
            // Capture dev token for easy testing
            if (res.data.token) {
                setDevToken(res.data.token);
                resetForm.setFieldsValue({
                    token: res.data.token
                });
            }
            
            setRecoveryStep("reset");
        } catch (err: any) {
            console.error(err);
            message.error(err.response?.data || "Не удалось отправить запрос на восстановление пароля");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (values: any) => {
        setLoading(true);
        try {
            await API.post("/api/Auth/reset-password", {
                email: recoveryEmail,
                token: values.token,
                newPassword: values.newPassword
            });
            message.success("Пароль успешно сброшен! Теперь вы можете войти.");
            setIsForgotMode(false);
            setRecoveryStep("email");
            forgotForm.resetFields();
            resetForm.resetFields();
            setActiveTab("1"); // Go back to login tab
        } catch (err: any) {
            console.error(err);
            const errDetails = Array.isArray(err.response?.data) 
                ? err.response.data.join(". ")
                : err.response?.data || "Ошибка при изменении пароля";
            message.error(errDetails);
        } finally {
            setLoading(false);
        }
    };

    // Render Forms
    const loginForm = (
        <Form
            name="carrier_login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
        >
            <Form.Item
                label="Номер телефона"
                name="phoneNumber"
                rules={[
                    { required: true, message: "Пожалуйста, введите номер телефона!" }
                ]}
            >
                <Input prefix={<PhoneOutlined className={styles.inputIcon} />} placeholder="+7 (7xx) xxx-xx-xx" size="large" />
            </Form.Item>

            <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}
            >
                <Input.Password prefix={<LockOutlined className={styles.inputIcon} />} placeholder="Введите пароль" size="large" />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                <Button type="link" onClick={() => setIsForgotMode(true)} className={styles.forgotLink}>
                    Забыли пароль?
                </Button>
            </div>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large" className={styles.submitBtn}>
                    Войти в кабинет
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
            requiredMark={false}
        >
            <Form.Item
                label="Номер телефона (Логин для входа)"
                name="phoneNumber"
                rules={[
                    { required: true, message: "Пожалуйста, введите номер телефона!" }
                ]}
            >
                <Input prefix={<PhoneOutlined className={styles.inputIcon} />} placeholder="+7 (7xx) xxx-xx-xx" size="large" />
            </Form.Item>

            <Form.Item
                label="Email адрес (Необязательно)"
                name="email"
                rules={[
                    { type: "email", message: "Введите корректный email!" }
                ]}
            >
                <Input prefix={<MailOutlined className={styles.inputIcon} />} placeholder="ceo@company.kz" size="large" />
            </Form.Item>

            <Form.Item
                label="Пароль для входа"
                name="password"
                rules={[
                    { required: true, message: "Придумайте надежный пароль!" },
                    { min: 6, message: "Минимум 6 символов" }
                ]}
            >
                <Input.Password prefix={<LockOutlined className={styles.inputIcon} />} placeholder="Минимум 6 символов" size="large" />
            </Form.Item>

            <Form.Item
                label="Название Автопарка (Компании)"
                name="carrierName"
                rules={[{ required: true, message: "Укажите наименование организации!" }]}
            >
                <Input prefix={<ShopOutlined className={styles.inputIcon} />} placeholder="ТОО Пассажирские Перевозки" size="large" />
            </Form.Item>

            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item
                        label="Имя"
                        name="firstName"
                        rules={[{ required: true, message: "Введите Имя!" }]}
                    >
                        <Input prefix={<UserOutlined className={styles.inputIcon} />} placeholder="Иван" size="large" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Фамилия"
                        name="lastName"
                        rules={[{ required: true, message: "Введите Фамилию!" }]}
                    >
                        <Input prefix={<UserOutlined className={styles.inputIcon} />} placeholder="Иванов" size="large" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large" className={styles.submitBtn}>
                    Зарегистрироваться
                </Button>
            </Form.Item>
        </Form>
    );

    const forgotPasswordWizard = () => {
        if (recoveryStep === "email") {
            return (
                <Form
                    form={forgotForm}
                    layout="vertical"
                    onFinish={handleForgotPasswordRequest}
                    requiredMark={false}
                >
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
                        Введите email вашей учетной записи. Мы сгенерируем токен для восстановления пароля.
                    </Typography.Paragraph>

                    <Form.Item
                        label="Email адрес"
                        name="email"
                        rules={[
                            { required: true, message: "Укажите email адрес!" },
                            { type: "email", message: "Введите корректный email!" }
                        ]}
                    >
                        <Input prefix={<MailOutlined className={styles.inputIcon} />} placeholder="ceo@company.kz" size="large" />
                    </Form.Item>

                    <Space style={{ width: "100%" }} direction="vertical" size="middle">
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" className={styles.submitBtn}>
                            Получить токен сброса
                        </Button>
                        <Button type="default" block icon={<ArrowLeftOutlined />} onClick={() => setIsForgotMode(false)} size="large">
                            Вернуться к входу
                        </Button>
                    </Space>
                </Form>
            );
        }

        return (
            <Form
                form={resetForm}
                layout="vertical"
                onFinish={handlePasswordReset}
                requiredMark={false}
            >
                <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
                    Токен сброса успешно сгенерирован для Email <Text strong style={{ color: "#fff" }}>{recoveryEmail}</Text>. Введите токен и укажите новый пароль.
                </Typography.Paragraph>

                {devToken && (
                    <div className={styles.devAlert}>
                        <Text type="warning" strong style={{ fontSize: 13, color: "#e67e22" }}>[DEV MODE]</Text>
                        <Typography.Paragraph style={{ margin: "4px 0 8px 0", fontSize: 12, color: "#fff" }}>
                            Токен автоматически подставлен из ответа API. Скопируйте его, если нужно:
                        </Typography.Paragraph>
                        <Typography.Paragraph copyable style={{ color: "#2ecc71", fontFamily: "monospace", margin: 0, fontSize: 12, wordBreak: "break-all" }}>
                            {devToken}
                        </Typography.Paragraph>
                    </div>
                )}

                <Form.Item
                    label="Токен сброса пароля"
                    name="token"
                    rules={[{ required: true, message: "Укажите токен сброса!" }]}
                >
                    <Input prefix={<KeyOutlined className={styles.inputIcon} />} placeholder="Вставьте токен сброса" size="large" />
                </Form.Item>

                <Form.Item
                    label="Новый пароль"
                    name="newPassword"
                    rules={[
                        { required: true, message: "Придумайте новый пароль!" },
                        { min: 6, message: "Минимум 6 символов" }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined className={styles.inputIcon} />} placeholder="Минимум 6 символов" size="large" />
                </Form.Item>

                <Space style={{ width: "100%" }} direction="vertical" size="middle">
                    <Button type="primary" htmlType="submit" loading={loading} block size="large" className={styles.submitBtn} danger>
                        Сбросить пароль
                    </Button>
                    <Button type="default" block icon={<ArrowLeftOutlined />} onClick={() => setRecoveryStep("email")} size="large">
                        Изменить Email
                    </Button>
                </Space>
            </Form>
        );
    };

    const tabItems = [
        { key: "1", label: "Вход", children: loginForm },
        { key: "2", label: "Регистрация", children: registerForm },
    ];

    return (
        <div className={styles.loginPageContainer}>
            <div className={styles.loginSection}>
                <Card className={styles.loginCard} bordered={false}>
                    <div className={styles.headerBlock}>
                        <Title level={2} className={styles.title}>
                            BEKET
                        </Title>
                        <div className={styles.subtitle}>
                            {isForgotMode ? "Восстановление доступа" : "Портал Перевозчиков"}
                        </div>
                    </div>

                    {isForgotMode ? (
                        forgotPasswordWizard()
                    ) : (
                        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered />
                    )}
                </Card>
            </div>
        </div>
    );
}

export default CarrierLoginPage;
