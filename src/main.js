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
sunflower.addEventListener('touchstart', (e) => {
  e.preventDefault()
  section01.classList.toggle('spiral-paused')
  sunflower.classList.toggle('spinning')
}, { passive: false })

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
  const H = 1000
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
const O2_IMG_W = 3077
const O2_IMG_H = 3789
const O2_SECTION_H = 1600

function renderOrnament02() {
  ornament02.innerHTML = ''

  const W = window.innerWidth
  const H = O2_SECTION_H

  // 70% container (reduced 10% from 80%), centered
  const cw = W * 0.7
  const ch = H * 0.7
  const cx0 = W * 0.15
  const cy0 = H * 0.15

  // contain: fit image within container
  const scaleW = cw / O2_IMG_W
  const scaleH = ch / O2_IMG_H
  const scale = Math.min(scaleW, scaleH)
  const imgW = O2_IMG_W * scale
  const imgH = O2_IMG_H * scale
  // image origin (centered in container)
  const imgX = cx0 + (cw - imgW) / 2
  const imgY = cy0 + (ch - imgH) / 2

  // mirror the diamond grid from renderDiamonds (70% sizing)
  const gridOffsetX = W / 2 - Math.round(W / 2 / D_COL) * D_COL

  // group tiles by concentric ring
  const ringMap = new Map()
  const vcx = W / 2
  const vcy = D_EXTEND + Math.floor(D_ROWS / 2) * D_HALF + D_HALF - 64

  for (let r = 0; r < D_ROWS; r++) {
    const isOdd = r % 2
    for (let c = -2; c < Math.ceil(W / D_SIZE) + 3; c++) {
      const dcx = c * D_SIZE + (isOdd ? D_HALF : 0) + gridOffsetX
      const dcy = D_EXTEND + r * D_HALF + D_HALF - 64

      const tile = document.createElement('div')
      tile.className = 'ornament-02__tile'
      tile.style.width = `${D_SIZE}px`
      tile.style.height = `${D_SIZE}px`
      tile.style.left = `${dcx - D_HALF}px`
      tile.style.top = `${dcy - D_HALF}px`

      const bgX = imgX - (dcx - D_HALF)
      const bgY = imgY - (dcy - D_HALF)
      tile.style.backgroundSize = `${imgW}px ${imgH}px`
      tile.style.backgroundPosition = `${bgX}px ${bgY}px`

      // compute ring index (same as canvas diamonds)
      const dist = Math.abs(dcx - vcx) / D_HALF + Math.abs(dcy - vcy) / D_HALF
      const ring = Math.floor(dist / 2)

      if (!ringMap.has(ring)) ringMap.set(ring, [])
      ringMap.get(ring).push(tile)
      tile._ring = ring

      ornament02.appendChild(tile)
    }
  }

  // hover: tint entire concentric ring (inner 8 rings only)
  for (const [ringIdx, tiles] of ringMap) {
    if (ringIdx > 7) continue
    for (const tile of tiles) {
      tile.addEventListener('mouseenter', () => {
        const ring = ringMap.get(tile._ring)
        for (const t of ring) {
          t._lingerTimer && clearTimeout(t._lingerTimer)
          t.classList.remove('ornament-02__tile--fading')
          t.classList.add('ornament-02__tile--tinted')
        }
      })
      tile.addEventListener('mouseleave', () => {
        const ring = ringMap.get(tile._ring)
        for (const t of ring) {
          t._lingerTimer = setTimeout(() => {
            t.classList.remove('ornament-02__tile--tinted')
            t.classList.add('ornament-02__tile--fading')
            setTimeout(() => t.classList.remove('ornament-02__tile--fading'), 500)
          }, 300)
        }
      })
      // tap: tint ring then auto-fade
      tile.addEventListener('touchstart', (e) => {
        e.preventDefault()
        const ring = ringMap.get(tile._ring)
        for (const t of ring) {
          t._lingerTimer && clearTimeout(t._lingerTimer)
          t.classList.remove('ornament-02__tile--fading')
          t.classList.add('ornament-02__tile--tinted')
        }
        // auto-fade after a short hold
        setTimeout(() => {
          for (const t of ring) {
            t._lingerTimer = setTimeout(() => {
              t.classList.remove('ornament-02__tile--tinted')
              t.classList.add('ornament-02__tile--fading')
              setTimeout(() => t.classList.remove('ornament-02__tile--fading'), 500)
            }, 300)
          }
        }, 800)
      }, { passive: false })
    }
  }
}

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
  const H = 1000
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
      el.addEventListener('touchstart', (e) => {
        e.preventDefault()
        revealCircle()
      }, { passive: false })

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