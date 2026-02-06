import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function getRiskColor(risk: number): string {
  if (risk >= 8) return "red";
  if (risk >= 5) return "yellow";
  return "green";
}

export function getRiskLabel(risk: number): string {
  if (risk >= 8) return "High";
  if (risk >= 5) return "Medium";
  return "Low";
}
