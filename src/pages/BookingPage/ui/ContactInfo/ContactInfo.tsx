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
        {t("Buyer Contact Details")}
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        {t("We will send the tickets and receipt to this email and phone number")}
      </Text>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label={t("Email")}
            rules={[
              { required: true, message: t("Enter email") },
              { type: "email", message: t("Invalid email") }
            ]}
          >
            <Input size="large" placeholder="example@mail.com" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label={t("Phone")}
            getValueFromEvent={(e) => formatPhone(e.target.value)}
            rules={[
              { required: true, message: t("Enter phone number") },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (isValidPhone(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("Invalid phone number") || "Некорректный номер телефона")
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
