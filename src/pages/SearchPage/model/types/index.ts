interface TripRoute {
  arrivalTime: string;
  departureTime: string;
  distanceKm: number;
  duration: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
}

interface IBus {
  brand: string;
  model: string;
  seatsCount: number;
  seatType: string;
  seatSchemeName: string;
  seatTypeCode: SeatTypeCodeEnum;

  hasAC: boolean;
  hasCharger: boolean;
  hasWifi: boolean;
  hasTv: boolean;
}

export interface ITrip {
  tripId: string;
  route: TripRoute;
  bus: IBus;
  price: number;
}

export type SeatTypeCodeEnum = "1" | "2";

export interface ISeat {
  id: string;
  number: string | null;
  row: number;
  column: number;
  status: 'Free' | 'Reserved' | 'Booked';
  price: number;
  isWindow: boolean;
  cellTypeCode: 'seat' | 'aisle' | 'door' | 'wc' | 'driver' | 'empty';
  type: string;
}

export interface ITripSeatsResponse {
  tripId: string;
  totalSeats: number;
  freeSeats: number;
  reservedSeats: number;
  bookedSeats: number;
  seats: ISeat[];
}
