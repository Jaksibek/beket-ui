import { Button, Card, Flex, Spin, Table, Tag, Typography, Form, Input, Select, Dropdown } from "antd";
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

const { Title, Text } = Typography;

// 53 seats constant bus scheme layout mapping coordinates
const LAYOUT_COLUMNS = [
  ['driver', null, null, null, 'door'],
  [1, 2, null, 3, 4],
  [5, 6, null, 7, 8],
  [9, 10, null, 11, 12],
  [13, 14, null, 15, 16],
  [17, 18, null, 19, 20],
  [21, 22, null, 23, 24],
  [null, null, null, null, 'door'],
  [25, 26, null, 27, 28],
  [29, 30, null, 31, 32],
  [33, 34, null, 35, 36],
  [37, 38, null, 39, 40],
  [41, 42, null, 43, 44],
  [45, 46, null, 47, 48],
  [49, 50, 51, 52, 53]
];

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

  // Active Sales flow states
  activeSalesTrip: any | null;
  setActiveSalesTrip: (trip: any | null) => void;
  activeSalesTab: string;
  setActiveSalesTab: (tab: string) => void;
  seatsLoading: boolean;
  seatsData: any[];
  selectedSeats: number[];
  setSelectedSeats: (seats: number[]) => void;

  // Forms & submission states
  passengerForm: FormInstance;
  manualBookingLoading: boolean;
  cancelLoading: boolean;

  // Callbacks
  openSalesBooking: (trip: any) => void;
  openSalesPassengers: (trip: any) => void;
  handleSeatClick: (seatNum: number) => void;
  handleManualBooking: (values: any) => void;
  handleCancelManualBooking: (seatNumber: string) => void;
  startEditPassengerDetails: (seatNumber: string, passenger: any) => void;
}

