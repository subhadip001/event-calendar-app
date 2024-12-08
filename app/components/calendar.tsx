"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { WeeklyCalendar } from "./WeeklyCalendar";

export default function Calendar() {
  const { user, loading } = useAuthContext();
  const { events } = useEvents();

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(events);

  return (
    <div>
      <WeeklyCalendar />
    </div>
  );
}
