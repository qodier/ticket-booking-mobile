import { ApiResponse } from "./api";

export type EventResponse = ApiResponse<Event>;
export type EventListResponse = ApiResponse<Event[]>;

export type Event = {
  id: number;
  uuid?: string;
  name: string;
  location: string;
  totalTicketsPurchased: number;
  totalTicketsEntered: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}
