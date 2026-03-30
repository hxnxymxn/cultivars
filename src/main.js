import './styles/main.css'

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
const section01 = document.querySelector('.section-01')
const sunflower = document.getElementById('sunflower')

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

// sunflower hover: pause spiral, spin sunflower
sunflower.addEventListener('mouseenter', () => {
  section01.classList.add('spiral-paused')
  sunflower.classList.add('spinning')
})
sunflower.addEventListener('mouseleave', () => {
  section01.classList.remove('spiral-paused')
  sunflower.classList.remove('spinning')
})
// sunflower tap: toggle same interaction on touch
let sfTouchMoved = false
sunflower.addEventListener('touchstart', () => { sfTouchMoved = false }, { passive: true })
sunflower.addEventListener('touchmove', () => { sfTouchMoved = true }, { passive: true })
sunflower.addEventListener('touchend', () => {
  if (sfTouchMoved) return
  section01.classList.toggle('spiral-paused')
  sunflower.classList.toggle('spinning')
})

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
  ctx.strokeStyle = '#1B1B1B'
  ctx.lineWidth = 1
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
const F_DARK = '#181818'
const F_LIGHT = '#222222'

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

// ── Interstice image ────────────────────────────────────

const intersticeEl = document.getElementById('interstice')

function positionInterstice() {
  const h = 595
  intersticeEl.style.marginTop = `${-h * 0.5}px`
  intersticeEl.style.marginBottom = `${-h * 0.5}px`
}

positionInterstice()
window.addEventListener('resize', positionInterstice)

// interstice parallax: rise 10% then plunge faster than scroll
function updateIntersticeParallax() {
  const rect = intersticeEl.getBoundingClientRect()
  const vh = window.innerHeight
  // progress: 0 when entering viewport bottom, 1 when leaving top
  const progress = 1 - (rect.top + rect.height) / (vh + rect.height)
  if (progress < 0 || progress > 1) return
  // rise up 10% of height, then rapidly drop at 2.5x rate
  const riseEnd = 0.1
  let yShift
  if (progress <= riseEnd) {
    // rising phase: move up as we scroll into view
    yShift = -(progress / riseEnd) * rect.height * 0.1
  } else {
    // plunge phase: drop fast
    const plungeProgress = (progress - riseEnd) / (1 - riseEnd)
    yShift = -rect.height * 0.1 + plungeProgress * rect.height * 0.6
  }
  intersticeEl.style.transform = `translateY(${yShift}px)`
}

window.addEventListener('scroll', updateIntersticeParallax, { passive: true })
updateIntersticeParallax()

// ── Section 02: Ornament diamond tiles ──────────────────

const ornament02 = document.getElementById('ornament-02')
const hitbox02 = document.getElementById('ornament-02-hitbox')
const section02 = document.querySelector('.section-02')

function renderOrnament02() {
  ornament02.innerHTML = ''
  hitbox02.innerHTML = ''

  const W = window.innerWidth
  const H = W <= 500 ? 800 : 1600
  section02.style.height = `${H}px`

  // mirror the diamond grid from renderDiamonds (70% sizing)
  const gridOffsetX = W / 2 - Math.round(W / 2 / D_COL) * D_COL

  // group visual tiles by concentric ring
  const ringMap = new Map()
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

      if (!ringMap.has(ring)) ringMap.set(ring, [])
      ringMap.get(ring).push(tile)
      hit._ring = ring

      ornament02.appendChild(tile)
      hitbox02.appendChild(hit)
    }
  }

  const maxRing = Math.max(...ringMap.keys())
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
        const ring = ringMap.get(hit._ring)
        for (const t of ring) {
          t._lingerTimer && clearTimeout(t._lingerTimer)
          t.classList.remove('ornament-02__tile--fading')
          t.classList.add('ornament-02__tile--tinted')
        }
      })
      hit.addEventListener('mouseleave', () => {
        const ring = ringMap.get(hit._ring)
        for (const t of ring) {
          t._lingerTimer = setTimeout(() => {
            t.classList.remove('ornament-02__tile--tinted')
            t.classList.add('ornament-02__tile--fading')
            setTimeout(() => t.classList.remove('ornament-02__tile--fading'), 500)
          }, 300)
        }
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

function renderFruitCircles() {
  ornament03.innerHTML = ''

  const W = window.innerWidth
  const H = W <= 800 ? 2000 : 1000
  const gridOffsetX = W / 2 - Math.round(W / 2 / COL) * COL

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

      const fruitSrc = FRUIT_PATHS[Math.floor(Math.random() * FRUIT_COUNT)]
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

window.addEventListener('resize', renderAllWithOrnaments)

// ── Scroll perf: disable hitbox pointer-events while scrolling ──

let scrollTimer = null
window.addEventListener('scroll', () => {
  if (!hitbox02.style.pointerEvents) hitbox02.style.pointerEvents = 'none'
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    hitbox02.style.pointerEvents = ''
  }, 150)
}, { passive: true })

// ── Section 01: Ornament parallax ───────────────────────

const PARALLAX_RATE = 0.35

function updateOrnamentParallax() {
  const scrollY = window.scrollY
  const yShift = scrollY * PARALLAX_RATE
  ornamentGrid.style.transform = `translateX(-50%) translateY(${yShift}px)`
}

updateOrnamentParallax()
window.addEventListener('scroll', updateOrnamentParallax, { passive: true })

import { 
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  ChessKnight,
  Code,
  CodeXml,
  Download,
  DraftingCompass,
  EllipsisVertical,
  Expand,
  ExternalLink,
  Eye,
  EyeClosed,
  Grip,
  GripHorizontal,
  GripVertical,
  HatGlasses,
  Leaf,
  LeafyGreen,
  Link,
  Mail,
  Moon,
  MousePointer,
  Palette,
  Pilcrow,
  Rose,
  Scroll,
  Sliders,
  SlidersHorizontal,
  SlidersVertical,
  Star,
  SwatchBook,
  Terminal,
  X 
} from 'lucide'

const icon = X({ size: 16, strokeWidth: 1.5 })
document.querySelector('#some-element').appendChild(icon)