import { clsx, type ClassValue } from "clsx";
import {
  differenceInMinutes,
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { twMerge } from "tailwind-merge";
import { Event } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export const isMultiDayEvent = (event: Event) => {
  return !isSameDay(
    new Date(event.start_datetime),
    new Date(event.end_datetime)
  );
};

export const getEventsForDay = (day: Date, events: Event[]) => {
  return events.filter(
    (event) =>
      isSameDay(new Date(event.start_datetime), day) ||
      isSameDay(new Date(event.end_datetime), day) ||
      (isAfter(day, new Date(event.start_datetime)) &&
        isBefore(day, new Date(event.end_datetime)))
  );
};
