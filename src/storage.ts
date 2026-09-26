import type { Progress } from './data'

export type StoredProgress = Record<string, Progress>
const keyFor = (userId: string) => `dsa-progress-tracker-progress-${userId}`

export function loadProgress(userId: string): StoredProgress {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    return raw ? JSON.parse(raw) as StoredProgress : {}
  } catch { return {} }
}
export function saveProgress(userId: string, progress: StoredProgress) {
  localStorage.setItem(keyFor(userId), JSON.stringify(progress))
}
export function clearProgress(userId: string) { localStorage.removeItem(keyFor(userId)) }

