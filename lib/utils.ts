import { Event } from "./types";
import {
  format,
  startOfWeek,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  isSameDay,
  differenceInMinutes,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";

export const getEventStyle = (event: Event, day: Date) => {
  const eventStart = new Date(event.start_datetime);
  const eventEnd = new Date(event.end_datetime);
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  let start = eventStart;
  let end = eventEnd;

  if (isBefore(start, dayStart)) {
    start = dayStart;
  }
  if (isAfter(end, dayEnd)) {
    end = dayEnd;
  }

  const topPosition = (differenceInMinutes(start, dayStart) / 60) * 60;
  const height = (differenceInMinutes(end, start) / 60) * 60;

  return {
    top: `${topPosition}px`,
    height: `${height}px`,
  };
};

export const getEventColor = (tag: string) => {
  const colors: { [key: string]: string } = {
    work: "bg-blue-500",
    meeting: "bg-green-500",
    personal: "bg-purple-500",
    important: "bg-red-500",
    other: "bg-gray-500",
  };
  return colors[tag] || colors.other;
};
