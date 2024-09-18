'use client'

import { useEffect } from 'react'

export function GrainOverlay() {
  useEffect(() => {
    const noise = () => {
      let canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 200
      let ctx = canvas.getContext('2d')!
      
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          let value = Math.random() * 255
          ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.5)`
          ctx.fillRect(x, y, 1, 1)
        }
      }
      
      return canvas.toDataURL('image/png')
    }

    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '9999'
    overlay.style.mixBlendMode = 'overlay'
    overlay.style.backgroundImage = `url(${noise()})`
    overlay.style.opacity = '0.4'
    overlay.style.backgroundSize = 'repeat'
    
    document.body.appendChild(overlay)

    return () => {
      document.body.removeChild(overlay)
    }
  }, [])

  return null
}