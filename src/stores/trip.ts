import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

interface IPersistedTripState {
  favorites: string[]
  completed: string[]
  notes: Record<string, string>
  checklist: Record<string, boolean>
  theme: 'system' | 'light' | 'dark'
}

const STORAGE_KEY = 'au-trip-map:user-state:v1'

function loadState(): IPersistedTripState {
  const fallback: IPersistedTripState = {
    favorites: [],
    completed: [],
    notes: {},
    checklist: {},
    theme: 'system',
  }
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? { ...fallback, ...JSON.parse(value) } : fallback
  } catch {
    return fallback
  }
}

export const useTripStore = defineStore('trip', () => {
  const initial = loadState()
  const favorites = ref(initial.favorites)
  const completed = ref(initial.completed)
  const notes = ref(initial.notes)
  const checklist = ref(initial.checklist)
  const theme = ref(initial.theme)

  const favoriteSet = computed(() => new Set(favorites.value))
  const completedSet = computed(() => new Set(completed.value))

  function toggleIn(list: string[], id: string): string[] {
    return list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id]
  }

  function toggleFavorite(id: string): void {
    favorites.value = toggleIn(favorites.value, id)
  }

  function toggleCompleted(id: string): void {
    completed.value = toggleIn(completed.value, id)
  }

  function setNote(id: string, value: string): void {
    notes.value = { ...notes.value, [id]: value }
  }

  function toggleChecklist(id: string): void {
    checklist.value = {
      ...checklist.value,
      [id]: !checklist.value[id],
    }
  }

  watch(
    [favorites, completed, notes, checklist, theme],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          favorites: favorites.value,
          completed: completed.value,
          notes: notes.value,
          checklist: checklist.value,
          theme: theme.value,
        }),
      )
    },
    { deep: true },
  )

  return {
    favorites,
    completed,
    notes,
    checklist,
    theme,
    favoriteSet,
    completedSet,
    toggleFavorite,
    toggleCompleted,
    setNote,
    toggleChecklist,
  }
})
