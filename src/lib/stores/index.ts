// ORVIX — Global State (Zustand)
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { OrvixUser, Video, DashboardStats, OrvixNotification } from '@/types'

// ─── UI Store ─────────────────────────────────────────────────
interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  activePanel: string | null
  theme: 'dark' | 'light'
  notifications: OrvixNotification[]
  unreadCount: number

  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (v: boolean) => void
  setActivePanel: (panel: string | null) => void
  addNotification: (n: OrvixNotification) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        commandPaletteOpen: false,
        activePanel: null,
        theme: 'dark',
        notifications: [],
        unreadCount: 0,

        setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
        setActivePanel: (panel) => set({ activePanel: panel }),

        addNotification: (n) =>
          set((s) => ({
            notifications: [n, ...s.notifications].slice(0, 50),
            unreadCount: s.unreadCount + 1,
          })),

        markNotificationRead: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, s.unreadCount - 1),
          })),

        markAllRead: () =>
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          })),
      }),
      {
        name: 'orvix-ui',
        partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }),
      }
    )
  )
)

// ─── Studio Store ──────────────────────────────────────────────
interface GenerationJob {
  id: string
  prompt: string
  status: 'queued' | 'rendering' | 'done' | 'failed'
  progress: number
  viralScore?: number
  estimatedReach?: number
  videoId?: string
  startedAt: string
}

interface StudioState {
  currentPrompt: string
  isGenerating: boolean
  generationJobs: GenerationJob[]
  selectedVideoId: string | null
  activeTab: 'generate' | 'queue' | 'library'
  renderProgress: number

  setCurrentPrompt: (v: string) => void
  setIsGenerating: (v: boolean) => void
  addJob: (job: GenerationJob) => void
  updateJob: (id: string, updates: Partial<GenerationJob>) => void
  removeJob: (id: string) => void
  setSelectedVideoId: (id: string | null) => void
  setActiveTab: (tab: StudioState['activeTab']) => void
  setRenderProgress: (n: number) => void
}

export const useStudioStore = create<StudioState>()((set) => ({
  currentPrompt: '',
  isGenerating: false,
  generationJobs: [],
  selectedVideoId: null,
  activeTab: 'generate',
  renderProgress: 0,

  setCurrentPrompt: (v) => set({ currentPrompt: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),

  addJob: (job) =>
    set((s) => ({ generationJobs: [job, ...s.generationJobs] })),

  updateJob: (id, updates) =>
    set((s) => ({
      generationJobs: s.generationJobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),

  removeJob: (id) =>
    set((s) => ({
      generationJobs: s.generationJobs.filter((j) => j.id !== id),
    })),

  setSelectedVideoId: (id) => set({ selectedVideoId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setRenderProgress: (n) => set({ renderProgress: n }),
}))

// ─── Editor Store ──────────────────────────────────────────────
interface EditorScene {
  id: string
  type: string
  order: number
  duration: number
  content?: string
  mediaUrl?: string
  effects?: Record<string, unknown>
}

interface EditorState {
  videoId: string | null
  scenes: EditorScene[]
  selectedSceneId: string | null
  playhead: number
  isPlaying: boolean
  zoom: number
  volume: number
  isMuted: boolean
  unsavedChanges: boolean

  setVideoId: (id: string | null) => void
  setScenes: (scenes: EditorScene[]) => void
  selectScene: (id: string | null) => void
  updateScene: (id: string, updates: Partial<EditorScene>) => void
  reorderScenes: (from: number, to: number) => void
  setPlayhead: (t: number) => void
  setIsPlaying: (v: boolean) => void
  setZoom: (z: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  markUnsaved: () => void
  markSaved: () => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  videoId: null,
  scenes: [],
  selectedSceneId: null,
  playhead: 0,
  isPlaying: false,
  zoom: 1,
  volume: 1,
  isMuted: false,
  unsavedChanges: false,

  setVideoId: (id) => set({ videoId: id }),
  setScenes: (scenes) => set({ scenes }),
  selectScene: (id) => set({ selectedSceneId: id }),

  updateScene: (id, updates) =>
    set((s) => ({
      scenes: s.scenes.map((sc) => sc.id === id ? { ...sc, ...updates } : sc),
      unsavedChanges: true,
    })),

  reorderScenes: (from, to) =>
    set((s) => {
      const scenes = [...s.scenes]
      const [removed] = scenes.splice(from, 1)
      scenes.splice(to, 0, removed)
      return { scenes: scenes.map((sc, i) => ({ ...sc, order: i })), unsavedChanges: true }
    }),

  setPlayhead: (t) => set({ playhead: t }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setZoom: (z) => set({ zoom: Math.max(0.5, Math.min(4, z)) }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  markUnsaved: () => set({ unsavedChanges: true }),
  markSaved: () => set({ unsavedChanges: false }),
}))

// ─── Credits Store ─────────────────────────────────────────────
interface CreditsState {
  balance: number
  bonusBalance: number
  plan: string
  monthlyGrant: number
  loading: boolean

  setBalance: (n: number) => void
  setBonusBalance: (n: number) => void
  setPlan: (plan: string) => void
  deduct: (amount: number) => boolean
  add: (amount: number, type: 'bonus' | 'main') => void
  setLoading: (v: boolean) => void
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      balance: 0,
      bonusBalance: 0,
      plan: 'FREE',
      monthlyGrant: 50,
      loading: false,

      setBalance: (n) => set({ balance: n }),
      setBonusBalance: (n) => set({ bonusBalance: n }),
      setPlan: (plan) => set({ plan }),
      setLoading: (v) => set({ loading: v }),

      deduct: (amount) => {
        const { balance, bonusBalance } = get()
        const total = balance + bonusBalance
        if (total < amount) return false
        // Deduct from bonus first
        if (bonusBalance >= amount) {
          set({ bonusBalance: bonusBalance - amount })
        } else {
          const remaining = amount - bonusBalance
          set({ bonusBalance: 0, balance: balance - remaining })
        }
        return true
      },

      add: (amount, type) => {
        if (type === 'bonus') {
          set((s) => ({ bonusBalance: s.bonusBalance + amount }))
        } else {
          set((s) => ({ balance: s.balance + amount }))
        }
      },
    }),
    {
      name: 'orvix-credits',
      partialize: (s) => ({ balance: s.balance, bonusBalance: s.bonusBalance, plan: s.plan }),
    }
  )
)

// ─── Dashboard Store ────────────────────────────────────────────
interface DashboardState {
  stats: DashboardStats | null
  recentVideos: Video[]
  loading: boolean
  lastFetched: string | null

  setStats: (s: DashboardStats) => void
  setRecentVideos: (v: Video[]) => void
  setLoading: (v: boolean) => void
  setLastFetched: (t: string) => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: null,
  recentVideos: [],
  loading: false,
  lastFetched: null,

  setStats: (s) => set({ stats: s }),
  setRecentVideos: (v) => set({ recentVideos: v }),
  setLoading: (v) => set({ loading: v }),
  setLastFetched: (t) => set({ lastFetched: t }),
}))
