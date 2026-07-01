import { Button, Card, Form, InputNumber, Modal, Spin, Typography, Tooltip } from "antd";
import dayjs from "dayjs";
import styles from "../ui/CarrierDashboardPage.module.scss";
import { BusScheme53Seats } from "@/widgets/SeatSelectionModal/ui/BusSchemes/BusScheme53Seats";
import { AgentSchemeSleeperYutong36 } from "@/widgets/SeatSelectionModal/ui/BusSchemes/AgentSchemeSleeperYutong36";
import { AgentSchemeSleeperYutong40 } from "@/widgets/SeatSelectionModal/ui/BusSchemes/AgentSchemeSleeperYutong40";

const { Title, Text } = Typography;

// Dynamic premium seat management layout mapping coordinates

interface SeatManagementModalProps {
  isOpen: boolean;
  onCancel: () => void;
  selectedTrip: any;
  seatsLoading: boolean;
  seatsData: any[];
  selectedSeats: (string | number)[];
  onSeatClick: (seatNum: string | number) => void;
  individualPrice: number | null;
  setIndividualPrice: (price: number | null) => void;
  handleUpdatePrices: () => void;
  priceSubmitting: boolean;
  buses: any[];
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
  buses,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          {/* Top: Full width bus scheme representation */}
          <div className={styles.busLayoutContainer} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "28px 16px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {(() => {
                const tripBus = buses.find(b => b.id === selectedTrip?.busId);
                const schemeName = (selectedTrip?.seatSchemeName || tripBus?.seatSchemeName || '').toLowerCase();

                if (schemeName.includes('sleeper') || schemeName.includes('спальн') || schemeName.includes('спальный')) {
                  if (schemeName.includes('36')) {
                    return <AgentSchemeSleeperYutong36 seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={onSeatClick} />;
                  }
                  return <AgentSchemeSleeperYutong40 seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={onSeatClick} />;
                }

                switch (schemeName) {
                  default:
                    return <BusScheme53Seats seatsData={seatsData} selectedSeats={selectedSeats} onSeatClick={onSeatClick} isAgent={true} />;
                }
              })()}
            </div>
          </div>

          {/* Bottom: Pricing form */}
          <div style={{ width: "100%" }}>
            {selectedSeats.length === 0 ? (
              <Card style={{ background: "#f8fafc", textAlign: "center", padding: "32px 20px", border: "1px dashed #cbd5e1" }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Выберите одно или несколько мест на схеме автобуса выше для установки тарифа.
                </Text>
              </Card>
            ) : (
              <Card title={`Управление ценами рейса (${selectedSeats.length === 1 ? `Место ${selectedSeats[0]}` : `Мест: ${selectedSeats.length}`})`} style={{ background: "#fff" }} size="small">
                <Text style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
                  Выбранные номера: <strong>{selectedSeats.map(num => String(num) === '0' ? '01' : (String(num) === '00' ? '02' : num)).join(", ")}</strong>
                </Text>
                
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Установить цену (KZT)</Text>
                    <InputNumber
                      style={{ width: "100%" }}
                      value={individualPrice}
                      onChange={setIndividualPrice}
                      placeholder="Например, 5000"
                      min={0}
                    />
                  </div>
                  <Button type="primary" onClick={handleUpdatePrices} loading={priceSubmitting} style={{ height: 32 }} disabled={individualPrice === null}>
                    Сохранить тариф
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
