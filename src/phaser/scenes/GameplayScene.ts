import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../../game/assets/manifest'
import { ANIMALS, ANIMAL_BY_ID, type AnimalId } from '../../game/content/animals'
import type { HandPoint } from '../../game/input/handTracker'
import { createIntroState, type GameState, type RewardEvent, type StageAnimal } from '../../game/simulation/state'

interface RenderedAnimal {
  animalId: AnimalId
  container: Phaser.GameObjects.Container
  glow: Phaser.GameObjects.Ellipse
  sprite: Phaser.GameObjects.Image
  shadow: Phaser.GameObjects.Ellipse
  baseX: number
  baseY: number
  floatSpeed: number
  floatPhase: number
  pulseSpeed: number
  pulsePhase: number
}

type AnimalTemplate = 'mammal' | 'bird' | 'fish' | 'snake' | 'octopus' | 'insect'
type PatternStyle = 'none' | 'spots' | 'stripes'

interface CartoonSpec {
  id: AnimalId
  template: AnimalTemplate
  primary: string
  secondary: string
  belly: string
  accent: string
  pattern: PatternStyle
}

const hexColor = (value: string) => Number.parseInt(value.replace('#', ''), 16)

const fitSprite = (sprite: Phaser.GameObjects.Image, maxWidth: number, maxHeight: number) => {
  const scale = Math.min(maxWidth / sprite.width, maxHeight / sprite.height)
  sprite.setScale(scale)
}

const hashText = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) & 0x7fffffff
  }
  return hash
}

const tone = (hue: number, sat: number, light: number) => `hsl(${hue} ${sat}% ${light}%)`

const TEMPLATE_OVERRIDES: Record<string, AnimalTemplate> = {
  owl: 'bird',
  chicken: 'bird',
  duck: 'bird',
  flamingo: 'bird',
  ostrich: 'bird',
  penguin: 'bird',
  fish: 'fish',
  dolphin: 'fish',
  whale: 'fish',
  shark: 'fish',
  crocodile: 'snake',
  snake: 'snake',
  chameleon: 'snake',
  octopus: 'octopus',
  bee: 'insect',
  ant: 'insect',
  spider: 'insect',
  butterfly: 'insect',
  crab: 'insect',
  frog: 'insect',
  bat: 'insect',
}

const PATTERN_OVERRIDES: Record<string, PatternStyle> = {
  zebra: 'stripes',
  tiger: 'stripes',
  bee: 'stripes',
  snake: 'spots',
  giraffe: 'spots',
  leopard: 'spots',
  cow: 'spots',
  panda: 'spots',
  chameleon: 'spots',
}

const getCartoonSpec = (animalId: AnimalId): CartoonSpec => {
  const hash = hashText(animalId)
  const hue = hash % 360
  const template = TEMPLATE_OVERRIDES[animalId] ?? 'mammal'
  const pattern = PATTERN_OVERRIDES[animalId] ?? 'none'

  const neutral =
    animalId === 'zebra' ||
    animalId === 'panda' ||
    animalId === 'penguin' ||
    animalId === 'cow' ||
    animalId === 'polar_bear'

  const primary = neutral ? tone(0, 0, animalId === 'polar_bear' ? 94 : 90) : tone(hue, 66, 58)
  const secondary = neutral ? tone(0, 0, 20) : tone((hue + 24) % 360, 48, 42)
  const belly = neutral ? tone(0, 0, 97) : tone((hue + 8) % 360, 44, 85)
  const accent = tone((hue + 180) % 360, 76, 58)

  return { id: animalId, template, pattern, primary, secondary, belly, accent }
}

const fillRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width * 0.5, height * 0.5)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}

const drawEye = (ctx: CanvasRenderingContext2D, x: number, y: number, size = 8) => {
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#203641'
  ctx.beginPath()
  ctx.arc(x, y + 1, size * 0.55, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x - size * 0.24, y - size * 0.22, size * 0.2, 0, Math.PI * 2)
  ctx.fill()
}

