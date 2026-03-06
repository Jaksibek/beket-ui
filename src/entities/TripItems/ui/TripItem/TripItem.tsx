import { useState } from "react";
import { MinusOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Typography } from "antd";
import type { ITrip } from "@/pages/SearchPage";
import { useResponsive } from "@/shared/lib/hooks/useResponsive";
import TripItemInfo from "./TripInfo/TripItemInfo";
import TripItemAllTime from "./TrimItemAllTime/TripItemAllTime";
import styles from "./TripItem.module.scss";
import TripItemBottom from "./TripItemBottom/TripItemBottom";
import { SeatSelectionModal } from "@/widgets/SeatSelectionModal";

const { Title, Paragraph } = Typography;

interface IProps {
  data: ITrip;
}

function TripItem({ data }: IProps) {
  const { sm } = useResponsive();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { bus, route, price } = data;
  const { brand, model, seatType, seatsCount } = bus;
  const {
    fromCity,
    toCity,
    fromStation,
    toStation,
    departureTime,
    arrivalTime,
  } = route;

  return (
    <Col span={24}>
      <Card hoverable className={styles.card}>
        <Flex vertical={!sm} justify="space-between" gap={20}>
          <Flex vertical className={styles.left}>
            <Title level={sm ? 4 : 5} className={styles.title}>
              {brand} {model}
            </Title>
            <Paragraph type="secondary" className={styles.fromCityDesc}>
              {fromCity} <MinusOutlined /> {toCity}
            </Paragraph>
          </Flex>

          <Flex
            align="center"
            justify="space-between"
            gap={10}
            className={styles.right}
          >
            <TripItemInfo time={departureTime} station={fromStation} />

            <TripItemAllTime
              departureTime={departureTime}
              arrivalTime={arrivalTime}
            />

            <TripItemInfo
              time={arrivalTime}
              station={toStation}
              positionRight
            />
          </Flex>
        </Flex>
        <TripItemBottom
          price={price}
          seatsCount={seatsCount}
          seatType={seatType}
          onSelectSeats={() => setIsModalOpen(true)}
        />
      </Card>
      <SeatSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={data}
      />
    </Col>
  );
}

export default TripItem;
