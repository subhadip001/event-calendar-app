// app/types/event.ts

// export type EventTag = "meeting" | "personal" | "work" | "important" | "other";

export enum EventTagEnum {
  MEETING = "meeting",
  PERSONAL = "personal",
  WORK = "work",
  IMPORTANT = "important",
  OTHER = "other",
}

export type Event = {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  tag: EventTagEnum;
  created_at?: string;
  updated_at?: string;
};

export type CreateEventInput = Omit<
  Event,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type UpdateEventInput = Partial<CreateEventInput>;

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  tag?: EventTagEnum;
}
