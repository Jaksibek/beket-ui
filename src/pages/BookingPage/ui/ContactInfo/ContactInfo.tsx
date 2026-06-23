import { Typography, Row, Col, Form, Input, Card } from "antd";
import { useTranslation } from "react-i18next";
import { formatPhone, isValidPhone } from "../../lib/validation";
import styles from "../BookingPage.module.scss";

const { Title, Text } = Typography;

export function ContactInfo() {
  const { t } = useTranslation();

  return (
    <Card className={styles.card} bordered={false}>
      <Title level={4} style={{ marginTop: 0 }}>
        {t("Контактные данные покупателя")}
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        {t("На этот email и номер телефона мы отправим билеты и чек")}
      </Text>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label={t("Электронная почта")}
            rules={[
              { required: true, message: t("Введите email") },
              { type: "email", message: t("Некорректный email") }
            ]}
          >
            <Input size="large" placeholder="example@mail.com" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label={t("Телефон")}
            getValueFromEvent={(e) => formatPhone(e.target.value)}
            rules={[
              { required: true, message: t("Введите телефон") },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (isValidPhone(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("Некорректный номер телефона") || "Некорректный номер телефона")
                  );
                }
              }
            ]}
          >
            <Input size="large" placeholder="+7 (777) 000-00-00" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
