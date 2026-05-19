import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCreditsStore } from '@/lib/stores'
import toast from 'react-hot-toast'

// ── VIDEOS ─────────────────────────────────────────
export function useVideos(params?: { status?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['videos', params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params?.status) sp.set('status', params.status)
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize))
      const res = await fetch(`/api/videos/generate?${sp}`)
      return res.json()
    },
  })
}

export function useVideoStatus(videoId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['video-status', videoId],
    queryFn: () => fetch(`/api/videos/status/${videoId}`).then(r => r.json()),
    enabled: !!videoId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status
      return status === 'RENDERING' || status === 'QUEUED' ? 2000 : false
    },
  })
}

export function useGenerateVideo() {
  const queryClient = useQueryClient()
  const { deduct } = useCreditsStore()

  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      return data.data
    },
    onSuccess: (data) => {
      toast.success('Video queued for rendering!')
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Generation failed')
    },
  })
}

// ── SCRIPTS ─────────────────────────────────────────
export function useScripts(page = 1) {
  return useQuery({
    queryKey: ['scripts', page],
    queryFn: () => fetch(`/api/scripts/generate?page=${page}`).then(r => r.json()),
  })
}

export function useGenerateScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Script generation failed')
      return data.data
    },
    onSuccess: () => {
      toast.success('Script generated!')
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
      queryClient.invalidateQueries({ queryKey: ['credits'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ── CREDITS ─────────────────────────────────────────
export function useCredits() {
  const { setBalance, setBonusBalance, setPlan } = useCreditsStore()

  return useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const res = await fetch('/api/credits/balance')
      const data = await res.json()
      if (data.success) {
        setBalance(data.data.credits)
        setBonusBalance(data.data.bonusCredits)
        setPlan(data.data.plan)
      }
      return data.data
    },
    refetchInterval: 30000,
  })
}

// ── TRENDS ─────────────────────────────────────────
export function useTrends(niche = 'AI & Technology', platform = 'TIKTOK') {
  return useQuery({
    queryKey: ['trends', niche, platform],
    queryFn: () => fetch(`/api/trends?niche=${encodeURIComponent(niche)}&platform=${platform}`).then(r => r.json()),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ── ANALYTICS ───────────────────────────────────────
export function useAnalytics(range = '30d') {
  return useQuery({
    queryKey: ['analytics', range],
    queryFn: () => fetch(`/api/analytics?range=${range}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}
