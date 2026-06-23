import { Typography, Row, Col, Form, Input, Card, Flex, Divider, Select } from "antd";
import { useTranslation } from "react-i18next";
import { validateIIN } from "../../lib/validation";
import styles from "../BookingPage.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;

interface PassengerCardProps {
  index: number;
  seatNumber: number;
}

export function PassengerCard({ index, seatNumber }: PassengerCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={styles.card} bordered={false}>
      <Flex justify="space-between" align="center" className={styles.cardHeader}>
        <Title level={4} style={{ margin: 0 }}>
          {t("Пассажир")} {index + 1}
        </Title>
        <Text className={styles.seatBadge}>
          {t("Место")} {seatNumber}
        </Text>
      </Flex>
      <Divider style={{ margin: "16px 0" }} />

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "lastName"]}
            label={t("Фамилия")}
            rules={[{ required: true, message: t("Введите фамилию") }]}
          >
            <Input size="large" placeholder={t("Иванов")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "firstName"]}
            label={t("Имя")}
            rules={[{ required: true, message: t("Введите имя") }]}
          >
            <Input size="large" placeholder={t("Иван")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "middleName"]}
            label={t("Отчество")}
          >
            <Input size="large" placeholder={t("Иванович")} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "documentType"]}
            label={t("Тип документа")}
            initialValue="id_card"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="id_card">{t("Удостоверение личности")}</Option>
              <Option value="passport">{t("Паспорт")}</Option>
              <Option value="birth_certificate">{t("Свидетельство о рождении")}</Option>
              <Option value="foreign_passport">{t("Иностранный паспорт")}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["passengers", index, "documentNumber"]}
            label={t("Номер документа")}
            rules={[{ required: true, message: t("Введите номер документа") }]}
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
                  label={t("ИИН")}
                  rules={
                    isForeigner
                      ? []
                      : [
                        { required: true, message: t("Введите ИИН") },
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            if (validateIIN(value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(t("Неверный формат ИИН") || "Неверный формат ИИН")
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
                    placeholder={isForeigner ? t("Не требуется") : ""}
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
