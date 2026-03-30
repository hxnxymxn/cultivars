import './styles/main.css'

// ── Constants ────────────────────────────────────────────

const COL = 64
const SIZE = COL * 2
const HALF = COL
const DIAMOND_ROWS = 25
const DIAMOND_BODY = DIAMOND_ROWS * HALF
const EXTEND = HALF

// ── Section 01: Log spiral + Sunflower ───────────────────

const spiralCanvas = document.getElementById('spiral')
const spiralCtx = spiralCanvas.getContext('2d')

const S_DARK = '#111111'
const S_LIGHT = '#1E1E1E'
const S_ARMS = 12
const S_GROWTH = 0.18 // controls how tightly wound the spiral is

function renderSpiral() {
  // make canvas large enough to cover section even when rotated (diagonal)
  const W = window.innerWidth
  const H = Math.ceil(window.innerHeight * 1.3)
  const diag = Math.ceil(Math.sqrt(W * W + H * H))
  spiralCanvas.width = diag
  spiralCanvas.height = diag

  const cx = diag / 2
  const cy = diag / 2
  const maxR = diag / 2

  // fill background
  spiralCtx.fillStyle = S_DARK
  spiralCtx.fillRect(0, 0, diag, diag)

  // draw log spiral arms
  // for each pixel angle, determine which arm it falls in
  const steps = 3600
  const dr = maxR / steps

  for (let arm = 0; arm < S_ARMS; arm++) {
    const armOffset = (arm / S_ARMS) * Math.PI * 2
    const fill = arm % 2 === 0 ? S_LIGHT : S_DARK

    spiralCtx.fillStyle = fill
    spiralCtx.beginPath()

    // trace outward edge of this arm
    for (let i = 0; i <= steps; i++) {
      const r = i * dr
      const theta = Math.log(Math.max(r, 1)) / S_GROWTH + armOffset
      const x = cx + r * Math.cos(theta)
      const y = cy + r * Math.sin(theta)
      if (i === 0) spiralCtx.moveTo(cx, cy)
      else spiralCtx.lineTo(x, y)
    }

    // trace inward edge (next arm boundary)
    const nextOffset = armOffset + (Math.PI * 2) / S_ARMS
    for (let i = steps; i >= 0; i--) {
      const r = i * dr
      const theta = Math.log(Math.max(r, 1)) / S_GROWTH + nextOffset
      const x = cx + r * Math.cos(theta)
      const y = cy + r * Math.sin(theta)
      spiralCtx.lineTo(x, y)
    }

    spiralCtx.closePath()
    spiralCtx.fill()
  }
}

// ── Section 02: Diamonds ─────────────────────────────────

const dCanvas = document.getElementById('diamonds')
const dCtx = dCanvas.getContext('2d')
const RING_TONES = ['#232323', '#141414', '#1E1E1E', '#191919']

// 70% diamond sizing
const D_COL = Math.round(COL * 0.7)
const D_SIZE = D_COL * 2
const D_HALF = D_COL
const D_ROWS = Math.ceil(DIAMOND_ROWS / 0.7)
const D_BODY = D_ROWS * D_HALF
const D_EXTEND = D_HALF

function ringColor(ring) {
  return RING_TONES[ring % 4]
}

function drawDiamond(ctx, cx, cy, half, fill) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - half)
  ctx.lineTo(cx + half, cy)
  ctx.lineTo(cx, cy + half)
  ctx.lineTo(cx - half, cy)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = 'rgba(217, 217, 217, 0.10)'
  ctx.lineWidth = 0.5
  ctx.stroke()
}

