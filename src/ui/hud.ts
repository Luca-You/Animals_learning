import type { TrackerStatus } from '../game/input/handTracker'
import type { GameState } from '../game/simulation/state'

interface HudRefs {
  openCameraButton: HTMLButtonElement | null
  togglePlayButton: HTMLButtonElement | null
  nextAnimalButton: HTMLButtonElement | null
  stopButton: HTMLButtonElement | null
  phaseNote: HTMLElement | null
  messageText: HTMLElement | null
  trackingPill: HTMLElement | null
  cameraStatus: HTMLElement | null
  cameraPlaceholder: HTMLElement | null
  cameraTip: HTMLElement | null
  voiceHint: HTMLElement | null
}

const statusText: Record<TrackerStatus, string> = {
  idle: '未启动',
  loading: '启动中',
  ready: '已连接',
  error: '异常',
}

export class HudView {
  private readonly refs: HudRefs

  constructor(refs: HudRefs) {
    this.refs = refs
  }

  onOpenCamera(handler: () => void | Promise<void>) {
    this.refs.openCameraButton?.addEventListener('click', () => {
      void handler()
    })
  }

  onTogglePlay(handler: () => void | Promise<void>) {
    this.refs.togglePlayButton?.addEventListener('click', () => {
      void handler()
    })
  }

  onNextAnimal(handler: () => void | Promise<void>) {
    this.refs.nextAnimalButton?.addEventListener('click', () => {
      void handler()
    })
  }

  onStop(handler: () => void | Promise<void>) {
    this.refs.stopButton?.addEventListener('click', () => {
      void handler()
    })
  }

  setCameraButtonBusy(busy: boolean) {
    if (!this.refs.openCameraButton) {
      return
    }

    this.refs.openCameraButton.disabled = busy
    this.refs.openCameraButton.textContent = busy ? '摄像头启动中...' : '开启摄像头'
  }

  setMessage(message: string) {
    if (this.refs.messageText) {
      this.refs.messageText.textContent = message
    }
  }

  setVoiceHint(text: string, tone: 'idle' | 'listening' | 'error' | 'unsupported' = 'idle') {
    if (!this.refs.voiceHint) {
      return
    }

    this.refs.voiceHint.textContent = text
    this.refs.voiceHint.dataset.tone = tone
  }

  setPhaseNote(note: string) {
    if (this.refs.phaseNote) {
      this.refs.phaseNote.textContent = note
    }
  }

  render(
    state: Readonly<GameState>,
    tracker: TrackerStatus,
    trackerMessage: string,
    handSeen: boolean,
    cameraLive: boolean,
  ) {
    if (this.refs.messageText) {
      this.refs.messageText.textContent = state.message
    }

    const started =
      state.phase === 'running' ||
      state.phase === 'paused' ||
      state.phase === 'rewarding' ||
      state.phase === 'await-next'
    const isRewarding = state.phase === 'rewarding'

    if (this.refs.togglePlayButton) {
      this.refs.togglePlayButton.textContent = started ? '已启动' : '启动'
      this.refs.togglePlayButton.disabled = started || isRewarding
      this.refs.togglePlayButton.classList.toggle('is-passive', started)
    }

    if (this.refs.nextAnimalButton) {
      this.refs.nextAnimalButton.disabled = !started || isRewarding
    }

    if (this.refs.stopButton) {
      this.refs.stopButton.disabled = !started
      this.refs.stopButton.classList.toggle('is-active', started)
      this.refs.stopButton.classList.toggle('is-passive', !started)
    }

    this.updateTracker(tracker, trackerMessage, handSeen, cameraLive)
  }

  updateTracker(status: TrackerStatus, trackerMessage: string, handSeen: boolean, cameraLive: boolean) {
    if (this.refs.trackingPill) {
      this.refs.trackingPill.textContent = ''
    }

    if (this.refs.cameraStatus) {
      this.refs.cameraStatus.className = `status-dot ${status}`
      this.refs.cameraStatus.textContent = statusText[status]
    }

    if (this.refs.cameraPlaceholder) {
      this.refs.cameraPlaceholder.classList.toggle('is-hidden', cameraLive)
      if (!cameraLive) {
        this.refs.cameraPlaceholder.textContent = trackerMessage || '等待摄像头权限'
      }
    }

    if (this.refs.cameraTip) {
      this.refs.cameraTip.textContent =
        status === 'ready'
          ? handSeen
            ? '检测到手掌，去摸中间的小动物吧。'
            : '摄像头已连接，请把手掌放到镜头前。'
          : '点击“开启摄像头”，并允许浏览器权限。'
    }
  }

  flashReward(text: string) {
    if (!this.refs.messageText) {
      return
    }
    this.refs.messageText.textContent = text
  }
}
