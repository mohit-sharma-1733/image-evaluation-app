import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500/90 text-white dark:bg-green-600 dark:text-white"
  if (score >= 80) return "bg-blue-500/90 text-white dark:bg-blue-600 dark:text-white"
  if (score >= 70) return "bg-yellow-500/90 text-white dark:bg-yellow-600 dark:text-white"
  return "bg-red-500/90 text-white dark:bg-red-600 dark:text-white"
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 90) return "score-excellent"
  if (score >= 80) return "score-good"
  if (score >= 70) return "score-fair"
  return "score-poor"
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent"
  if (score >= 80) return "Good"
  if (score >= 70) return "Fair"
  if (score >= 60) return "Needs Improvement"
  return "Poor"
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getMediaType(path: string): "image" | "video" {
  const ext = path.split(".").pop()?.toLowerCase()
  if (["mp4", "webm", "ogg", "mov"].includes(ext || "")) {
    return "video"
  }
  return "image"
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
