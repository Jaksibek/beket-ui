import { Button, Card, Flex, Spin, Table, Tag, Typography, Form, Input, Select, Dropdown, Tooltip, Row, Col } from "antd";
import {
  ShoppingCartOutlined,
  TeamOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { FormInstance } from "antd";
import styles from "../ui/CarrierDashboardPage.module.scss";
import { BusScheme53Seats } from "@/widgets/SeatSelectionModal/ui/BusSchemes/BusScheme53Seats";
import { AgentSchemeSleeperYutong36 } from "@/widgets/SeatSelectionModal/ui/BusSchemes/AgentSchemeSleeperYutong36";
import { AgentSchemeSleeperYutong40 } from "@/widgets/SeatSelectionModal/ui/BusSchemes/AgentSchemeSleeperYutong40";

const { Title, Text } = Typography;

// Dynamic premium seat sales layout mapping coordinates

interface SalesSectionProps {
  // Common states
  trips: any[];
  buses: any[];
  loading: boolean;
  profile: {
    carrierId: string | null;
    roles: string[];
    contactId: string | null;
  };
  isAdmin?: boolean;

  // Active Sales flow states
  activeSalesTrip: any | null;
  setActiveSalesTrip: (trip: any | null) => void;
  activeSalesTab: string;
  setActiveSalesTab: (tab: string) => void;
  seatsLoading: boolean;
  seatsData: any[];
  selectedSeats: (string | number)[];
  setSelectedSeats: (seats: (string | number)[]) => void;

  // Forms & submission states
  passengerForm: FormInstance;
  manualBookingLoading: boolean;
  cancelLoading: boolean;

  // Callbacks
  openSalesBooking: (trip: any) => void;
  openSalesPassengers: (trip: any) => void;
  handleSeatClick: (seatNum: string | number) => void;
  handleManualBooking: (values: any) => void;
  handleCancelManualBooking: (seatNumber: string) => void;
  startEditPassengerDetails: (seatNumber: string, passenger: any) => void;
}

export function SalesSection({
  trips,
  buses,
  loading,
  profile,
  isAdmin,
  activeSalesTrip,
  setActiveSalesTrip,
  activeSalesTab,
  seatsLoading,
  seatsData,
  selectedSeats,
  setSelectedSeats,
  passengerForm,
  manualBookingLoading,
  cancelLoading,
  openSalesBooking,
  openSalesPassengers,
  handleSeatClick,
  handleManualBooking,
  handleCancelManualBooking,
  startEditPassengerDetails,
}: SalesSectionProps) {

  // Helper getters
  const getSeatState = (seatNum: number) => {
    const s = seatsData.find(x => (x.number || x.Number || x.seatNumber) === String(seatNum));
    if (!s) return { status: "free", price: 0, passenger: null };

    const isSelected = selectedSeats.includes(seatNum);
    if (isSelected) {
      return { status: "selected", price: s.price, passenger: s.passenger, rawStatus: s.status };
    }

    return { status: s.status.toLowerCase(), price: s.price, passenger: s.passenger, rawStatus: s.status };
  };

  const renderPassengersListTable = () => {
    const columns = [
      {
        title: "Место",
        dataIndex: "seatNumber",
        key: "seatNumber",
        width: 60,
        render: (text: string) => <Tag color="blue" style={{ fontSize: 12, margin: 0 }}>{text}</Tag>,
        sorter: (a: any, b: any) => Number(a.seatNumber) - Number(b.seatNumber)
      },
      {
        title: "ФИО пассажира",
        key: "name",
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
          const isOnline = p.buyerEmail !== "manual@beket.kz";
          return (
            <div>
              <Text strong style={{ fontSize: 13 }}>{p.lastName} {p.firstName} {p.middleName || ""}</Text>
              {isOnline && <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, padding: "0 4px" }}>Сайт</Tag>}
            </div>
          );
        }
      },
      {
        title: "Телефон",
        key: "phone",
        width: 120,
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p || !p.buyerPhone) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
          return <a href={`tel:${p.buyerPhone}`} style={{ color: "#2563eb", fontWeight: "bold", fontSize: 13 }}>{p.buyerPhone}</a>;
        }
      },
      {
        title: "Документ",
        key: "document",
        width: 160,
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
          const docTypeStr = p.documentType === "passport" ? "Удост." : p.documentType === "foreign_passport" ? "Паспорт" : p.documentType || "—";
          return (
            <div style={{ fontSize: 13, lineHeight: "1.2" }}>
              <div>{docTypeStr} №{p.documentNumber}</div>
              {p.iin && <div style={{ fontSize: 11, color: "#64748b" }}>ИИН: {p.iin}</div>}
            </div>
          );
        }
      },
      {
        title: "Билет",
        key: "ticket",
        width: 140,
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
          return (
            <div style={{ lineHeight: "1.2" }}>
              <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>{p.ticketNumber || "—"}</Tag>
              {p.buyerEmail !== "manual@beket.kz" && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{p.buyerEmail}</div>}
            </div>
          );
        }
      },
      {
        title: "Кем куплен",
        key: "createdByName",
        width: 140,
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary" style={{ fontSize: 12 }}>Покупатель (Сайт)</Text>;
          const isManual = p.buyerEmail === "manual@beket.kz";
          if (!isManual) return <Tag color="cyan" style={{ fontSize: 11, margin: 0 }}>Покупатель (Сайт)</Tag>;
          if (p.createdByName) return <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>Агент {p.createdByName}</Tag>;
          return <Tag color="default" style={{ fontSize: 11, margin: 0 }}>Касса / Агент</Tag>;
        }
      },
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={status === "Booked" ? "success" : "warning"} style={{ fontSize: 11, margin: 0 }}>
            {status === "Booked" ? "Продано" : "Забронировано"}
          </Tag>
        )
      },
      {
        title: "Действия",
        key: "action",
        width: 90,
        render: (_: any, record: any) => {
          const p = record.passenger;
          const isManual = p && p.buyerEmail === "manual@beket.kz";
          const isAgent = (profile.roles.includes("Agent") || profile.roles.includes("Cashier")) && !profile.roles.includes("Admin");

          const canEdit = p && (!isAgent || (isManual && p.createdById === profile.contactId));
          const canCancel = isManual && (!isAgent || p.createdById === profile.contactId);

          return (
            <Flex gap={6}>
              <Button
                size="small"
                icon={<EditOutlined style={{ fontSize: 12 }} />}
                onClick={() => startEditPassengerDetails(record.seatNumber, p)}
                disabled={!p || !canEdit}
                title={!p ? "Нет данных пассажира" : !canEdit ? "Вы можете редактировать только свои продажи" : "Редактировать"}
              />
              <Button
                danger
                size="small"
                icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                onClick={() => handleCancelManualBooking(record.seatNumber)}
                disabled={!canCancel}
                title={!canCancel ? "Вы можете отменять только свои продажи" : "Отменить"}
              />
            </Flex>
          );
        }
      }
    ];

    const bookedSeats = seatsData.filter(s => s.status === "Booked" || s.status === "Reserved");

    return (
      <Table
        dataSource={bookedSeats}
        columns={columns}
        rowKey="id"
        bordered
        size="small"
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "На этом рейсе пока нет проданных мест" }}
      />
    );
  };

  const renderSalesTable = () => {
    const columns = [
      {
        title: "Маршрут",
        key: "routeName",
        render: (_: any, record: any) => {
          const name = record.routeName || record.RouteName || "";
          const parts = name.split(" → ");
          if (parts.length < 2) return <Text strong style={{ fontSize: 13 }}>{name}</Text>;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 1, lineHeight: "1.2", minWidth: 150 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{parts[0]}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", display: "inline-block", margin: "2px 0 2px 4px" }}>↓</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{parts[1]}</span>
            </div>
          );
        }
      },
      ...(profile.roles?.includes("Admin") ? [
        {
          title: "Автопарк",
          key: "carrierName",
          render: (_: any, record: any) => {
            return <Tag color="blue" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>{record.carrierName || record.CarrierName || "—"}</Tag>;
          }
        }
      ] : []),
      {
        title: "Автобус",
        key: "busPlateNumber",
        render: (_: any, record: any) => {
          const bs = buses.find(b => b.id === record.busId);
          return bs ? <Tag color="purple" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>{bs.plateNumber}</Tag> : <Tag color="default" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>{record.busPlateNumber || record.BusPlateNumber}</Tag>;
        }
      },
      {
        title: "Отправление",
        dataIndex: "departureTime",
        key: "departureTime",
        render: (val: string) => <span style={{ fontSize: 13 }}>{dayjs(val).format("DD.MM.YYYY HH:mm")}</span>
      },
      {
        title: "Прибытие",
        dataIndex: "arrivalTime",
        key: "arrivalTime",
        render: (val: string) => <span style={{ fontSize: 13 }}>{dayjs(val).format("DD.MM.YYYY HH:mm")}</span>
      },
      {
        title: "Свободные места",
        key: "seatsStat",
        render: (_: any, record: any) => (
          <Tag color={record.freeSeats === 0 ? "error" : "success"} style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>
            {record.freeSeats} из {record.totalSeats} свободно
          </Tag>
        )
      },
      {
        title: "Цена билета",
        dataIndex: "price",
        key: "price",
        render: (val: number) => <Text strong style={{ color: "#2563eb", fontSize: 13 }}>{val} KZT</Text>
      },
      {
        title: "Действия",
        key: "action",
        width: 60,
        align: "center" as const,
        render: (_: any, record: any) => {
          const menuItems = [
            {
              key: "sell",
              label: "Оформить продажу",
              icon: <ShoppingCartOutlined style={{ color: "#22c55e", fontSize: 14 }} />,
              onClick: () => openSalesBooking(record),
            },
            {
              key: "passengers",
              label: "Список пассажиров",
              icon: <TeamOutlined style={{ color: "#3b82f6", fontSize: 14 }} />,
              onClick: () => openSalesPassengers(record),
            },
          ];

          return (
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined style={{ fontSize: 16 }} />}
                disabled={!profile.carrierId && !isAdmin}
              />
            </Dropdown>
          );
        }
      }
    ];

    return (
      <Card
        className={styles.glassCard}
        title={<Title level={4} style={{ margin: 0 }}>Продажа билетов на рейсы</Title>}
      >
        <Table
          dataSource={trips}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          size="small"
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    );
  };

  const renderSalesActiveBooking = () => {
    if (!activeSalesTrip) return null;

    return (
      <Card
        className={styles.glassCard}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: 12 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {activeSalesTab === "scheme" ? "Касса — Продажа билетов" : "Список пассажиров рейса"}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Рейс: {activeSalesTrip.routeName || "Маршрут"} | Отправление: {dayjs(activeSalesTrip.departureTime).format("DD.MM.YYYY HH:mm")}
              </Text>
            </div>
            <Button onClick={() => { setActiveSalesTrip(null); setSelectedSeats([]); }}>
              Назад к списку рейсов
            </Button>
          </div>
        }
      >
        {seatsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Spin size="large" tip="Загрузка схемы мест..." />
          </div>
        ) : (
          <Flex vertical gap={16} style={{ width: "100%" }}>
            {activeSalesTab === "scheme" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
                {/* Top: Full width bus scheme representation */}
                <div className={styles.busLayoutContainer} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "28px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {(() => {
                      const tripBus = buses.find(b => b.id === activeSalesTrip.busId);
                      const schemeName = (activeSalesTrip.seatSchemeName || tripBus?.seatSchemeName || '').toLowerCase();

                      if (schemeName.includes('sleeper') || schemeName.includes('спальн') || schemeName.includes('спальный')) {
                        if (schemeName.includes('36')) {
                          return <AgentSchemeSleeperYutong36 seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
                        }
                        return <AgentSchemeSleeperYutong40 seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />;
                      }

                      switch (schemeName) {
                        default:
                          return <BusScheme53Seats seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} isAgent={true} />;
                      }
                    })()}
                  </div>
                </div>

                {/* Bottom: Legend/Summary on the left, Passenger details/Form on the right */}
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", width: "100%" }}>
                  {/* Left Column: Legend + Selection Summary */}
                  <div style={{ width: "320px", background: "#f8fafc", padding: "16px 20px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <Text strong style={{ display: "block", marginBottom: 10, fontSize: 14 }}>Обозначения мест</Text>
                      <Flex vertical gap={6}>
                        <Flex align="center" gap={8}>
                          <div className={`${styles.legendBox} ${styles.free}`} style={{ width: 14, height: 14, borderRadius: 2 }}></div>
                          <Text style={{ fontSize: 13 }}>Свободно</Text>
                        </Flex>
                        <Flex align="center" gap={8}>
                          <div className={`${styles.legendBox} ${styles.reserved}`} style={{ width: 14, height: 14, borderRadius: 2 }}></div>
                          <Text style={{ fontSize: 13 }}>Бронь (сессия)</Text>
                        </Flex>
                        <Flex align="center" gap={8}>
                          <div className={`${styles.legendBox} ${styles.booked}`} style={{ width: 14, height: 14, borderRadius: 2 }}></div>
                          <Text style={{ fontSize: 13 }}>Продано / Занято</Text>
                        </Flex>
                        <Flex align="center" gap={8}>
                          <div className={`${styles.legendBox} ${styles.selected}`} style={{ width: 14, height: 14, borderRadius: 2 }}></div>
                          <Text style={{ fontSize: 13 }}>Выбрано вами</Text>
                        </Flex>
                      </Flex>
                    </div>

                    {selectedSeats.length > 0 && (
                      <>
                        <hr style={{ border: "0.5px solid #e2e8f0", margin: "4px 0" }} />
                        <div>
                          <Title level={5} style={{ margin: "0 0 6px 0", fontSize: 14 }}>Выбрано мест: {selectedSeats.length}</Title>
                          <Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                            Номера: {selectedSeats.map(id => {
                              const parts = String(id).split('_');
                              const num = parts[0];
                              const level = parts[1];
                              const cleanNum = num === '0' ? '01' : (num === '00' ? '02' : num);
                              const deckLabel = level ? (level === '2' ? ' (верх)' : ' (низ)') : '';
                              return cleanNum + deckLabel;
                            }).join(", ")}
                          </Text>
                          <Text strong style={{ display: "block", fontSize: 15, color: "#2563eb" }}>
                            Итого к оплате: {selectedSeats.reduce((acc, num) => acc + (getSeatState(num).price || 0), 0)} KZT
                          </Text>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Dynamic Form / Passenger details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {selectedSeats.length === 0 ? (
                      <Card style={{ background: "#f8fafc", textAlign: "center", padding: "32px 20px", border: "1px dashed #cbd5e1" }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Выберите свободные места на схеме автобуса выше для оформления оффлайн-продажи билетов.
                        </Text>
                      </Card>
                    ) : (() => {
                      const firstSeatId = selectedSeats[0];
                      const parts = String(firstSeatId).split('_');
                      const sNum = parts[0];
                      const sLvl = parts[1];
                      const cleanNum = sNum === '0' ? '01' : (sNum === '00' ? '02' : sNum);
                      const lvlLabel = sLvl ? (sLvl === '2' ? ' (верх)' : ' (низ)') : '';
                      const displaySeatName = cleanNum + lvlLabel;

                      const seatInfo = seatsData.find(s =>
                        String(s.seatNumber || s.number || s.Number || "") === sNum &&
                        (!sLvl || Number(s.level || s.Level || 1) === Number(sLvl))
                      );
                      const isBooked = seatInfo && seatInfo.status === "Booked";
                      const isReserved = seatInfo && seatInfo.status === "Reserved";

                      if (isBooked || isReserved) {
                        const passenger = seatInfo?.passenger;
                        const isManualSale = passenger && passenger.buyerEmail === "manual@beket.kz";

                        return (
                          <Card title={`Информация о пассажире (Место ${displaySeatName})`} style={{ background: "#fff" }} size="small">
                            {passenger ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                                {!isManualSale && <div><Tag color="cyan" style={{ marginBottom: 4 }}>Онлайн покупка (Сайт)</Tag></div>}
                                <div><Text type="secondary">ФИО:</Text> <strong>{passenger.lastName} {passenger.firstName} {passenger.middleName || ""}</strong></div>
                                <div><Text type="secondary">Документ:</Text> {passenger.documentType === "passport" ? "Удостоверение" : passenger.documentType === "foreign_passport" ? "Паспорт" : passenger.documentType || "—"} №{passenger.documentNumber || "—"}</div>
                                {passenger.iin && <div><Text type="secondary">ИИН:</Text> {passenger.iin}</div>}
                                <div><Text type="secondary">Билет:</Text> <Tag color="blue">{passenger.ticketNumber || "—"}</Tag></div>
                                <div><Text type="secondary">Телефон:</Text> {passenger.buyerPhone ? <a href={`tel:${passenger.buyerPhone}`} style={{ color: "#2563eb", fontWeight: "bold" }}>{passenger.buyerPhone}</a> : "—"}</div>
                                {!isManualSale && <div><Text type="secondary">Email:</Text> {passenger.buyerEmail || "—"}</div>}
                                {isManualSale && passenger.createdByName && <div><Text type="secondary">Продал:</Text> <Tag color="purple">Агент {passenger.createdByName}</Tag></div>}
                                {isManualSale && !passenger.createdByName && <div><Text type="secondary">Продал:</Text> <Tag color="default">Касса / Агент</Tag></div>}

                                {isManualSale && (
                                  <Button
                                    type="primary"
                                    danger
                                    block
                                    style={{ marginTop: 12 }}
                                    loading={cancelLoading}
                                    onClick={() => handleCancelManualBooking(String(firstSeatId))}
                                  >
                                    Отменить продажу
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Text type="secondary">Данные пассажира отсутствуют.</Text>
                            )}
                          </Card>
                        );
                      }

                      // If not booked/reserved (i.e. free seats are selected):
                      return (
                        <Card title={`Оформление оффлайн-продажи билетов (${selectedSeats.length === 1 ? `Место ${displaySeatName}` : `Мест: ${selectedSeats.length}`})`} style={{ background: "#fff" }} size="small">
                          <Form form={passengerForm} layout="vertical" onFinish={handleManualBooking}>
                            <Row gutter={12}>
                              <Col span={8}>
                                <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: "Введите фамилию" }]} style={{ marginBottom: 12 }}>
                                  <Input placeholder="Иванов" size="small" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: "Введите имя" }]} style={{ marginBottom: 12 }}>
                                  <Input placeholder="Иван" size="small" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name="middleName" label="Отчество" style={{ marginBottom: 12 }}>
                                  <Input placeholder="Иванович" size="small" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={12}>
                              <Col span={8}>
                                <Form.Item name="documentType" label="Тип документа" initialValue="passport" style={{ marginBottom: 12 }}>
                                  <Select size="small">
                                    <Select.Option value="passport">Удостоверение</Select.Option>
                                    <Select.Option value="foreign_passport">Паспорт</Select.Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name="documentNumber" label="Номер документа" rules={[{ required: true, message: "Введите номер документа" }]} style={{ marginBottom: 12 }}>
                                  <Input placeholder="012345678" size="small" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name="phoneNumber" label="Номер телефона" rules={[{ required: true, message: "Введите номер телефона" }]} style={{ marginBottom: 12 }}>
                                  <Input placeholder="+7 (707) 123-45-67" size="small" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={12}>
                              <Col span={12}>
                                <Form.Item name="iin" label="ИИН (12 цифр)" style={{ marginBottom: 16 }}>
                                  <Input placeholder="123456789012" maxLength={12} size="small" />
                                </Form.Item>
                              </Col>
                              <Col span={12} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
                                <Button type="primary" htmlType="submit" danger block loading={manualBookingLoading} icon={<CheckOutlined />} size="small" style={{ height: 32 }}>
                                  Оформить продажу
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        </Card>
                      );
                    }

                       // If not booked/reserved (i.e. free seats are selected):
                       return (
                    <Card title={`Оформление оффлайн-продажи билетов (${selectedSeats.length === 1 ? `Место ${selectedSeats[0]}` : `Мест: ${selectedSeats.length}`})`} style={{ background: "#fff" }} size="small">
                      <Form form={passengerForm} layout="vertical" onFinish={handleManualBooking}>
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: "Введите фамилию" }]} style={{ marginBottom: 12 }}>
                              <Input placeholder="Иванов" size="small" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: "Введите имя" }]} style={{ marginBottom: 12 }}>
                              <Input placeholder="Иван" size="small" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="middleName" label="Отчество" style={{ marginBottom: 12 }}>
                              <Input placeholder="Иванович" size="small" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item name="documentType" label="Тип документа" initialValue="passport" style={{ marginBottom: 12 }}>
                              <Select size="small">
                                <Select.Option value="passport">Удостоверение</Select.Option>
                                <Select.Option value="foreign_passport">Паспорт</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="documentNumber" label="Номер документа" rules={[{ required: true, message: "Введите номер документа" }]} style={{ marginBottom: 12 }}>
                              <Input placeholder="012345678" size="small" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="phoneNumber" label="Номер телефона" rules={[{ required: true, message: "Введите номер телефона" }]} style={{ marginBottom: 12 }}>
                              <Input placeholder="+7 (707) 123-45-67" size="small" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="iin" label="ИИН (12 цифр)" style={{ marginBottom: 16 }}>
                              <Input placeholder="123456789012" maxLength={12} size="small" />
                            </Form.Item>
                          </Col>
                          <Col span={12} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
                            <Button type="primary" htmlType="submit" danger block loading={manualBookingLoading} icon={<CheckOutlined />} size="small" style={{ height: 32 }}>
                              Оформить продажу
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Card>
                    );
                     })()}
                  </div>
                </div>
              </div>
            ) : (
              renderPassengersListTable()
            )}
          </Flex>
        )}
      </Card>
    );
  };

  return activeSalesTrip ? renderSalesActiveBooking() : renderSalesTable();
}
