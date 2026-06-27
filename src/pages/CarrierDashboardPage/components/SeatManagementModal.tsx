import { Button, Card, Form, InputNumber, Modal, Spin, Typography } from "antd";
import dayjs from "dayjs";
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
                          onClick={() => onSeatClick(seatNum)}
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