export function SalesSection({
  trips,
  buses,
  loading,
  profile,
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
    const s = seatsData.find(x => x.seatNumber === String(seatNum));
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
        width: 80,
        render: (text: string) => <Tag color="blue" style={{ fontSize: 14 }}>{text}</Tag>,
        sorter: (a: any, b: any) => Number(a.seatNumber) - Number(b.seatNumber)
      },
      {
        title: "ФИО пассажира",
        key: "name",
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary">—</Text>;
          const isOnline = p.buyerEmail !== "manual@beket.kz";
          return (
            <div>
              <Text strong>{p.lastName} {p.firstName} {p.middleName || ""}</Text>
              {isOnline && <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>Сайт</Tag>}
            </div>
          );
        }
      },
      {
        title: "Телефон",
        key: "phone",
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p || !p.buyerPhone) return <Text type="secondary">—</Text>;
          return <a href={`tel:${p.buyerPhone}`} style={{ color: "#2563eb", fontWeight: "bold" }}>{p.buyerPhone}</a>;
        }
      },
      {
        title: "Документ",
        key: "document",
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary">—</Text>;
          const docTypeStr = p.documentType === "passport" ? "Удост." : p.documentType === "foreign_passport" ? "Паспорт" : p.documentType || "—";
          return (
            <div>
              <div>{docTypeStr} №{p.documentNumber}</div>
              {p.iin && <div style={{ fontSize: 12, color: "#64748b" }}>ИИН: {p.iin}</div>}
            </div>
          );
        }
      },
      {
        title: "Билет",
        key: "ticket",
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary">—</Text>;
          return (
            <div>
              <Tag color="purple">{p.ticketNumber || "—"}</Tag>
              {p.buyerEmail !== "manual@beket.kz" && <div style={{ fontSize: 11, color: "#64748b" }}>{p.buyerEmail}</div>}
            </div>
          );
        }
      },
      {
        title: "Кем куплен",
        key: "createdByName",
        render: (_: any, record: any) => {
          const p = record.passenger;
          if (!p) return <Text type="secondary">Покупатель (Сайт)</Text>;
          const isManual = p.buyerEmail === "manual@beket.kz";
          if (!isManual) return <Tag color="cyan">Покупатель (Сайт)</Tag>;
          if (p.createdByName) return <Tag color="purple">Агент {p.createdByName}</Tag>;
          return <Tag color="default">Касса / Агент</Tag>;
        }
      },
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        render: (status: string) => (
          <Tag color={status === "Booked" ? "success" : "warning"}>
            {status === "Booked" ? "Продано" : "Забронировано"}
          </Tag>
        )
      },
      {
        title: "Действия",
        key: "action",
        width: 150,
        render: (_: any, record: any) => {
          const p = record.passenger;
          const isManual = p && p.buyerEmail === "manual@beket.kz";
          const isAgent = (profile.roles.includes("Agent") || profile.roles.includes("Cashier")) && !profile.roles.includes("Admin");

          const canEdit = p && (!isAgent || (isManual && p.createdById === profile.contactId));
          const canCancel = isManual && (!isAgent || p.createdById === profile.contactId);

          return (
            <Flex gap={8}>
              <Button
                icon={<EditOutlined />}
                onClick={() => startEditPassengerDetails(record.seatNumber, p)}
                disabled={!p || !canEdit}
                title={!p ? "Нет данных пассажира" : !canEdit ? "Вы можете редактировать только свои продажи" : "Редактировать данные пассажира"}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleCancelManualBooking(record.seatNumber)}
                disabled={!canCancel}
                title={!canCancel ? "Вы можете отменять только свои продажи" : "Отменить продажу"}
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
        pagination={false}
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
          return <Text strong>{record.routeName}</Text>;
        }
      },
      {
        title: "Автобус",
        key: "busPlateNumber",
        render: (_: any, record: any) => {
          const bs = buses.find(b => b.id === record.busId);
          return bs ? <Tag color="purple" style={{ fontSize: 13 }}>{bs.plateNumber}</Tag> : <Tag color="default">{record.busPlateNumber}</Tag>;
        }
      },
      {
        title: "Отправление",
        dataIndex: "departureTime",
        key: "departureTime",
        render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
      },
      {
        title: "Прибытие",
        dataIndex: "arrivalTime",
        key: "arrivalTime",
        render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
      },
      {
        title: "Свободные места",
        key: "seatsStat",
        render: (_: any, record: any) => (
          <Tag color={record.freeSeats === 0 ? "error" : "success"} style={{ fontSize: 13 }}>
            {record.freeSeats} из {record.totalSeats} свободно
          </Tag>
        )
      },
      {
        title: "Цена билета",
        dataIndex: "price",
        key: "price",
        render: (val: number) => <Text strong style={{ color: "#2563eb", fontSize: 15 }}>{val} KZT</Text>
      },
      {
        title: "Действия",
        key: "action",
        width: 80,
        align: "center" as const,
        render: (_: any, record: any) => {
          const menuItems = [
            {
              key: "sell",
              label: "Оформить продажу",
              icon: <ShoppingCartOutlined style={{ color: "#22c55e", fontSize: 16 }} />,
              onClick: () => openSalesBooking(record),
            },
            {
              key: "passengers",
              label: "Список пассажиров",
              icon: <TeamOutlined style={{ color: "#3b82f6", fontSize: 16 }} />,
              onClick: () => openSalesPassengers(record),
            },
          ];

          return (
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: 20 }} />}
                disabled={!profile.carrierId}
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
              <div className={styles.seatModalContainer}>
                {/* Left: Custom Bus scheme representation */}
                <div className={styles.busLayoutContainer}>
                  <div className={styles.schemeContainer}>
                    <div className={styles.seatRow}>
                      {[...LAYOUT_COLUMNS].reverse().map((col, colIndex) => (
                        <div key={colIndex} className={styles.seatsGrid}>
                          {col.map((cell, rowIndex) => {
                            if (cell === null) {
                              return <div key={`empty-${colIndex}-${rowIndex}`} className={styles.emptySpace} />;
                            }
                            if (cell === "driver") {
                              return (
                                <div key={`driver-${colIndex}-${rowIndex}`} className={styles.driverCell}>
                                  <div className={styles.wheel}></div>
                                </div>
                              );
                            }
                            if (cell === "door") {
                              return <div key={`door-${colIndex}-${rowIndex}`} className={styles.facility}>ВХОД</div>;
                            }

                            const seatNum = cell as number;
                            const { status, price } = getSeatState(seatNum);

                            return (
                              <div
                                key={seatNum}
                                className={`${styles.customSeat} ${styles[status]}`}
                                onClick={() => handleSeatClick(seatNum)}
                              >
                                <span className={styles.seatNum}>{seatNum}</span>
                                {price > 0 && <span className={styles.seatPrice}>{price} ₸</span>}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Side operations pane */}
                <div className={styles.sidePanel}>
                  {/* Legend */}
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 10 }}>Обозначения мест</Text>
                    <Flex vertical gap={6}>
                      <Flex align="center" gap={8}>
                        <div className={`${styles.legendBox} ${styles.free}`}></div>
                        <Text>Свободно</Text>
                      </Flex>
                      <Flex align="center" gap={8}>
                        <div className={`${styles.legendBox} ${styles.reserved}`}></div>
                        <Text>Бронь (сессия)</Text>
                      </Flex>
                      <Flex align="center" gap={8}>
                        <div className={`${styles.legendBox} ${styles.booked}`}></div>
                        <Text>Продано / Занято</Text>
                      </Flex>
                      <Flex align="center" gap={8}>
                        <div className={`${styles.legendBox} ${styles.selected}`}></div>
                        <Text>Выбрано вами</Text>
                      </Flex>
                    </Flex>
                  </div>

                  <hr style={{ border: "0.5px solid #e2e8f0", margin: "4px 0" }} />

                  {/* Dynamic details / Actions form */}
                  {selectedSeats.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">Выберите свободные места на схеме автобуса для оформления оффлайн-продажи.</Text>
                    </div>
                  ) : (() => {
                    const firstSeatNum = selectedSeats[0];
                    const seatInfo = seatsData.find(s => s.seatNumber === String(firstSeatNum));
                    const isBooked = seatInfo && seatInfo.status === "Booked";
                    const isReserved = seatInfo && seatInfo.status === "Reserved";

                    if (isBooked || isReserved) {
                      const passenger = seatInfo?.passenger;
                      const isManualSale = passenger && passenger.buyerEmail === "manual@beket.kz";

                      return (
                        <div>
                          <Title level={5} style={{ marginBottom: 12 }}>
                            Место {firstSeatNum} ({isBooked ? "Продано" : "Зарезервировано"})
                          </Title>

                          <Card size="small" title="Информация о пассажире" style={{ background: "#fff", marginBottom: 16 }}>
                            {passenger ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {!isManualSale && <div><Tag color="cyan" style={{ marginBottom: 4 }}>Онлайн покупка (Сайт)</Tag></div>}
                                <div><Text type="secondary">ФИО:</Text> <strong>{passenger.lastName} {passenger.firstName} {passenger.middleName || ""}</strong></div>
                                <div><Text type="secondary">Документ:</Text> {passenger.documentType === "passport" ? "Удостоверение" : passenger.documentType === "foreign_passport" ? "Паспорт" : passenger.documentType || "—"} №{passenger.documentNumber || "—"}</div>
                                {passenger.iin && <div><Text type="secondary">ИИН:</Text> {passenger.iin}</div>}
                                <div><Text type="secondary">Билет:</Text> <Tag color="blue">{passenger.ticketNumber || "—"}</Tag></div>
                                <div><Text type="secondary">Телефон:</Text> {passenger.buyerPhone ? <a href={`tel:${passenger.buyerPhone}`} style={{ color: "#2563eb", fontWeight: "bold" }}>{passenger.buyerPhone}</a> : "—"}</div>
                                {!isManualSale && <div><Text type="secondary">Email:</Text> {passenger.buyerEmail || "—"}</div>}
                                {isManualSale && passenger.createdByName && <div><Text type="secondary">Продал:</Text> <Tag color="purple">Агент {passenger.createdByName}</Tag></div>}
                                {isManualSale && !passenger.createdByName && <div><Text type="secondary">Продал:</Text> <Tag color="default">Касса / Агент</Tag></div>}
                              </div>
                            ) : (
                              <Text type="secondary">Данные пассажира отсутствуют.</Text>
                            )}
                          </Card>

                          {isManualSale && (
                            <Button
                              type="primary"
                              danger
                              block
                              loading={cancelLoading}
                              onClick={() => handleCancelManualBooking(String(firstSeatNum))}
                            >
                              Отменить продажу
                            </Button>
                          )}
                        </div>
                      );
                    }

                    // If not booked/reserved (i.e. free seats are selected):
                    return (
                      <div>
                        <Title level={5}>Выбрано мест: {selectedSeats.length}</Title>
                        <Text style={{ display: "block", marginBottom: 6 }}>Номера: {selectedSeats.join(", ")}</Text>
                        <Text strong style={{ display: "block", marginBottom: 12, fontSize: 15, color: "#2563eb" }}>
                          Итого к оплате: {selectedSeats.reduce((acc, num) => acc + (getSeatState(num).price || 0), 0)} KZT
                        </Text>

                        {/* Manual sale form */}
                        <Card size="small" title="Пассажирские данные" style={{ background: "#fff" }}>
                          <Form form={passengerForm} layout="vertical" onFinish={handleManualBooking}>
                            <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: "Введите фамилию" }]}>
                              <Input placeholder="Иванов" size="small" />
                            </Form.Item>
                            <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: "Введите имя" }]}>
                              <Input placeholder="Иван" size="small" />
                            </Form.Item>
                            <Form.Item name="middleName" label="Отчество">
                              <Input placeholder="Иванович" size="small" />
                            </Form.Item>
                            <Form.Item name="documentType" label="Тип документа" initialValue="passport">
                              <Select size="small">
                                <Select.Option value="passport">Удостоверение</Select.Option>
                                <Select.Option value="foreign_passport">Паспорт</Select.Option>
                              </Select>
                            </Form.Item>
                            <Form.Item name="documentNumber" label="Номер документа" rules={[{ required: true, message: "Введите номер документа" }]}>
                              <Input placeholder="012345678" size="small" />
                            </Form.Item>
                            <Form.Item name="phoneNumber" label="Номер телефона" rules={[{ required: true, message: "Введите номер телефона" }]}>
                              <Input placeholder="+7 (707) 123-45-67" size="small" />
                            </Form.Item>
                            <Form.Item name="iin" label="ИИН (12 цифр)">
                              <Input placeholder="123456789012" maxLength={12} size="small" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" danger block loading={manualBookingLoading} icon={<CheckOutlined />}>
                              Оформить продажу
                            </Button>
                          </Form>
                        </Card>
                      </div>
                    );
                  })()}
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
