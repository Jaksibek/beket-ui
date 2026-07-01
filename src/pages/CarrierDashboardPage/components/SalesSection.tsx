import { Button, Card, Flex, Spin, Table, Tag, Typography, Form, Input, Select, Dropdown, Tooltip } from "antd";
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
              <div className={styles.seatModalContainer}>
                {/* Left: Custom Bus scheme representation */}
                <div className={styles.busLayoutContainer}>
                  <div className={styles.schemeContainer} style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
                    {(() => {
                      const isSleeper = seatsData.some(s => s.level === 2 || s.Level === 2);

          const normalizeSleeperSeats = (seats: any[]) => {
      if (!isSleeper) return seats;
      let mapped = seats.map(s => {
        let row = s.row ?? s.Row ?? 0;
        let col = s.column ?? s.Column ?? 0;
        let numStr = String(s.seatNumber || s.Number || s.seatNo || s.SeatNo || s.number || "");
        let level = s.level ?? s.Level ?? 1;

        if (row === 1) {
          if (numStr === "00" && level === 2) {
            numStr = "02";
            row = 1;
            col = 1;
          } else if (numStr === "00" && level === 1) {
            numStr = "02";
            row = 2;
            col = 1;
          } else if (numStr === "0" && level === 2) {
            numStr = "01";
            row = 1;
            col = 0;
          } else if (numStr === "0" && level === 1) {
            numStr = "01";
            row = 2;
            col = 0;
          }
        } else if (row >= 2) {
          row = row + 1;
        }

        const isBack = s.isLastSeat || s.IsLastSeat;
        if (isBack) {
          const num = Number(numStr || 0);
          if (num === 15) col = 0;
          else if (num === 16) col = 1;
          else if (num === 17) col = 3;
          else if (num === 18) col = 4;
        }

        let code = s.cellTypeCode || s.CellTypeCode;
        if (code === 'driver') {
          col = 0;
        } else if (code === 'door') {
          if (row === 0) {
            code = 'empty';
          } else {
            col = 4;
          }
        }

        return {
          ...s,
          seatNumber: numStr,
          number: numStr,
          Number: numStr,
          row,
          Row: row,
          column: col,
          Column: col,
          cellTypeCode: code,
          CellTypeCode: code
        };
      });

      // Inject virtual exit door in Row 1 and 2 Col 4

      mapped.push({
        id: "virtual-exit-door-row2",
        cellTypeCode: "door",
        CellTypeCode: "door",
        row: 2,
        Row: 2,
        column: 4,
        Column: 4,
        level: 1,
        Level: 1,
        status: "Free",
        Status: "Free",
        price: 0,
        Price: 0,
        isWindow: false,
        type: "door"
      });

      return mapped;
    };

    const normalizedSeats = normalizeSleeperSeats(seatsData);

    const renderSingleDeck = (deckSeats: any[], deckRowCount: number, deckColCount: number, borderClrAccent: string) => {
                        const maxRow = deckRowCount;
                        const maxCol = deckColCount;

                        const grid: any[][] = [];
                        for (let r = 0; r <= maxRow; r++) {
                          grid[r] = new Array(maxCol + 1).fill(null);
                        }
                        deckSeats.forEach(s => {
                          const row = s.row ?? s.Row ?? 0;
                          const col = s.column ?? s.Column ?? 0;
                          if (row <= maxRow && col <= maxCol) {
                            grid[row][col] = s;
                          }
                        });

                        return (
                          <div className={styles.schemeContainer} style={{ border: `3px solid ${borderClrAccent}`, borderRadius: "24px", padding: "24px 20px 24px 32px", background: "#f8fafc", display: "inline-block", position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                            <div className={styles.seatRow} style={isSleeper ? { alignItems: "stretch" } : {}}>
                              {[...grid].reverse().map((rowCells, rIdx) => {
                                const isBackRow = isSleeper && rowCells.some(cell => cell && (cell.isLastSeat || cell.IsLastSeat));

                                return (
                                  <div key={rIdx} className={styles.seatsGrid} style={isBackRow ? { alignSelf: "stretch" } : {}}>
                                    {rowCells.map((cell, cIdx) => {
                                      if (!cell) {
                                        if (isBackRow && cIdx === 2) {
                                          return null;
                                        }
                                        return <div key={`empty-${rIdx}-${cIdx}`} className={styles.emptySpace} style={cIdx === 2 ? { height: '12px' } : undefined} />;
                                      }

                                      const code = cell.cellTypeCode || cell.CellTypeCode || "empty";
                                      if (code === "aisle" || code === "empty") {
                                        if (isBackRow && cIdx === 2) {
                                          return null;
                                        }
                                        return <div key={`aisle-${rIdx}-${cIdx}`} className={styles.emptySpace} style={cIdx === 2 ? { height: '12px' } : undefined} />;
                                      }

                                      if (code === "driver") {
                                        return (
                                          <div key={`driver-${rIdx}-${cIdx}`} className={styles.driverCell} style={{ background: '#cbd5e1', border: '1px solid #94a3b8' }}>
                                            <div className={styles.wheel} style={{ borderColor: '#475569' }}></div>
                                          </div>
                                        );
                                      }

                                      if (code === "door") {
                                        return <div key={`door-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: '#15803d', borderColor: '#166534', color: '#fff' }}>EXIT</div>;
                                      }

                                      if (code === "wc") {
                                        return <div key={`wc-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: "#7f1d1d", color: "#fca5a5" }}>WC</div>;
                                      }

                                      const seatNum = Number(cell.seatNumber || cell.Number || cell.seatNo || cell.SeatNo || 0);
                                      const { status, price } = getSeatState(seatNum);
                                      const isVip = cell.type?.toUpperCase() === "VIP" || cell.Type?.toUpperCase() === "VIP";
                                      const level = cell.level ?? cell.Level;

                                      let customStyle: React.CSSProperties = {};
                                      if (level === 2) {
                                        if (status === "free") {
                                          customStyle = {
                                            background: "#3b82f6",
                                            borderColor: "#2563eb",
                                            color: "#fff"
                                          };
                                        } else if (status === "selected") {
                                          customStyle = {
                                            background: "#1d4ed8",
                                            borderColor: "#fbbf24",
                                            color: "#fff",
                                            boxShadow: "0 0 8px #fbbf24"
                                          };
                                        }
                                      } else if (level === 1) {
                                        if (status === "free") {
                                          customStyle = {
                                            background: "#22c55e",
                                            borderColor: "#16a34a",
                                            color: "#fff"
                                          };
                                        } else if (status === "selected") {
                                          customStyle = {
                                            background: "#15803d",
                                            borderColor: "#fbbf24",
                                            color: "#fff",
                                            boxShadow: "0 0 8px #fbbf24"
                                          };
                                        }
                                      } else if (isVip && status === "free") {
                                        customStyle = {
                                          background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                                          borderColor: "#ca8a04"
                                        };
                                      }

                                      const tooltipTitle = level === 2 ? "Верхний" : "Нижний";

                                      const seatElement = (
                                        <div
                                          className={`${styles.customSeat} ${styles[status]} ${isVip ? styles.vipSeat : ""}`}
                                          style={{
                                            ...customStyle,
                                            height: isBackRow ? "100%" : undefined
                                          }}
                                          onClick={() => handleSeatClick(seatNum)}
                                        >
                                          <span className={styles.seatNum}>{cell.seatNumber || cell.Number || cell.seatNo || cell.SeatNo || seatNum}</span>
                                          {price > 0 && <span className={styles.seatPrice}>{price} ₸</span>}
                                        </div>
                                      );

                                      return (
                                        <div key={seatNum} style={{ display: "inline-block", flex: isBackRow ? "1" : "none", height: isBackRow ? "100%" : "auto" }}>
                                          <Tooltip title={tooltipTitle}>
                                            {seatElement}
                                          </Tooltip>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      };

                      const maxRow = Math.max(...normalizedSeats.map(s => s.row ?? s.Row ?? 0), 0);
                      const maxCol = Math.max(...normalizedSeats.map(s => s.column ?? s.Column ?? 0), 0);
                      return renderSingleDeck(normalizedSeats, maxRow, maxCol, "#cbd5e1");
                    })()}
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
