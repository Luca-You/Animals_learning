import {
  applyAnimalTouch,
  completeRewardState,
  createIntroState,
  findTouchedAnimal,
  nextAnimalState,
  pauseState,
  resumeRunningState,
  type GameState,
} from './state'

type StateListener = (state: Readonly<GameState>) => void

export class TapAnimalController {
  private state: GameState = createIntroState()
  private listeners = new Set<StateListener>()
  private engagedSlotId: string | null = null
  private hasStarted = false

  subscribe(listener: StateListener) {
    this.listeners.add(listener)
    listener(this.state)

    return () => {
      this.listeners.delete(listener)
    }
  }

  resume() {
    if (this.state.phase === 'running' || this.state.phase === 'rewarding' || this.state.phase === 'await-next') {
      return
    }

    this.engagedSlotId = null
    this.hasStarted = true
    this.state = resumeRunningState(this.state)
    this.emit()
  }

  stop() {
    this.engagedSlotId = null
    this.hasStarted = false
    this.state = createIntroState()
    this.emit()
  }

  pause() {
    this.engagedSlotId = null
    this.state = pauseState(this.state)
    this.emit()
  }

  toggleRunning() {
    this.resume()
  }

  nextAnimal() {
    if (!this.hasStarted) {
      return
    }

    this.engagedSlotId = null
    this.state = nextAnimalState(this.state)
    if (this.hasStarted && this.state.phase !== 'rewarding') {
      this.state = resumeRunningState(this.state)
    }
    this.emit()
  }

  completeReward() {
    this.engagedSlotId = null
    this.state = completeRewardState(this.state)
    this.emit()
  }

  tapAt(x: number, y: number) {
    const touched = findTouchedAnimal(this.state, x, y)

    if (!touched) {
      return
    }

    this.state = applyAnimalTouch(this.state, touched.slotId)
    this.engagedSlotId = touched.slotId
    this.emit()
  }

  trackHandPoint(point: { x: number; y: number }) {
    if (this.state.phase !== 'running') {
      return
    }

    const touched = findTouchedAnimal(this.state, point.x, point.y)

    if (!touched) {
      this.engagedSlotId = null
      return
    }

    if (touched.slotId === this.engagedSlotId) {
      return
    }

    this.engagedSlotId = touched.slotId
    this.state = applyAnimalTouch(this.state, touched.slotId)
    this.emit()
  }

  resetHandTracking() {
    this.engagedSlotId = null
  }

  getState() {
    return this.state
  }

  private emit() {
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}
