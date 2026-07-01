import { Typography, Card, Flex, Divider, Button, Row, Col, Table } from "antd";
import { useTranslation } from "react-i18next";
import { PrinterOutlined, HomeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { ITrip } from "@/pages/SearchPage";
import type { IPassenger } from "../../model/types";
import styles from "../BookingPage.module.scss";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/kk";
import "dayjs/locale/en";

const { Title, Text } = Typography;

interface TicketStepProps {
  trip: ITrip;
  selectedSeats: (string | number)[];
  passengers: IPassenger[];
  email: string;
  phone: string;
  ticketId: string;
  onReset: () => void;
}

export function TicketStep({
  trip,
  selectedSeats,
  passengers,
  email,
  phone,
  ticketId,
  onReset
}: TicketStepProps) {
  const { t, i18n } = useTranslation();

  const formatDate = (dateStr: string) => {
    try {
      const lang = i18n.language === "kz" ? "kk" : (i18n.language || "ru");
      return dayjs(dateStr)
        .locale(lang)
        .format("DD MMMM YYYY, dddd HH:mm");
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const passengerColumns = [
    {
      title: t("Пассажир"),
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <Text strong>
          {record.lastName} {record.firstName} {record.middleName || ""}
        </Text>
      )
    },
    {
      title: t("Документ"),
      dataIndex: "documentNumber",
      key: "documentNumber",
      render: (_: any, record: any) => (
        <Text>
          {record.documentType === "foreign_passport" ? t("Иностранный паспорт") : t("Документ")}:{" "}
          {record.documentNumber}
        </Text>
      )
    },
    {
      title: t("Место"),
      dataIndex: "seat",
      key: "seat",
      align: "center" as const,
      render: (seat: number) => <Text strong>{seat}</Text>
    },
    {
      title: t("Номер билета"),
      dataIndex: "ticketNum",
      key: "ticketNum",
      render: (num: string) => <Text style={{ fontFamily: "monospace" }}>{num}</Text>
    }
  ];

  const passengerData = passengers.map((p, i) => ({
    key: i,
    lastName: p.lastName,
    firstName: p.firstName,
    middleName: p.middleName,
    documentType: p.documentType,
    documentNumber: p.documentNumber,
    seat: selectedSeats[i],
    ticketNum: `BG-${ticketId}-${selectedSeats[i]}`
  }));

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=Ticket:${ticketId};Trip:${trip.tripId}`;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      {/* CSS style block for printing only the ticket card */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          /* Hide everything in layout */
          #root > div, header, footer, .ant-btn, .no-print {
            display: none !important;
          }
          /* Show only the printable ticket */
          #printable-ticket {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Success Heading (Non-printable) */}
      <Flex vertical align="center" gap={12} className="no-print" style={{ marginBottom: 32 }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
        <Title level={2} style={{ margin: 0, textAlign: "center" }}>
          {t("Оплата прошла успешно!")}
        </Title>
        <Text type="secondary" style={{ fontSize: 16, textAlign: "center" }}>
          {t("Ваш электронный билет сформирован. Копия отправлена на email:")}{" "}
          <Text strong>{email}</Text>
        </Text>
      </Flex>

      {/* Printable Ticket Container */}
      <Card id="printable-ticket" className={styles.card} bordered={false} style={{ padding: 8 }}>
        {/* Ticket Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0, color: "var(--color-primary)" }}>
              BUSGO TICKETS
            </Title>
            <Text type="secondary">{t("Электронный билет на автобус")}</Text>
          </Col>
          <Col style={{ textAlign: "right" }}>
            <Text type="secondary">{t("Номер заказа")}:</Text>
            <Title level={4} style={{ margin: 0, fontFamily: "monospace" }}>
              #{ticketId}
            </Title>
          </Col>
        </Row>

        <Divider style={{ margin: "0 0 24px" }} />

        {/* Route Details */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                  {t("Отправление")}
                </Text>
                <Title level={4} style={{ margin: "4px 0" }}>
                  {trip.route.fromCity}
                </Title>
                <Text style={{ fontSize: 13, display: "block" }}>
                  {trip.route.fromStation}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatDate(trip.route.departureTime)}
                </Text>
              </Col>
              <Col xs={12}>
                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                  {t("Прибытие")}
                </Text>
                <Title level={4} style={{ margin: "4px 0" }}>
                  {trip.route.toCity}
                </Title>
                <Text style={{ fontSize: 13, display: "block" }}>
                  {trip.route.toStation}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatDate(trip.route.arrivalTime)}
                </Text>
              </Col>
            </Row>

            <Divider style={{ margin: "20px 0" }} />

            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                  {t("Автобус")}
                </Text>
                <Text strong style={{ fontSize: 15 }}>
                  {trip.bus.brand} {trip.bus.model}
                </Text>
              </Col>
              <Col xs={12}>
                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                  {t("Телефон покупателя")}
                </Text>
                <Text strong style={{ fontSize: 15 }}>
                  {phone}
                </Text>
              </Col>
            </Row>
          </Col>

          {/* QR Code Column */}
          <Col xs={24} md={8} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Flex vertical align="center" gap={8} style={{ border: "1px dashed #d9d9d9", padding: 16, borderRadius: 12 }}>
              <img
                src={qrUrl}
                alt="Ticket QR Code"
                style={{ width: 140, height: 140, display: "block" }}
              />
              <Text type="secondary" style={{ fontSize: 11, textAlign: "center" }}>
                {t("Предъявите QR-код при посадке")}
              </Text>
            </Flex>
          </Col>
        </Row>

        {/* Passenger Table */}
        <Title level={4} style={{ marginTop: 24, marginBottom: 12 }}>
          {t("Информация о пассажирах")}
        </Title>
        <Table
          columns={passengerColumns}
          dataSource={passengerData}
          pagination={false}
          bordered
          size="middle"
          style={{ marginBottom: 24 }}
        />

        <Divider style={{ margin: "24px 0 16px" }} />

        {/* Footer info */}
        <Flex justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: 12 }}>
            * {t("Пожалуйста, прибудьте на посадку за 15 минут до отправления.")}
          </Text>
          <Text strong style={{ fontSize: 16, color: "var(--color-primary)" }}>
            {t("Итого оплачено")}: {trip.price * selectedSeats.length} ₸
          </Text>
        </Flex>
      </Card>

      {/* Action Buttons (Non-printable) */}
      <Row gutter={16} className="no-print" style={{ marginTop: 32 }}>
        <Col xs={12}>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            size="large"
            block
            onClick={handlePrint}
            style={{ height: 50, borderRadius: 12 }}
          >
            {t("Печать билета")}
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            icon={<HomeOutlined />}
            size="large"
            block
            onClick={onReset}
            style={{ height: 50, borderRadius: 12 }}
          >
            {t("На главную")}
          </Button>
        </Col>
      </Row>
    </div>
  );
}