function renderDiamonds() {
  const W = window.innerWidth
  const H = D_EXTEND + D_BODY + D_EXTEND
  dCanvas.width = W
  dCanvas.height = H

  const gridOffsetX = W / 2 - Math.round(W / 2 / D_COL) * D_COL
  const vcx = W / 2
  const vcy = D_EXTEND + Math.floor(D_ROWS / 2) * D_HALF + D_HALF

  for (let r = 0; r < D_ROWS; r++) {
    const isOdd = r % 2
    for (let c = -2; c < Math.ceil(W / D_SIZE) + 3; c++) {
      const cx = c * D_SIZE + (isOdd ? D_HALF : 0) + gridOffsetX
      const cy = D_EXTEND + r * D_HALF + D_HALF
      const dist = Math.abs(cx - vcx) / D_HALF + Math.abs(cy - vcy) / D_HALF
      const ring = Math.floor(dist / 2)
      drawDiamond(dCtx, cx, cy, D_HALF, ringColor(ring))
    }
  }
}

// ── Section 03: Flower of Life ───────────────────────────

const fCanvas = document.getElementById('flowers')
const fCtx = fCanvas.getContext('2d')
const F_S = SIZE
const F_R = F_S / 2
const F_DARK = '#262626'
const F_LIGHT = '#1F1F1F'

function drawCirclePattern(ctx, W, H, gridOffsetX, yOffset) {
  const colCount = Math.ceil(W / F_S) + 4
  const rowCount = Math.ceil(H / F_S) + 2
  const PI = Math.PI

  for (let r = -1; r < rowCount + 1; r++) {
    for (let c = -2; c < colCount + 2; c++) {
      const cx = c * F_S + gridOffsetX + HALF
      const cy = r * F_S + yOffset
      const tx = cx - F_R
      const ty = cy - F_R

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, F_R, 0, PI * 2)
      ctx.clip()

      ctx.fillStyle = F_DARK

      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.arc(tx, ty, F_R, 0, PI / 2, false)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(tx + F_S, ty)
      ctx.arc(tx + F_S, ty, F_R, PI / 2, PI, false)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(tx + F_S, ty + F_S)
      ctx.arc(tx + F_S, ty + F_S, F_R, PI, PI * 3 / 2, false)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(tx, ty + F_S)
      ctx.arc(tx, ty + F_S, F_R, PI * 3 / 2, PI * 2, false)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }
  }
}

function renderFlowers() {
  const W = window.innerWidth
  const H = W <= 800 ? 2000 : 1000
  const gridOffsetX = W / 2 - Math.round(W / 2 / COL) * COL

  fCanvas.width = W
  fCanvas.height = H
  fCtx.fillStyle = F_LIGHT
  fCtx.fillRect(0, 0, W, H)
  drawCirclePattern(fCtx, W, H, gridOffsetX, 0)
}

// ── Init ─────────────────────────────────────────────────

function renderAll() {
  renderSpiral()
  renderDiamonds()
  renderFlowers()
}

renderAll()

// ── Section 02: Ornament diamond tiles ──────────────────

const ornament02 = document.getElementById('ornament-02')
const hitbox02 = document.getElementById('ornament-02-hitbox')
const borderCanvas = document.getElementById('diamond-borders')
const borderCtx = borderCanvas.getContext('2d')


