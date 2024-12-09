"use client";

import { CreateEventInput, Event, EventTagEnum } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useContext,
  useState
} from "react";

type EventContextType = {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  selectedUserEvents: Event[];
  setSelectedUserEvents: (events: Event[]) => void;
  showEventForm: boolean;
  setShowEventForm: (show: boolean) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  eventForm: CreateEventInput;
  setEventForm: (event: CreateEventInput) => void;
};

const EventContext = createContext<EventContextType>({
  selectedUserId: null,
  setSelectedUserId: () => {},
  selectedUserEvents: [],
  setSelectedUserEvents: () => {},
  showEventForm: false,
  setShowEventForm: () => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  eventForm: {
    name: "",
    description: "",
    start_datetime: new Date().toISOString(),
    end_datetime: new Date().toISOString(),
    tag: EventTagEnum.WORK,
  },
  setEventForm: () => {},
});

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEvents, setSelectedUserEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<CreateEventInput>({
    name: "",
    description: "",
    start_datetime: new Date().toISOString(),
    end_datetime: new Date().toISOString(),
    tag: EventTagEnum.WORK,
  });

  return (
    <EventContext.Provider
      value={{
        selectedUserId,
        setSelectedUserId,
        selectedUserEvents,
        setSelectedUserEvents,
        showEventForm,
        setShowEventForm,
        selectedEvent,
        setSelectedEvent,
        eventForm,
        setEventForm,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
}
