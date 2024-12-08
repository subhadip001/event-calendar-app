"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { WeeklyCalendar } from "./WeeklyCalendar";

export default function Calendar() {
  const { user, loading } = useAuthContext();
  const { ownerEvents } = useEvents();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <WeeklyCalendar />
    </div>
  );
}