function renderOrnament02() {
  ornament02.innerHTML = ''
  hitbox02.innerHTML = ''

  const W = window.innerWidth

  // mirror the diamond grid from renderDiamonds (70% sizing)
  const gridOffsetX = W / 2 - Math.round(W / 2 / D_COL) * D_COL

  // group visual tiles by concentric ring, also store centers for border drawing
  const ringMap = new Map()
  const ringCenters = new Map()
  const vcx = W / 2
  const vcy = D_EXTEND + Math.floor(D_ROWS / 2) * D_HALF + D_HALF - 64

  // position birds at ring center
  const center02 = document.querySelector('.center-02')
  if (center02) {
    center02.style.top = `${vcy}px`
  }

  for (let r = 0; r < D_ROWS; r++) {
    const isOdd = r % 2
    for (let c = -2; c < Math.ceil(W / D_SIZE) + 3; c++) {
      const dcx = c * D_SIZE + (isOdd ? D_HALF : 0) + gridOffsetX
      const dcy = D_EXTEND + r * D_HALF + D_HALF - 64

      // visual tile (renders the tint)
      const tile = document.createElement('div')
      tile.className = 'ornament-02__tile'
      tile.style.width = `${D_SIZE}px`
      tile.style.height = `${D_SIZE}px`
      tile.style.left = `${dcx - D_HALF}px`
      tile.style.top = `${dcy - D_HALF}px`

      // invisible hitbox clone (captures pointer events)
      const hit = document.createElement('div')
      hit.className = 'ornament-02-hitbox__tile'
      hit.style.width = `${D_SIZE}px`
      hit.style.height = `${D_SIZE}px`
      hit.style.left = `${dcx - D_HALF}px`
      hit.style.top = `${dcy - D_HALF}px`

      // compute ring index (same as canvas diamonds)
      const dist = Math.abs(dcx - vcx) / D_HALF + Math.abs(dcy - vcy) / D_HALF
      const ring = Math.floor(dist / 2)

      if (!ringMap.has(ring)) { ringMap.set(ring, []); ringCenters.set(ring, []) }
      // store gradient angle from center for diffuse neighbor effect
      const gradAngle = Math.atan2(dcx - vcx, -(dcy - vcy)) * (180 / Math.PI)
      tile._gradAngle = gradAngle
      tile._isCorner = Math.min(Math.abs(dcx - vcx), Math.abs(dcy - vcy)) < D_HALF
      ringMap.get(ring).push(tile)
      ringCenters.get(ring).push({ x: dcx, y: dcy })
      hit.dataset.ring = String(ring)

      ornament02.appendChild(tile)
      hitbox02.appendChild(hit)
    }
  }

  // set up border canvas (same size/position as diamond canvas)
  borderCanvas.width = dCanvas.width
  borderCanvas.height = dCanvas.height
  const hoveredRings = new Set()

  // build position → ring index lookup for neighbor checks
  const posToRing = new Map()
  for (const [ringIdx, centers] of ringCenters) {
    for (const { x, y } of centers) {
      posToRing.set(`${x},${y}`, ringIdx)
    }
  }

  function drawBorders() {
    borderCtx.clearRect(0, 0, borderCanvas.width, borderCanvas.height)
    if (hoveredRings.size === 0) return

    borderCtx.strokeStyle = 'rgba(131, 203, 252, 0.12)'

    // build set of active centers for shared-edge detection
    const activeSet = new Set()
    for (const ringIdx of hoveredRings) {
      const centers = ringCenters.get(ringIdx)
      if (!centers) continue
      for (const { x, y } of centers) activeSet.add(`${x},${y}`)
    }

    for (const ringIdx of hoveredRings) {
      const centers = ringCenters.get(ringIdx)
      if (!centers) continue
      for (const { x, y } of centers) {
        const cx = x + 0.5
        const cy = y + 64 + 0.5
        const edges = [
          { from: [cx, cy - D_HALF], to: [cx + D_HALF, cy], neighbor: `${x + D_HALF},${y - D_HALF}` },
          { from: [cx + D_HALF, cy], to: [cx, cy + D_HALF], neighbor: `${x + D_HALF},${y + D_HALF}` },
          { from: [cx, cy + D_HALF], to: [cx - D_HALF, cy], neighbor: `${x - D_HALF},${y + D_HALF}` },
          { from: [cx - D_HALF, cy], to: [cx, cy - D_HALF], neighbor: `${x - D_HALF},${y - D_HALF}` },
        ]
        for (const edge of edges) {
          borderCtx.lineWidth = activeSet.has(edge.neighbor) ? 0.5 : 1
          borderCtx.beginPath()
          borderCtx.moveTo(edge.from[0], edge.from[1])
          borderCtx.lineTo(edge.to[0], edge.to[1])
          borderCtx.stroke()
        }
      }
    }
  }

  const maxRing = Math.max(...Array.from(ringMap.keys()))
  const isMobile = W <= 744

  if (pulseRaf) cancelAnimationFrame(pulseRaf)
  pulseRaf = null

  if (isMobile) {
    // mobile: smooth auto-pulse
    ornament02.classList.add('ornament-02--pulse')
    const PULSE_SPEED = 6
    const PULSE_WIDTH = 3

    const rings = []
    for (let i = 0; i <= maxRing; i++) {
      rings.push(ringMap.get(i) || [])
    }

    const PAUSE = 2 // seconds pause between cycles
    const cycleRings = maxRing + PULSE_WIDTH * 2
    const cycleTime = cycleRings / PULSE_SPEED
    const totalCycle = cycleTime + PAUSE

    let pulseStart = null
    function animatePulse(ts) {
      if (!pulseStart) pulseStart = ts
      const elapsed = (ts - pulseStart) / 1000
      const inCycle = elapsed % totalCycle

      for (let i = 0; i <= maxRing; i++) {
        let opacity = 0
        if (inCycle < cycleTime) {
          const pos = inCycle * PULSE_SPEED
          const dist = Math.abs(i - pos)
          opacity = Math.max(0, 0.5 * Math.exp(-(dist * dist) / (2 * PULSE_WIDTH)))
        }
        const tiles = rings[i]
        for (let j = 0; j < tiles.length; j++) {
          tiles[j].style.setProperty('--pulse', opacity)
        }
      }
      pulseRaf = requestAnimationFrame(animatePulse)
    }
    pulseRaf = requestAnimationFrame(animatePulse)
  } else {
    // desktop: hover only
    ornament02.classList.remove('ornament-02--pulse')
    const hitTiles = hitbox02.querySelectorAll('.ornament-02-hitbox__tile')
    for (const hit of hitTiles) {
      hit.addEventListener('mouseenter', () => {
        const idx = parseInt(hit.dataset.ring)
        const ring = ringMap.get(idx)
        for (const t of ring) t.classList.add('ornament-02__tile--tinted')
        // diffuse neighbors with gradient (corners get reduced range)
        const inner = ringMap.get(idx - 1)
        const outer = ringMap.get(idx + 1)
        if (inner) for (const t of inner) {
          t.style.setProperty('--grad', `${t._gradAngle + 180}deg`)
          t.classList.add(t._isCorner ? 'ornament-02__tile--tinted-diffuse-corner' : 'ornament-02__tile--tinted-diffuse')
        }
        if (outer) for (const t of outer) {
          t.style.setProperty('--grad', `${t._gradAngle}deg`)
          t.classList.add(t._isCorner ? 'ornament-02__tile--tinted-diffuse-corner' : 'ornament-02__tile--tinted-diffuse')
        }
        hoveredRings.add(idx)
        drawBorders()
      })
      hit.addEventListener('mouseleave', () => {
        const idx = parseInt(hit.dataset.ring)
        const ring = ringMap.get(idx)
        for (const t of ring) t.classList.remove('ornament-02__tile--tinted')
        const inner = ringMap.get(idx - 1)
        const outer = ringMap.get(idx + 1)
        if (inner) for (const t of inner) t.classList.remove('ornament-02__tile--tinted-diffuse', 'ornament-02__tile--tinted-diffuse-corner')
        if (outer) for (const t of outer) t.classList.remove('ornament-02__tile--tinted-diffuse', 'ornament-02__tile--tinted-diffuse-corner')
        hoveredRings.delete(idx)
        drawBorders()
      })
    }
  }
}

