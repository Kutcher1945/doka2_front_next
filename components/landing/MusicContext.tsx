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

  function setupAnalyser() {
    const audio = audioRef.current
    if (!audio || sourceCreated.current) return
    sourceCreated.current = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actx = new (window.AudioContext || (window as any).webkitAudioContext)()
    webAudioCtxRef.current = actx
    const source = actx.createMediaElementSource(audio)

    const hpf = actx.createBiquadFilter()
    hpf.type = 'highpass'
    hpf.frequency.value = 80
    hpf.Q.value = 0.7

    const compressor = actx.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.knee.value = 8
    compressor.ratio.value = 3
    compressor.attack.value = 0.003
    compressor.release.value = 0.2

    const gain = actx.createGain()
    gain.gain.value = 1.6

    const analyser = actx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    source.connect(hpf)
    hpf.connect(compressor)
    compressor.connect(gain)
    gain.connect(analyser)
    analyser.connect(actx.destination)
    analyserRef.current = analyser
  }

  useEffect(() => {
    const audio = new Audio('/dnb_music_main_page.mp3')
    audio.loop = true
    audio.volume = 1.0
    audioRef.current = audio

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
      setupAnalyser()
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  return (
    <MusicCtx.Provider value={{ isPlaying, analyserRef, toggle }}>
      {children}
    </MusicCtx.Provider>
  )
}
