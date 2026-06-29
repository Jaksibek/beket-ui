import { Button, Card, Form, InputNumber, Modal, Spin, Typography } from "antd";
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
    const s = seatsData.find(x => x.seatNumber === String(seatNum));
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
            <div className={styles.schemeContainer}>
              <div className={styles.seatRow}>
                {(() => {
                  const maxRow = Math.max(...seatsData.map(s => s.row ?? s.Row ?? 0), 0);
                  const maxCol = Math.max(...seatsData.map(s => s.column ?? s.Column ?? 0), 0);

                  const grid: any[][] = [];
                  for (let r = 0; r <= maxRow; r++) {
                    grid[r] = new Array(maxCol + 1).fill(null);
                  }
                  seatsData.forEach(s => {
                    const row = s.row ?? s.Row ?? 0;
                    const col = s.column ?? s.Column ?? 0;
                    if (row <= maxRow && col <= maxCol) {
                      grid[row][col] = s;
                    }
                  });

                  return [...grid].reverse().map((rowCells, rIdx) => (
                    <div key={rIdx} className={styles.seatsGrid}>
                      {rowCells.map((cell, cIdx) => {
                        if (!cell) {
                          return <div key={`empty-${rIdx}-${cIdx}`} className={styles.emptySpace} />;
                        }

                        const code = cell.cellTypeCode || cell.CellTypeCode || "empty";
                        if (code === "aisle" || code === "empty") {
                          return <div key={`aisle-${rIdx}-${cIdx}`} className={styles.emptySpace} />;
                        }

                        if (code === "driver") {
                          return (
                            <div key={`driver-${rIdx}-${cIdx}`} className={styles.driverCell}>
                              <div className={styles.wheel}></div>
                            </div>
                          );
                        }

                        if (code === "door") {
                          return <div key={`door-${rIdx}-${cIdx}`} className={styles.facility}>EXIT</div>;
                        }

                        if (code === "wc") {
                          return <div key={`wc-${rIdx}-${cIdx}`} className={styles.facility} style={{ background: "#7f1d1d", color: "#fca5a5" }}>WC</div>;
                        }

                        const seatNum = Number(cell.seatNumber || cell.Number || 0);
                        const { status, price } = getSeatState(seatNum);
                        const isVip = cell.type?.toUpperCase() === "VIP" || cell.Type?.toUpperCase() === "VIP";

                        return (
                          <div
                            key={seatNum}
                            className={`${styles.customSeat} ${styles[status]} ${isVip ? styles.vipSeat : ""}`}
                            style={isVip && status === "free" ? {
                              background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                              borderColor: "#ca8a04"
                            } : {}}
                            onClick={() => onSeatClick(seatNum)}
                          >
                            <span className={styles.seatNum}>{seatNum}</span>
                            {price > 0 && <span className={styles.seatPrice}>{price} ₸</span>}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
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