const HAND_CURSOR_TEXTURE_KEY = 'hand-cursor-live'
const articleFor = (word: string) => (/^[aeiou]/i.test(word.trim()) ? 'an' : 'a')
const EMOJI_BY_ANIMAL: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  elephant: '🐘',
  lion: '🦁',
  tiger: '🐅',
  giraffe: '🦒',
  monkey: '🐒',
  bear: '🐻',
  rabbit: '🐇',
  kangaroo: '🦘',
  dolphin: '🐬',
  penguin: '🐧',
  crocodile: '🐊',
  koala: '🐨',
  zebra: '🦓',
  gorilla: '🦍',
  hippopotamus: '🦛',
  camel: '🐫',
  polar_bear: '🐻‍❄️',
  owl: '🦉',
  snake: '🐍',
  butterfly: '🦋',
  horse: '🐎',
  cow: '🐄',
  sheep: '🐑',
  goat: '🐐',
  chicken: '🐓',
  duck: '🦆',
  fish: '🐟',
  whale: '🐋',
  shark: '🦈',
  octopus: '🐙',
  frog: '🐸',
  bee: '🐝',
  ant: '🐜',
  spider: '🕷️',
  crab: '🦀',
  panda: '🐼',
  deer: '🦌',
  wolf: '🐺',
  fox: '🦊',
  squirrel: '🐿️',
  flamingo: '🦩',
  ostrich: '🦤',
  bat: '🦇',
  hedgehog: '🦔',
  leopard: '🐆',
  chameleon: '🦎',
}

export class GameplayScene extends Phaser.Scene {
  private animalViews = new Map<string, RenderedAnimal>()
  private handPoint: HandPoint | null = null
  private handCursor?: Phaser.GameObjects.Container
  private sentencePanel?: Phaser.GameObjects.Rectangle
  private sentenceText?: Phaser.GameObjects.Text
  private sentenceTween?: Phaser.Tweens.Tween
  private sentenceAnimalId: AnimalId | null = null
  private pendingState: GameState | null = null
  private tapHandler: ((x: number, y: number) => void) | null = null
  private initialized = false
  private catalogMode = false

  constructor() {
    super('gameplay')
  }

  enableCatalogMode() {
    this.catalogMode = true
  }

  setTapHandler(handler: (x: number, y: number) => void) {
    this.tapHandler = handler
  }

  setHandPoint(point: HandPoint | null) {
    if (this.catalogMode) {
      return
    }

    this.handPoint = point
    if (this.handCursor) {
      this.handCursor.setVisible(point !== null)
    }
  }

  applyState(state: GameState) {
    if (this.catalogMode) {
      return
    }

    if (!this.initialized) {
      this.pendingState = state
      return
    }

    const focusAnimalId = state.animals[0]?.animalId ?? null
    const switchedToNextAnimal =
      this.sentenceAnimalId !== null && focusAnimalId !== null && this.sentenceAnimalId !== focusAnimalId

    if (state.phase === 'intro' || switchedToNextAnimal) {
      this.clearSentenceBanner()
    }

    this.syncAnimals(state.animals)

    if (state.phase === 'rewarding' && state.rewardEvent) {
      this.playRewardBurst(state.rewardEvent)
    }
  }

