import { Button, Card, Form, InputNumber, Modal, Spin, Typography, Tooltip } from "antd";
import dayjs from "dayjs";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

// Dynamic premium seat management layout mapping coordinates

interface SeatManagementModalProps {
  isOpen: boolean;
  onCancel: () => void;
  selectedTrip: any;
  seatsLoading: boolean;
  seatsData: any[];
  selectedSeats: number[];
  onSeatClick: (seatNum: number) => void;
  individualPrice: number | null;
  setIndividualPrice: (price: number | null) => void;
  handleUpdatePrices: () => void;
  priceSubmitting: boolean;
}

export function SeatManagementModal({
  isOpen,
  onCancel,
  selectedTrip,
  seatsLoading,
  seatsData,
  selectedSeats,
  onSeatClick,
  individualPrice,
  setIndividualPrice,
  handleUpdatePrices,
  priceSubmitting,
}: SeatManagementModalProps) {

  // Helper getters
  const getSeatState = (seatNum: number) => {
    const s = seatsData.find(x => (x.number || x.Number || x.seatNumber) === String(seatNum));
    if (!s) return { status: "free", price: 0 };

    const isSelected = selectedSeats.includes(seatNum);
    if (isSelected) {
      return { status: "selected", price: s.price };
    }

    return { status: s.status.toLowerCase(), price: s.price };
  };

  return (
    <Modal
      title={
        selectedTrip ? (
          <div style={{ paddingBottom: 10 }}>
            <Title level={4} style={{ margin: 0 }}>Управление ценами на рейсе</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Рейс: {selectedTrip.routeName || "Маршрут"} | Отправление: {dayjs(selectedTrip.departureTime).format("DD.MM.YYYY HH:mm")}
            </Text>
          </div>
        ) : ""
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={1100}
      destroyOnClose
    >
      {seatsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spin size="large" tip="Загрузка схемы мест..." />
        </div>
      ) : (
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
                                    onClick={() => onSeatClick(seatNum)}
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
            <div>
              <Title level={5} style={{ marginTop: 0 }}>Управление ценами</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Выберите свободные места на схеме для изменения стоимости.
              </Text>
            </div>

            <hr style={{ border: "0.5px solid #e2e8f0", margin: "8px 0" }} />

            {selectedSeats.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Text type="secondary">Выберите одно или несколько мест на схеме для установки тарифа.</Text>
              </div>
            ) : (
              <div>
                <Title level={5}>Выбрано мест: {selectedSeats.length}</Title>
                <Text style={{ display: "block", marginBottom: 12 }}>Номера: {selectedSeats.join(", ")}</Text>

                <Card size="small" title="Изменение цен" style={{ background: "#fff" }}>
                  <Form layout="vertical">
                    <Form.Item label="Установить цену (KZT)">
                      <InputNumber
                        style={{ width: "100%" }}
                        value={individualPrice}
                        onChange={setIndividualPrice}
                        min={0}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      block
                      onClick={handleUpdatePrices}
                      loading={priceSubmitting}
                      disabled={individualPrice === null}
                    >
                      Применить цены
                    </Button>
                  </Form>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
