'use client'

import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react'

interface MusicCtxValue {
  isPlaying: boolean
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  toggle: () => void
}

const MusicCtx = createContext<MusicCtxValue | null>(null)

export function useMusicContext() {
  return useContext(MusicCtx)
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const webAudioCtxRef = useRef<AudioContext | null>(null)
  const sourceCreated = useRef(false)

  useEffect(() => {
    const audio = new Audio('/dnb_music_main_page.mp3')
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    function setupAnalyser() {
      if (sourceCreated.current) return
      sourceCreated.current = true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actx = new (window.AudioContext || (window as any).webkitAudioContext)()
      webAudioCtxRef.current = actx
      const source = actx.createMediaElementSource(audio)
      const analyser = actx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyser.connect(actx.destination)
      analyserRef.current = analyser
    }

    audio.play().then(() => {
      setupAnalyser()
      setIsPlaying(true)
    }).catch(() => {
      const startOnInteraction = () => {
        audio.play().then(() => {
          setupAnalyser()
          setIsPlaying(true)
        }).catch(() => {})
        document.removeEventListener('click', startOnInteraction)
        document.removeEventListener('keydown', startOnInteraction)
      }
      document.addEventListener('click', startOnInteraction)
      document.addEventListener('keydown', startOnInteraction)
    })

    return () => {
      audio.pause()
      audio.src = ''
      webAudioCtxRef.current?.close()
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  return (
    <MusicCtx.Provider value={{ isPlaying, analyserRef, toggle }}>
      {children}
    </MusicCtx.Provider>
  )
}
