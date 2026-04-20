'use client'

import { useEffect, useRef } from 'react'
import { useMusicContext } from './MusicContext'

interface ParticlesCanvasProps {
  count?: number
  style?: React.CSSProperties
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  alphaDir: number
  color: string
  nickname: string
}

const NICKNAMES = [
  'Miracle-', 'N0tail', 'Puppey', 'KuroKy', 'w33haa',
  'Sumail', 'Ana', 'Topson', 'JerAx', 'Ceb',
  'Dendi', 'Fear', 'iceiceice', 'Arteezy', 'EternalEnvy',
  'Cr1t-', 's4', 'Fly', 'zai', 'MinD_ContRoL',
  'Ramzes666', 'Solo', 'Resolut1on', 'Daxak', 'Nightfall',
  'SumaiL', 'MidOne', 'BoBoKa', 'Gh', '33',
]

const COLORS = [
  'rgba(141,94,244,',
  'rgba(185,153,253,',
  'rgba(96,64,212,',
  'rgba(56,189,248,',
]

export function ParticlesCanvas({ count = 60, style }: ParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const music = useMusicContext()
  const analyserRef = music?.analyserRef

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    let freqData: Uint8Array | null = null
    let started = false
    const parent = canvas.parentElement as HTMLElement | null

    function spawn(w: number, h: number): Particle {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.3 + 0.1),
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.5 + 0.1,
        alphaDir: (Math.random() - 0.5) * 0.004,
        color,
        nickname: NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)],
      }
    }

    function draw() {
      if (!canvas || !ctx) return

      const W = canvas.width
      const H = canvas.height

      // Sample audio
      let bassEnergy = 0
      let midEnergy = 0
      let overallEnergy = 0
      const analyser = analyserRef?.current
      if (analyser) {
        if (!freqData || freqData.length !== analyser.frequencyBinCount) {
          freqData = new Uint8Array(analyser.frequencyBinCount)
        }
        analyser.getByteFrequencyData(freqData as Uint8Array<ArrayBuffer>)
        bassEnergy = (freqData[0] + freqData[1] + freqData[2] + freqData[3] + freqData[4] + freqData[5]) / (6 * 255)
        let midSum = 0
        for (let i = 6; i <= 30; i++) midSum += freqData[i]
        midEnergy = midSum / (25 * 255)
        let sum = 0
        for (let i = 0; i < freqData.length; i++) sum += freqData[i]
        overallEnergy = sum / (freqData.length * 255)
      }

      const speedMult = 1 + overallEnergy * 2.5
      const sizeMult = 1 + bassEnergy * 3.5
      const glowMult = 1 + bassEnergy * 2.5
      const alphaMult = 1 + midEnergy * 1.5

      ctx.clearRect(0, 0, W, H)

      // Beat flash on strong bass
      if (bassEnergy > 0.3) {
        const intensity = (bassEnergy - 0.3) / 0.7
        const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6)
        grd.addColorStop(0, `rgba(141,94,244,${(intensity * 0.12).toFixed(3)})`)
        grd.addColorStop(1, 'rgba(141,94,244,0)')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, W, H)
      }

      for (const p of particles) {
        p.x += p.vx * speedMult
        p.y += p.vy * speedMult
        p.alpha += p.alphaDir
        if (p.alpha <= 0.05) p.alphaDir = Math.abs(p.alphaDir)
        if (p.alpha >= 0.65) p.alphaDir = -Math.abs(p.alphaDir)

        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W }
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10

        const drawRadius = p.radius * sizeMult
        const drawAlpha = Math.min(0.9, p.alpha * alphaMult)

        ctx.beginPath()
        ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${drawAlpha.toFixed(2)})`
        ctx.fill()

        const glowRadius = drawRadius * 4 * glowMult
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius)
        grd.addColorStop(0, `${p.color}${(drawAlpha * 0.4).toFixed(2)})`)
        grd.addColorStop(1, `${p.color}0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Nickname label
        const textAlpha = Math.min(0.55, drawAlpha * 0.75)
        ctx.font = '600 10px "Gotham Pro", sans-serif'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = `${p.color}${textAlpha.toFixed(2)})`
        ctx.shadowColor = `${p.color}0.6)`
        ctx.shadowBlur = 6
        ctx.fillText(p.nickname, p.x + drawRadius + 5, p.y)
        ctx.shadowBlur = 0
      }

      animId = requestAnimationFrame(draw)
    }

    function applySize(w: number, h: number) {
      if (!canvas || w === 0 || h === 0) return
      canvas.width = w
      canvas.height = h
      if (!started) {
        started = true
        particles = Array.from({ length: count }, () => spawn(w, h))
        draw()
      } else {
        for (const p of particles) {
          if (p.x > w) p.x = Math.random() * w
          if (p.y > h) p.y = Math.random() * h
        }
      }
    }

    // canvas is position:absolute inset:0, so getBoundingClientRect() always
    // returns the parent section's rendered dimensions (includes padding).
    function syncSize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      applySize(rect.width, rect.height)
    }

    // Wait for layout to be ready before reading dimensions
    requestAnimationFrame(syncSize)

    // Keep in sync on resize
    const ro = new ResizeObserver(syncSize)
    ro.observe(parent ?? canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  // analyserRef is a stable ref object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, analyserRef])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  )
}
