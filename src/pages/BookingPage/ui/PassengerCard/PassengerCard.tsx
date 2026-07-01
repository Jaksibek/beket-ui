import { Typography, Row, Col, Form, Input, Card, Flex, Divider, Select } from "antd";
import { useTranslation } from "react-i18next";
import { validateIIN } from "../../lib/validation";
import styles from "../BookingPage.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;

interface PassengerCardProps {
  index: number;
  seatNumber: string | number;
}

export function PassengerCard({ index, seatNumber }: PassengerCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={styles.card} bordered={false}>
      <Flex justify="space-between" align="center" className={styles.cardHeader}>
        <Title level={4} style={{ margin: 0 }}>
          {t("Passenger")} {index + 1}
        </Title>
        <Text className={styles.seatBadge}>
          {t("Seat")} {seatNumber}
        </Text>
      </Flex>
      <Divider style={{ margin: "16px 0" }} />

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "lastName"]}
            label={t("Last Name")}
            rules={[{ required: true, message: t("Enter last name") }]}
          >
            <Input size="large" placeholder={t("Ivanov")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "firstName"]}
            label={t("First Name")}
            rules={[{ required: true, message: t("Enter first name") }]}
          >
            <Input size="large" placeholder={t("Ivan")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "middleName"]}
            label={t("Middle Name")}
          >
            <Input size="large" placeholder={t("Ivanovich")} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "documentType"]}
            label={t("Document Type")}
            initialValue="id_card"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="id_card">{t("ID Card")}</Option>
              <Option value="passport">{t("Passport")}</Option>
              <Option value="birth_certificate">{t("Birth Certificate")}</Option>
              <Option value="foreign_passport">{t("Foreign Passport")}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "documentNumber"]}
            label={t("Document Number")}
            rules={[{ required: true, message: t("Enter document number") }]}
          >
            <Input size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              const prevDoc = prevValues?.passengers?.[index]?.documentType;
              const currDoc = currentValues?.passengers?.[index]?.documentType;
              return prevDoc !== currDoc;
            }}
          >
            {({ getFieldValue }) => {
              const documentType = getFieldValue(["passengers", index, "documentType"]);
              const isForeigner = documentType === "foreign_passport";

              return (
                <Form.Item
                  name={["passengers", index, "iin"]}
                  label={t("IIN")}
                  rules={
                    isForeigner
                      ? []
                      : [
                        { required: true, message: t("Enter IIN") },
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            if (validateIIN(value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(t("Invalid IIN format") || "Неверный формат ИИН")
                            );
                          }
                        }
                      ]
                  }
                >
                  <Input
                    size="large"
                    maxLength={12}
                    //disabled={isForeigner}
                    placeholder={isForeigner ? t("Not required") : ""}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
