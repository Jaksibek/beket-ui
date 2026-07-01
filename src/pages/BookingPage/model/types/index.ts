import type { ITrip } from "@/pages/SearchPage";

export type DocumentTypeCode = "id_card" | "passport" | "birth_certificate" | "foreign_passport";

export type BookingStep = "form" | "payment" | "success";

export interface IPassenger {
  lastName: string;
  firstName: string;
  middleName?: string;
  documentType: DocumentTypeCode;
  documentNumber: string;
  iin?: string;
}

export interface IBookingFormValues {
  passengers: IPassenger[];
  email: string;
  phone: string;
}

export interface BookingLocationState {
  trip: ITrip;
  selectedSeats: (string | number)[];
  bookingId?: string;
  expiresAt?: string;
}

export interface IBookingSession {
  step: BookingStep;
  trip: ITrip;
  selectedSeats: (string | number)[];
  passengers: IPassenger[];
  email: string;
  phone: string;
  createdAt: number; // Timestamp when booking was created
  bookingId: string;
  expiresAt: string;
  ticketId?: string; // Generated on successful payment
}
