import { clsx } from "clsx";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

export const cn = (...inputs) => clsx(...inputs);
export const formatDate = (date) => format(new Date(date), "MMM dd, yyyy");
export const formatTime = (date) => format(new Date(date), "hh:mm a");
export const formatDateTime = (date) =>
  format(new Date(date), "MMM dd, yyyy • hh:mm a");
export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });
export const friendlyDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM dd, yyyy");
};
