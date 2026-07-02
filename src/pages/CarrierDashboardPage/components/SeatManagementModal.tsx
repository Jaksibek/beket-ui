import { Button, Card, InputNumber, Modal, Spin, Typography } from "antd";
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
  const formatSeatKey = (key: string | number) => {
    const parts = String(key).split('_');
    const num = parts[0];
    const level = parts[1];
    const cleanNum = num === '0' ? '01' : (num === '00' ? '02' : num);
    const deckLabel = level ? (level === '2' ? ' (верх)' : ' (низ)') : '';
    return cleanNum + deckLabel;
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

                const isSleeperData = seatsData.some(s => s.level === 2 || s.Level === 2);
                if (isSleeperData || schemeName.includes('sleeper') || schemeName.includes('спальн') || schemeName.includes('спальный')) {
                  if (schemeName.includes('36') || seatsData.length <= 38) {
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

          {/* Legend for seat levels / bunks */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "0 16px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 2, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}></div>
              <Text style={{ fontSize: 13 }}>Нижние места</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}></div>
              <Text style={{ fontSize: 13 }}>Верхние места</Text>
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
              <Card title={`Управление ценами рейса (${selectedSeats.length === 1 ? `Место ${formatSeatKey(selectedSeats[0])}` : `Мест: ${selectedSeats.length}`})`} style={{ background: "#fff" }} size="small">
                <Text style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
                  Выбранные номера: <strong>{selectedSeats.map(formatSeatKey).join(", ")}</strong>
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