let pulseRaf = null
renderOrnament02()

// ── Section 03: Fruit circles ───────────────────────────

const ornament03 = document.getElementById('ornament-03')
const FRUIT_COUNT = 29
const FRUIT_PATHS = Array.from({ length: FRUIT_COUNT }, (_, i) =>
  `/images/fruit${String(i + 1).padStart(2, '0')}.png`
)
const fruitAssignments = new Map()

function renderFruitCircles() {
  ornament03.innerHTML = ''

  const W = window.innerWidth
  const H = W <= 800 ? 2000 : 1000
  const gridOffsetX = W / 2 - Math.round(W / 2 / COL) * COL

  const PAD = W <= 800 ? 30 : 20
  const colCount = Math.ceil(W / F_S) + 4
  const rowCount = Math.ceil(H / F_S) + 2
  for (let r = -1; r < rowCount + 1; r++) {
    for (let c = -2; c < colCount + 2; c++) {
      const cx = c * F_S + gridOffsetX + HALF
      const cy = r * F_S
      const el = document.createElement('div')
      el.className = 'ornament-03__circle'
      el.style.left = `${cx - 64}px`
      el.style.top = `${cy - 64}px`

      // invisible hit area extending beyond the circle
      const hitArea = document.createElement('div')
      hitArea.style.cssText = `position:absolute;inset:${-PAD}px;border-radius:10000px;pointer-events:auto;`
      el.appendChild(hitArea)

      const key = `${r},${c}`
      if (!fruitAssignments.has(key)) {
        fruitAssignments.set(key, FRUIT_PATHS[Math.floor(Math.random() * FRUIT_COUNT)])
      }
      const fruitSrc = fruitAssignments.get(key)
      const img = document.createElement('img')
      img.src = fruitSrc
      img.alt = ''
      img.loading = 'lazy'
      el.appendChild(img)

      const blend = document.createElement('div')
      blend.className = 'ornament-03__blend'
      blend.style.maskImage = `url('${fruitSrc}')`
      blend.style.webkitMaskImage = `url('${fruitSrc}')`
      blend.style.maskSize = 'cover'
      blend.style.webkitMaskSize = 'cover'
      el.appendChild(blend)

      let timer = null
      let blendTimer = null
      function revealCircle() {
        clearTimeout(timer)
        clearTimeout(blendTimer)
        el.classList.remove('ornament-03__circle--flicker', 'ornament-03__circle--blending')
        el.classList.add('ornament-03__circle--reveal')
        blendTimer = setTimeout(() => {
          el.classList.add('ornament-03__circle--blending')
        }, 50)
        timer = setTimeout(() => {
          el.classList.add('ornament-03__circle--flicker')
          el.addEventListener('animationend', () => {
            el.classList.remove('ornament-03__circle--reveal', 'ornament-03__circle--flicker', 'ornament-03__circle--blending')
          }, { once: true })
        }, 4000)
      }
      el.addEventListener('mouseenter', revealCircle)
      let fruitTouchMoved = false
      el.addEventListener('touchstart', () => { fruitTouchMoved = false }, { passive: true })
      el.addEventListener('touchmove', () => { fruitTouchMoved = true }, { passive: true })
      el.addEventListener('touchend', () => {
        if (!fruitTouchMoved) revealCircle()
      })

      ornament03.appendChild(el)
    }
  }
}

renderFruitCircles()

function renderAllWithOrnaments() {
  renderSpiral()
  renderDiamonds()
  renderFlowers()
  renderOrnament02()
  renderFruitCircles()
}

let resizeTimer = null
const resizeOverlay = document.getElementById('resize-overlay')

window.addEventListener('resize', () => {
  resizeOverlay.classList.add('resize-overlay--active')
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    renderAllWithOrnaments()
    resizeOverlay.classList.remove('resize-overlay--active')
  }, 200)
})
window.addEventListener('pageshow', (e) => {
  if (e.persisted) renderAllWithOrnaments()
})

// ── Scroll perf: disable hitbox pointer-events while scrolling ──

let scrollTimer = null
window.addEventListener('scroll', () => {
  if (!hitbox02.style.pointerEvents) hitbox02.style.pointerEvents = 'none'
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    hitbox02.style.pointerEvents = ''
  }, 150)
}, { passive: true })


