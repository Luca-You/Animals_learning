import { FilesetResolver, HandLandmarker, type HandLandmarkerResult } from '@mediapipe/tasks-vision'

export type TrackerStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface HandPoint {
  xNorm: number
  yNorm: number
  confidence: number
}

type StatusListener = (status: TrackerStatus, message: string, cameraLive: boolean) => void
type PointListener = (point: HandPoint | null) => void

const drawRoundedRect = (
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
}

const drawPalmIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const palmW = size * 0.68
  const palmH = size * 0.56
  const fingerW = size * 0.14
  const fingerH = size * 0.32
  const spacing = size * 0.03
  const startX = x - (fingerW * 4 + spacing * 3) * 0.5
  const fingerY = y - palmH * 0.7 - fingerH

  const glow = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 0.8)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, size * 0.84, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 231, 201, 0.98)'
  ctx.strokeStyle = 'rgba(23, 109, 128, 0.98)'
  ctx.lineWidth = Math.max(2, size * 0.06)

  for (let index = 0; index < 4; index += 1) {
    const fingerX = startX + index * (fingerW + spacing)
    drawRoundedRect(ctx, fingerX, fingerY, fingerW, fingerH, fingerW * 0.45)
    ctx.fill()
    ctx.stroke()
  }

  drawRoundedRect(ctx, x - palmW * 0.5, y - palmH * 0.38, palmW, palmH, size * 0.2)
  ctx.fill()
  ctx.stroke()

  drawRoundedRect(ctx, x - palmW * 0.62, y - palmH * 0.06, size * 0.23, size * 0.34, size * 0.1)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 209, 170, 0.95)'
  ctx.beginPath()
  ctx.arc(x, y + size * 0.06, size * 0.17, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.beginPath()
  ctx.arc(x - size * 0.12, y - size * 0.16, size * 0.06, 0, Math.PI * 2)
  ctx.fill()
}

export class HandTracker {
  private statusListeners = new Set<StatusListener>()
  private pointListeners = new Set<PointListener>()
  private landmarker: HandLandmarker | null = null
  private stream: MediaStream | null = null
  private animationFrameId = 0
  private running = false
  private lastVideoTime = -1
  private lastInferenceTime = 0
  private readonly video: HTMLVideoElement
  private readonly overlay: HTMLCanvasElement

  constructor(video: HTMLVideoElement, overlay: HTMLCanvasElement) {
    this.video = video
    this.overlay = overlay
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  onPoint(listener: PointListener) {
    this.pointListeners.add(listener)
    return () => this.pointListeners.delete(listener)
  }

  async start() {
    if (this.running) {
      return
    }

    this.lastVideoTime = -1
    this.lastInferenceTime = 0
    this.emitStatus('loading', '正在启动摄像头与手势识别...', false)

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前浏览器不支持摄像头访问。')
    }

    this.emitStatus('loading', '请允许 Chrome 使用摄像头权限。', false)

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: 960 },
        height: { ideal: 720 },
      },
    })

    this.video.srcObject = this.stream
    await this.waitForVideoReady()
    this.syncCanvasSize()
    this.emitStatus('loading', '摄像头已开启，正在加载手势识别模型...', true)

    try {
      await this.ensureLandmarker()
    } catch (error) {
      const message = error instanceof Error ? error.message : '手势识别初始化失败'
      this.emitStatus('error', `摄像头已开启，但手势识别失败：${message}`, true)
      return
    }

    this.running = true
    this.emitStatus('ready', '小手雷达已准备好', true)
    this.loop()
  }

  stop() {
    this.running = false
    this.lastVideoTime = -1
    cancelAnimationFrame(this.animationFrameId)
    this.emitPoint(null)
    this.clearOverlay()
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
  }

  private async waitForVideoReady() {
    if (this.video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      await this.video.play()
      return
    }

    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => {
        cleanup()
        void this.video.play().then(() => resolve()).catch(reject)
      }
      const onError = () => {
        cleanup()
        reject(new Error('摄像头视频流无法播放。'))
      }
      const cleanup = () => {
        this.video.removeEventListener('loadedmetadata', onLoaded)
        this.video.removeEventListener('error', onError)
      }

      this.video.addEventListener('loadedmetadata', onLoaded, { once: true })
      this.video.addEventListener('error', onError, { once: true })
    })
  }

  private async ensureLandmarker() {
    if (this.landmarker) {
      return
    }

    const vision = await FilesetResolver.forVisionTasks('/wasm')
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/hand_landmarker.task',
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.4,
      minHandPresenceConfidence: 0.35,
      minTrackingConfidence: 0.35,
    })
  }

  private loop = () => {
    if (!this.running || !this.landmarker) {
      return
    }

    const now = performance.now()
    if (
      this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      this.video.currentTime !== this.lastVideoTime &&
      now - this.lastInferenceTime >= 42
    ) {
      const result = this.landmarker.detectForVideo(this.video, now)
      this.lastVideoTime = this.video.currentTime
      this.lastInferenceTime = now
      this.syncCanvasSize()
      this.renderOverlay(result)
    }

    this.animationFrameId = requestAnimationFrame(this.loop)
  }

  private syncCanvasSize() {
    if (this.overlay.width === this.video.videoWidth && this.overlay.height === this.video.videoHeight) {
      return
    }

    this.overlay.width = this.video.videoWidth || 640
    this.overlay.height = this.video.videoHeight || 480
  }

  private renderOverlay(result: HandLandmarkerResult) {
    const ctx = this.overlay.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.clearRect(0, 0, this.overlay.width, this.overlay.height)

    const handIndex = (result.handednesses ?? []).findIndex((handedness) => {
      const label = handedness?.[0]?.categoryName?.toLowerCase()
      return label === 'right'
    })

    if (handIndex < 0) {
      this.emitPoint(null)
      return
    }

    const landmarks = result.landmarks?.[handIndex]
    if (!landmarks || landmarks.length === 0) {
      this.emitPoint(null)
      return
    }

    const palm = landmarks[9]
    const confidence = result.handednesses?.[handIndex]?.[0]?.score ?? 0.7
    const palmX = palm.x * this.overlay.width
    const palmY = palm.y * this.overlay.height

    drawPalmIcon(ctx, palmX, palmY, 64)

    this.emitPoint({
      xNorm: 1 - palm.x,
      yNorm: palm.y,
      confidence,
    })
  }

  private clearOverlay() {
    const ctx = this.overlay.getContext('2d')
    ctx?.clearRect(0, 0, this.overlay.width, this.overlay.height)
  }

  private emitStatus(status: TrackerStatus, message: string, cameraLive = this.stream !== null) {
    for (const listener of this.statusListeners) {
      listener(status, message, cameraLive)
    }
  }

  private emitPoint(point: HandPoint | null) {
    for (const listener of this.pointListeners) {
      listener(point)
    }
  }
}
