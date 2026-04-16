import Phaser from 'phaser'
import './style.css'
import { RewardAudioController } from './game/audio/rewardAudio'
import { GAME_HEIGHT, GAME_WIDTH } from './game/assets/manifest'
import { HandTracker, type HandPoint, type TrackerStatus } from './game/input/handTracker'
import { VoiceCommandController } from './game/input/voiceCommand'
import { TapAnimalController } from './game/simulation/controller'
import { BootScene } from './phaser/scenes/BootScene'
import { GameplayScene } from './phaser/scenes/GameplayScene'
import { HudView } from './ui/hud'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('App root not found.')
}

const params = new URLSearchParams(window.location.search)
const catalogMode = params.get('catalog') === '1'

if (catalogMode) {
  app.innerHTML = `
    <div class="catalog-shell">
      <div id="game-root" class="catalog-root" aria-label="Tap Animal Catalog"></div>
    </div>
  `

  const gameRoot = document.querySelector<HTMLDivElement>('#game-root')
  if (!gameRoot) {
    throw new Error('Catalog root not found.')
  }

  const gameplayScene = new GameplayScene()
  gameplayScene.enableCatalogMode()

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameRoot,
    width: 1320,
    height: 1780,
    backgroundColor: '#f3fbff',
    scene: [new BootScene(), gameplayScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  })
} else {
  app.innerHTML = `
    <div class="page-shell">
      <header class="top-card">
        <div class="top-spacer" aria-hidden="true"></div>
        <h1 class="top-title">I like animals!</h1>
        <button id="open-camera-button" class="cta-button" type="button">开启摄像头</button>
      </header>

      <section class="stage-card">
        <div class="stage-wrapper">
          <div id="game-root" class="game-root" aria-label="Tap Animal 游戏画面"></div>

          <section class="stage-radar">
            <div class="card-heading">
              <h2>小手雷达</h2>
              <span id="camera-status" class="status-dot idle">未启动</span>
            </div>

            <div class="camera-view mini">
              <video id="camera-feed" autoplay muted playsinline></video>
              <canvas id="camera-overlay"></canvas>
              <div class="camera-placeholder" id="camera-placeholder">等待摄像头权限</div>
            </div>

            <p class="camera-tip" id="camera-tip">点击“开启摄像头”，并允许浏览器权限。</p>
            <p id="voice-hint" class="voice-hint" data-tone="idle">语音切换：未开启</p>
            <div class="tracking-pill-hidden" id="tracking-pill"></div>
          </section>
        </div>
      </section>
    </div>
  `

  const videoEl = document.querySelector<HTMLVideoElement>('#camera-feed')
  const cameraCanvas = document.querySelector<HTMLCanvasElement>('#camera-overlay')
  const gameRoot = document.querySelector<HTMLDivElement>('#game-root')
  if (!videoEl || !cameraCanvas || !gameRoot) {
    throw new Error('Required DOM nodes are missing.')
  }

  const hud = new HudView({
    openCameraButton: document.querySelector<HTMLButtonElement>('#open-camera-button'),
    togglePlayButton: null,
    nextAnimalButton: null,
    stopButton: null,
    phaseNote: null,
    messageText: null,
    trackingPill: document.querySelector<HTMLElement>('#tracking-pill'),
    cameraStatus: document.querySelector<HTMLElement>('#camera-status'),
    cameraPlaceholder: document.querySelector<HTMLElement>('#camera-placeholder'),
    cameraTip: document.querySelector<HTMLElement>('#camera-tip'),
    voiceHint: document.querySelector<HTMLElement>('#voice-hint'),
  })

  const controller = new TapAnimalController()
  const tracker = new HandTracker(videoEl, cameraCanvas)
  const voiceCommands = new VoiceCommandController()
  const rewardAudio = new RewardAudioController()
  const gameplayScene = new GameplayScene()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameRoot,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    transparent: true,
    backgroundColor: '#00000000',
    scene: [new BootScene(), gameplayScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  })

  gameplayScene.setTapHandler((x, y) => {
    controller.tapAt(x, y)
  })

  let trackerStatus: TrackerStatus = 'idle'
  let trackerMessage = '等待摄像头权限'
  let cameraLive = false
  let currentHandPoint: HandPoint | null = null
  let isOpeningCamera = false
  let isPlayingTouchAudio = false
  let awaitingVoiceNext = false
  let voiceNextLocked = true

  const triggerNextAnimalFromVoice = () => {
    const phase = controller.getState().phase
    if (phase !== 'await-next') {
      return false
    }

    if (isPlayingTouchAudio || voiceNextLocked || !awaitingVoiceNext) {
      return false
    }

    // Consume exactly one valid "Next one" command immediately.
    voiceNextLocked = true
    awaitingVoiceNext = false
    voiceCommands.setCommandEnabled(false)
    controller.nextAnimal()
    return true
  }

  tracker.onStatusChange((status, message, nextCameraLive) => {
    trackerStatus = status
    trackerMessage = message
    cameraLive = nextCameraLive
    hud.updateTracker(status, message, currentHandPoint !== null, cameraLive)
  })

  tracker.onPoint((point) => {
    currentHandPoint = point
    gameplayScene.setHandPoint(point)
    hud.updateTracker(trackerStatus, trackerMessage, point !== null, cameraLive)
  })

  voiceCommands.setStatusHandler((status, message) => {
    hud.setVoiceHint(`语音切换：${message}`, status)
  })

  controller.subscribe((state) => {
    hud.render(state, trackerStatus, trackerMessage, currentHandPoint !== null, cameraLive)
    gameplayScene.applyState(state)

    if (state.phase === 'await-next' && !isPlayingTouchAudio) {
      awaitingVoiceNext = true
      voiceNextLocked = false
      voiceCommands.setCommandEnabled(true)
    } else {
      awaitingVoiceNext = false
      voiceNextLocked = true
      voiceCommands.setCommandEnabled(false)
    }

    if (!isPlayingTouchAudio && state.phase === 'rewarding' && state.rewardEvent) {
      isPlayingTouchAudio = true
      awaitingVoiceNext = false
      voiceNextLocked = true
      voiceCommands.setCommandEnabled(false)

      void rewardAudio
        .playRewardSequence(state.rewardEvent.animalId)
        .catch(() => {
          // Keep game flow alive even if audio playback fails on some devices.
        })
        .finally(() => {
          isPlayingTouchAudio = false
          controller.completeReward()
        })
    }
  })

  hud.onOpenCamera(async () => {
    if (isOpeningCamera) {
      return
    }

    isOpeningCamera = true
    hud.setCameraButtonBusy(true)
    hud.updateTracker('loading', '请允许 Chrome 使用摄像头权限。', false, cameraLive)

    try {
      await rewardAudio.warmUp()
      await tracker.start()
      await voiceCommands.start(() => triggerNextAnimalFromVoice())
      controller.resume()
    } catch (error) {
      const message = error instanceof Error ? error.message : '摄像头开启失败'
      trackerStatus = 'error'
      trackerMessage = message
      cameraLive = false
      hud.updateTracker('error', message, false, false)
      hud.setVoiceHint(`语音切换：${message}`, 'error')
    } finally {
      hud.setCameraButtonBusy(false)
      isOpeningCamera = false
    }
  })

  window.addEventListener('error', (event) => {
    const message = event.error instanceof Error ? event.error.message : '页面运行出错'
    trackerStatus = 'error'
    trackerMessage = message
    cameraLive = false
    hud.updateTracker('error', `${message}，请刷新页面后再试。`, false, false)
    hud.setVoiceHint(`语音切换：${message}`, 'error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason)
    trackerStatus = 'error'
    trackerMessage = reason
    cameraLive = false
    hud.updateTracker('error', `${reason}，请刷新页面后再试。`, false, false)
    hud.setVoiceHint(`语音切换：${reason}`, 'error')
  })

  const frameLoop = () => {
    if (currentHandPoint) {
      controller.trackHandPoint({
        x: currentHandPoint.xNorm * GAME_WIDTH,
        y: currentHandPoint.yNorm * GAME_HEIGHT,
      })
    } else {
      controller.resetHandTracking()
    }
    requestAnimationFrame(frameLoop)
  }

  requestAnimationFrame(frameLoop)

  window.addEventListener('beforeunload', () => {
    voiceCommands.dispose()
    tracker.stop()
    rewardAudio.dispose()
    game.destroy(true)
  })
}