  create() {
    this.ensureAnimalTextures()

    if (this.catalogMode) {
      this.createCatalogPreview()
      this.initialized = true
      return
    }

    this.ensureCursorTexture()
    this.createForestBackground()
    this.createStageSentenceBanner()
    this.createHandCursor()
    this.initialized = true

    this.syncAnimals(createIntroState().animals)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.tapHandler?.(pointer.x, pointer.y)
    })

    if (this.pendingState) {
      this.applyState(this.pendingState)
      this.pendingState = null
    }
  }

  update(time: number) {
    if (this.catalogMode) {
      return
    }

    for (const animalView of this.animalViews.values()) {
      const t = time * 0.001
      const floatOffset = Math.sin(t * animalView.floatSpeed + animalView.floatPhase) * 20
      const pulseScale = 1 + Math.sin(t * animalView.pulseSpeed + animalView.pulsePhase) * 0.1
      const tilt = Math.sin(t * animalView.floatSpeed + animalView.floatPhase * 0.5) * 2.4

      animalView.container.x = animalView.baseX
      animalView.container.y = animalView.baseY + floatOffset
      animalView.container.setScale(pulseScale)
      animalView.container.setAngle(tilt)
    }

    if (this.handPoint && this.handCursor) {
      const targetX = this.handPoint.xNorm * GAME_WIDTH
      const targetY = this.handPoint.yNorm * GAME_HEIGHT
      this.handCursor.x = Phaser.Math.Linear(this.handCursor.x, targetX, 0.35)
      this.handCursor.y = Phaser.Math.Linear(this.handCursor.y, targetY, 0.35)
    }
  }

  private createCatalogPreview() {
    const width = this.scale.width
    const height = this.scale.height
    const cols = 6
    const rows = Math.ceil(ANIMALS.length / cols)
    const topPadding = 112
    const sidePadding = 24
    const bottomPadding = 24
    const contentWidth = width - sidePadding * 2
    const contentHeight = height - topPadding - bottomPadding
    const cellWidth = contentWidth / cols
    const cellHeight = contentHeight / rows

    this.add.rectangle(width / 2, height / 2, width, height, 0xf3fbff, 1)
    this.add.text(width / 2, 44, 'I like animals! - 48 Animals', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '44px',
      color: '#13585d',
      fontStyle: '700',
    }).setOrigin(0.5, 0.5)

    this.add.text(width / 2, 80, 'Cartoon Preview with English Labels', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#2d6570',
      fontStyle: '600',
    }).setOrigin(0.5, 0.5)

    ANIMALS.forEach((animal, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = sidePadding + col * cellWidth
      const y = topPadding + row * cellHeight
      const centerX = x + cellWidth / 2
      const centerY = y + cellHeight / 2

      const card = this.add.rectangle(
        centerX,
        centerY,
        cellWidth - 14,
        cellHeight - 14,
        0xffffff,
        0.94,
      )
      card.setStrokeStyle(2, 0xb9dae0, 0.95)

      const bubble = this.add.circle(centerX, centerY - cellHeight * 0.12, Math.min(cellWidth, cellHeight) * 0.28, 0xeef8fb, 0.9)
      bubble.setStrokeStyle(1, 0xcde9ef, 0.8)

      const sprite = this.add.image(centerX, centerY - cellHeight * 0.12, animal.textureKey)
      fitSprite(sprite, cellWidth * 0.72, cellHeight * 0.5)

      this.add.text(centerX, y + cellHeight - 24, animal.word.toUpperCase(), {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: `${Math.max(14, Math.round(cellWidth * 0.095))}px`,
        color: '#115a62',
        fontStyle: '700',
      }).setOrigin(0.5, 0.5)
    })
  }

  private ensureAnimalTextures() {
    for (const animal of ANIMALS) {
      if (this.textures.exists(animal.textureKey)) {
        continue
      }

      const texture = this.textures.createCanvas(animal.textureKey, 360, 320)
      if (!texture) {
        continue
      }

      const ctx = texture.context
      ctx.clearRect(0, 0, 360, 320)
      this.drawCartoonAnimal(ctx, getCartoonSpec(animal.id))
      texture.refresh()
    }
  }

  private ensureCursorTexture() {
    if (this.textures.exists(HAND_CURSOR_TEXTURE_KEY)) {
      return
    }

    const texture = this.textures.createCanvas(HAND_CURSOR_TEXTURE_KEY, 110, 110)
    if (!texture) {
      return
    }

    const ctx = texture.context
    ctx.clearRect(0, 0, 110, 110)

    const glow = ctx.createRadialGradient(55, 56, 12, 55, 56, 52)
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(55, 56, 52, 0, Math.PI * 2)
    ctx.fill()

    const outline = '#1f7fa5'
    const fingerLight = '#fff7ee'
    const fingerBase = '#fff0df'
    const palmLight = '#fff7ec'
    const palmBase = '#ffe8d2'
    const padTone = '#ffdabb'

    const drawFinger = (x: number, y: number, width: number, height: number, angleDeg: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((angleDeg * Math.PI) / 180)
      ctx.fillStyle = fingerBase
      fillRoundRect(ctx, -width * 0.5, -height, width, height, width * 0.42)
      ctx.stroke()
      ctx.fillStyle = fingerLight
      fillRoundRect(ctx, -width * 0.38, -height + 4, width * 0.76, height * 0.62, width * 0.28)
      ctx.restore()
    }

    ctx.strokeStyle = outline
    ctx.lineWidth = 3.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    // Five-finger style: 4 upright fingers + 1 thumb, with softer white skin tone.
    drawFinger(37, 50, 11, 28, -16)
    drawFinger(49, 45, 11, 33, -8)
    drawFinger(61, 44, 11, 34, 5)
    drawFinger(73, 49, 11, 29, 14)

    const palmGradient = ctx.createLinearGradient(33, 44, 74, 86)
    palmGradient.addColorStop(0, palmLight)
    palmGradient.addColorStop(1, palmBase)
    ctx.fillStyle = palmGradient
    fillRoundRect(ctx, 34, 44, 42, 41, 15)
    ctx.stroke()

    ctx.fillStyle = fingerBase
    ctx.beginPath()
    ctx.moveTo(34, 64)
    ctx.bezierCurveTo(24, 58, 18, 64, 17, 73)
    ctx.bezierCurveTo(16, 80, 20, 86, 27, 87)
    ctx.bezierCurveTo(33, 88, 37, 84, 39, 78)
    ctx.bezierCurveTo(41, 72, 40, 67, 34, 64)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = padTone
    ctx.beginPath()
    ctx.ellipse(56, 67, 9.6, 7.6, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff8ef'
    ctx.beginPath()
    ctx.ellipse(50, 61, 3.8, 2.8, 0, 0, Math.PI * 2)
    ctx.fill()

    texture.refresh()
  }

  private createStageSentenceBanner() {
    this.sentencePanel = this.add.rectangle(GAME_WIDTH / 2, 42, 360, 46, 0x0f6879, 0.82)
    this.sentencePanel.setStrokeStyle(2, 0xffffff, 0.5)
    this.sentencePanel.setDepth(52)
    this.sentencePanel.setVisible(false)

    this.sentenceText = this.add.text(GAME_WIDTH / 2, 42, '', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '28px',
      fontStyle: '700',
      color: '#ffffff',
      stroke: '#114c5a',
      strokeThickness: 5,
    })
    this.sentenceText.setOrigin(0.5, 0.5)
    this.sentenceText.setDepth(53)
    this.sentenceText.setVisible(false)
  }

  private clearSentenceBanner() {
    if (this.sentenceTween) {
      this.sentenceTween.stop()
      this.sentenceTween = undefined
    }

    this.sentencePanel?.setVisible(false)
    this.sentenceText?.setVisible(false)
    this.sentenceAnimalId = null
  }

  private drawCartoonAnimal(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.beginPath()
    ctx.arc(180, 156, 126, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(45, 74, 38, 0.22)'
    ctx.beginPath()
    ctx.ellipse(180, 284, 108, 20, 0, 0, Math.PI * 2)
    ctx.fill()

    const emoji = EMOJI_BY_ANIMAL[spec.id]
    if (emoji) {
      ctx.fillStyle = 'rgba(240, 250, 255, 0.96)'
      ctx.beginPath()
      ctx.arc(180, 170, 90, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(96, 178, 198, 0.4)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(180, 170, 90, 0, Math.PI * 2)
      ctx.stroke()

      ctx.font = '164px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(emoji, 180, 170)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.58)'
      ctx.beginPath()
      ctx.arc(146, 126, 18, 0, Math.PI * 2)
      ctx.fill()
      return
    }

    if (spec.template === 'fish') {
      this.drawFish(ctx, spec)
      return
    }
    if (spec.template === 'snake') {
      this.drawSnake(ctx, spec)
      return
    }
    if (spec.template === 'octopus') {
      this.drawOctopus(ctx, spec)
      return
    }
    if (spec.template === 'insect') {
      this.drawInsect(ctx, spec)
      return
    }
    if (spec.template === 'bird') {
      this.drawBird(ctx, spec)
      return
    }

    this.drawMammal(ctx, spec)
  }

  private drawMammal(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    ctx.fillStyle = spec.primary
    ctx.beginPath()
    ctx.ellipse(172, 190, 104, 72, 0, 0, Math.PI * 2)
    ctx.fill()

    if (spec.pattern === 'stripes') {
      ctx.strokeStyle = spec.secondary
      ctx.lineWidth = 8
      for (let x = 122; x <= 220; x += 22) {
        ctx.beginPath()
        ctx.moveTo(x, 144)
        ctx.lineTo(x - 12, 236)
        ctx.stroke()
      }
    }

    if (spec.pattern === 'spots') {
      ctx.fillStyle = spec.secondary
      for (let index = 0; index < 8; index += 1) {
        const px = 118 + (index % 4) * 30 + (index > 3 ? 10 : 0)
        const py = 164 + Math.floor(index / 4) * 36
        ctx.beginPath()
        ctx.arc(px, py, 10 + (index % 2) * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.fillStyle = spec.secondary
    for (const x of [108, 142, 184, 218]) {
      fillRoundRect(ctx, x, 220, 24, 56, 11)
    }

    ctx.strokeStyle = spec.secondary
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(72, 198)
    ctx.bezierCurveTo(22, 178, 20, 226, 64, 236)
    ctx.stroke()

    ctx.fillStyle = spec.secondary
    ctx.beginPath()
    ctx.arc(252, 148, 54, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(225, 104, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(279, 104, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.belly
    ctx.beginPath()
    ctx.ellipse(254, 170, 26, 22, 0, 0, Math.PI * 2)
    ctx.fill()

    drawEye(ctx, 236, 145, 7)
    drawEye(ctx, 268, 145, 7)

    ctx.fillStyle = '#2b3f46'
    ctx.beginPath()
    ctx.arc(252, 166, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawBird(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    ctx.fillStyle = spec.primary
    ctx.beginPath()
    ctx.ellipse(180, 186, 82, 86, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.secondary
    ctx.beginPath()
    ctx.ellipse(143, 188, 24, 48, -0.22, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(217, 188, 24, 48, 0.22, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.secondary
    ctx.beginPath()
    ctx.arc(180, 124, 42, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.belly
    ctx.beginPath()
    ctx.ellipse(180, 200, 46, 56, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.accent
    ctx.beginPath()
    ctx.moveTo(180, 136)
    ctx.lineTo(216, 149)
    ctx.lineTo(180, 158)
    ctx.fill()

    ctx.strokeStyle = '#f08b32'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(166, 260)
    ctx.lineTo(160, 286)
    ctx.moveTo(194, 260)
    ctx.lineTo(200, 286)
    ctx.stroke()

    drawEye(ctx, 166, 120, 7)
    drawEye(ctx, 194, 120, 7)
  }

  private drawFish(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    ctx.fillStyle = spec.primary
    ctx.beginPath()
    ctx.ellipse(176, 182, 98, 60, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.secondary
    ctx.beginPath()
    ctx.moveTo(252, 182)
    ctx.lineTo(314, 144)
    ctx.lineTo(314, 220)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(168, 134)
    ctx.lineTo(194, 96)
    ctx.lineTo(214, 140)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = spec.belly
    ctx.beginPath()
    ctx.ellipse(166, 198, 62, 34, 0, 0, Math.PI * 2)
    ctx.fill()

    if (spec.pattern !== 'none') {
      ctx.strokeStyle = spec.accent
      ctx.lineWidth = 5
      for (let index = 0; index < 4; index += 1) {
        ctx.beginPath()
        ctx.arc(150 + index * 28, 172 + (index % 2) * 14, 12, 0.3, 2.6)
        ctx.stroke()
      }
    }

    drawEye(ctx, 126, 172, 8)
  }

  private drawSnake(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    ctx.strokeStyle = spec.primary
    ctx.lineWidth = 54
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(84, 220)
    ctx.bezierCurveTo(130, 124, 240, 266, 300, 150)
    ctx.stroke()

    if (spec.pattern !== 'none') {
      ctx.strokeStyle = spec.secondary
      ctx.lineWidth = 6
      for (let x = 102; x <= 282; x += 26) {
        ctx.beginPath()
        ctx.arc(x, 190 + Math.sin(x * 0.06) * 22, 12, 0.2, 2.8)
        ctx.stroke()
      }
    }

    ctx.fillStyle = spec.secondary
    ctx.beginPath()
    ctx.arc(302, 150, 34, 0, Math.PI * 2)
    ctx.fill()

    drawEye(ctx, 292, 146, 6.8)
    drawEye(ctx, 312, 146, 6.8)

    ctx.strokeStyle = '#f3606a'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(332, 154)
    ctx.lineTo(348, 150)
    ctx.lineTo(332, 146)
    ctx.stroke()
  }

  private drawOctopus(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    ctx.fillStyle = spec.primary
    ctx.beginPath()
    ctx.arc(180, 146, 74, Math.PI, 0)
    ctx.lineTo(254, 206)
    ctx.lineTo(106, 206)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = spec.secondary
    for (let index = 0; index < 8; index += 1) {
      const x = 118 + index * 20
      fillRoundRect(ctx, x, 198, 16, 74, 10)
      ctx.fillStyle = spec.accent
      ctx.beginPath()
      ctx.arc(x + 8, 258, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = spec.secondary
    }

    drawEye(ctx, 156, 152, 9)
    drawEye(ctx, 204, 152, 9)
  }

  private drawInsect(ctx: CanvasRenderingContext2D, spec: CartoonSpec) {
    if (spec.template !== 'insect') {
      return
    }

    ctx.fillStyle = 'rgba(214, 241, 255, 0.72)'
    ctx.beginPath()
    ctx.ellipse(132, 154, 48, 30, -0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(228, 154, 48, 30, 0.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.primary
    ctx.beginPath()
    ctx.ellipse(180, 188, 76, 52, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = spec.secondary
    ctx.beginPath()
    ctx.arc(180, 128, 34, 0, Math.PI * 2)
    ctx.fill()

    if (spec.pattern === 'stripes') {
      ctx.strokeStyle = spec.secondary
      ctx.lineWidth = 10
      for (let x = 144; x <= 216; x += 18) {
        ctx.beginPath()
        ctx.moveTo(x, 148)
        ctx.lineTo(x, 228)
        ctx.stroke()
      }
    }

    ctx.strokeStyle = spec.secondary
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    for (let index = 0; index < 3; index += 1) {
      const y = 176 + index * 20
      ctx.beginPath()
      ctx.moveTo(118, y)
      ctx.lineTo(88, y - 14)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(242, y)
      ctx.lineTo(272, y - 14)
      ctx.stroke()
    }

    drawEye(ctx, 168, 126, 6.8)
    drawEye(ctx, 192, 126, 6.8)
  }

  private createForestBackground() {
    const sky = this.add.graphics()
    sky.fillGradientStyle(0xbde9ff, 0xbde9ff, 0xeaf9ff, 0xeaf9ff, 0.75, 0.75, 0.63, 0.63)
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    this.add.circle(832, 92, 82, 0xfff2ba, 0.9).setDepth(0.1)
    this.add.circle(130, 96, 60, 0xffffff, 0.56).setDepth(0.1)
    this.add.circle(196, 102, 44, 0xffffff, 0.5).setDepth(0.1)
    this.add.circle(252, 92, 38, 0xffffff, 0.46).setDepth(0.1)

    this.add.ellipse(194, 320, 470, 238, 0xd0ebd3, 0.72).setDepth(1)
    this.add.ellipse(738, 338, 590, 266, 0xc0e0c6, 0.72).setDepth(1)
    this.add.ellipse(480, 402, 560, 244, 0xa5d0af, 0.46).setDepth(1.1)

    const addTree = (x: number, y: number, scale: number, depth: number, color: number) => {
      const trunk = this.add.rectangle(x, y, 34 * scale, 132 * scale, 0x8a5932).setDepth(depth)
      trunk.setStrokeStyle(2, 0x6f4120, 0.4)
      this.add.circle(x - 30 * scale, y - 72 * scale, 46 * scale, color, 0.96).setDepth(depth + 0.1)
      this.add.circle(x + 26 * scale, y - 80 * scale, 50 * scale, color + 0x060606, 0.96).setDepth(depth + 0.1)
      this.add.circle(x, y - 114 * scale, 56 * scale, color - 0x040404, 0.96).setDepth(depth + 0.1)
    }

    addTree(90, 290, 0.96, 2, 0x5ca95f)
    addTree(208, 302, 0.76, 2, 0x56a45a)
    addTree(874, 282, 1.02, 2, 0x5ca85f)
    addTree(772, 312, 0.74, 2, 0x549f56)

    const meadow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 74, GAME_WIDTH + 90, 196, 0x8fce79, 0.98)
    meadow.setDepth(3)
    meadow.setStrokeStyle(2, 0x6fb560, 0.45)
  }

  private createHandCursor() {
    const shadow = this.add.ellipse(0, 12, 80, 34, 0x11404c, 0.22)
    const spark = this.add.circle(-34, -22, 8, 0xffffff, 0.72)
    const sprite = this.add.image(0, 0, HAND_CURSOR_TEXTURE_KEY)
    sprite.setScale(0.74)

    this.handCursor = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [shadow, sprite, spark])
    this.handCursor.setVisible(false)
    this.handCursor.setDepth(60)

    this.tweens.add({
      targets: spark,
      alpha: 0.2,
      scale: 0.6,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private syncAnimals(animals: StageAnimal[]) {
    const aliveIds = new Set(animals.map((animal) => animal.slotId))

    for (const [slotId, animalView] of this.animalViews) {
      if (!aliveIds.has(slotId)) {
        animalView.container.destroy(true)
        this.animalViews.delete(slotId)
      }
    }

    for (const animal of animals) {
      const definition = ANIMAL_BY_ID[animal.animalId] ?? ANIMAL_BY_ID.cat
      const existing = this.animalViews.get(animal.slotId)

      if (!existing) {
        const shadow = this.add.ellipse(0, 174, 250, 44, 0x2c4350, 0.2)
        const glow = this.add.ellipse(0, 18, 420, 360, hexColor(definition.palette.glow), 0.24)
        const sprite = this.add.image(0, 12, definition.textureKey)
        fitSprite(sprite, 380, 330)

        const container = this.add.container(animal.x, animal.y, [shadow, glow, sprite])
        container.setDepth(12)

        this.animalViews.set(animal.slotId, {
          animalId: animal.animalId,
          container,
          glow,
          sprite,
          shadow,
          baseX: animal.x,
          baseY: animal.y,
          floatSpeed: animal.floatSpeed,
          floatPhase: animal.floatPhase,
          pulseSpeed: Phaser.Math.FloatBetween(2.1, 3.4),
          pulsePhase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        })
        continue
      }

      existing.baseX = animal.x
      existing.baseY = animal.y
      existing.floatSpeed = animal.floatSpeed
      existing.floatPhase = animal.floatPhase

      if (existing.animalId !== animal.animalId) {
        existing.animalId = animal.animalId
        existing.sprite.setTexture(definition.textureKey)
        fitSprite(existing.sprite, 380, 330)
        existing.glow.setFillStyle(hexColor(definition.palette.glow), 0.24)
        existing.pulseSpeed = Phaser.Math.FloatBetween(2.1, 3.4)
        existing.pulsePhase = Phaser.Math.FloatBetween(0, Math.PI * 2)
      }
    }
  }

  private playRewardBurst(rewardEvent: RewardEvent) {
    const definition = ANIMAL_BY_ID[rewardEvent.animalId] ?? ANIMAL_BY_ID.cat
    const sentence = `It is ${articleFor(definition.word)} ${definition.word}.`
    const animalView = this.animalViews.get('focus-animal')

    if (this.sentencePanel && this.sentenceText) {
      if (this.sentenceTween) {
        this.sentenceTween.stop()
      }

      this.sentenceText.setText(sentence)
      this.sentencePanel.setVisible(true)
      this.sentenceText.setVisible(true)
      this.sentencePanel.setAlpha(0)
      this.sentenceText.setAlpha(0)
      this.sentenceAnimalId = rewardEvent.animalId

      this.sentenceTween = this.tweens.add({
        targets: [this.sentencePanel, this.sentenceText],
        alpha: 1,
        duration: 260,
        ease: 'Sine.InOut',
      })
    }

    if (animalView) {
      this.tweens.add({
        targets: [animalView.container, animalView.glow],
        scaleX: 1.14,
        scaleY: 1.14,
        duration: 260,
        yoyo: true,
        ease: 'Sine.InOut',
      })

      this.tweens.add({
        targets: animalView.shadow,
        scaleX: 0.86,
        scaleY: 0.86,
        duration: 260,
        yoyo: true,
        ease: 'Sine.InOut',
      })
    }

    for (let index = 0; index < 20; index += 1) {
      const angle = (Math.PI * 2 * index) / 20
      const sparkle = this.add.circle(rewardEvent.x, rewardEvent.y + 10, 10, hexColor(definition.palette.badge), 0.86)
      sparkle.setDepth(40)

      this.tweens.add({
        targets: sparkle,
        x: rewardEvent.x + Math.cos(angle) * 160,
        y: rewardEvent.y + Math.sin(angle) * 160,
        alpha: 0,
        scale: 0.32,
        duration: 560,
        ease: 'Sine.Out',
        onComplete: () => sparkle.destroy(),
      })
    }
  }
}
