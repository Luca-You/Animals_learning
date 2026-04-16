import { GAME_HEIGHT, GAME_WIDTH } from '../assets/manifest'
import { ANIMALS, ANIMAL_BY_ID, getAnimalHeadHitProfile, type AnimalId } from '../content/animals'

export type GamePhase = 'intro' | 'running' | 'paused' | 'rewarding' | 'await-next'

export interface StageAnimal {
  slotId: string
  animalId: AnimalId
  x: number
  y: number
  radius: number
  scale: number
  floatSpeed: number
  floatPhase: number
}

export interface RewardEvent {
  seq: number
  animalId: AnimalId
  x: number
  y: number
}

export interface GameState {
  phase: GamePhase
  animals: StageAnimal[]
  message: string
  rewardEvent: RewardEvent | null
  resumeRunningAfterNext: boolean
}

const animalIds = ANIMALS.map((animal) => animal.id)
const STAGE_CENTER = { x: GAME_WIDTH * 0.5, y: GAME_HEIGHT * 0.56 }

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const sampleAnimal = (exclude?: AnimalId) => {
  const candidates = exclude ? animalIds.filter((animalId) => animalId !== exclude) : animalIds
  return candidates[Math.floor(Math.random() * candidates.length)] ?? 'cat'
}

const createStageAnimal = (animalId: AnimalId): StageAnimal => ({
  slotId: 'focus-animal',
  animalId,
  x: STAGE_CENTER.x,
  y: STAGE_CENTER.y,
  radius: 220,
  scale: 1,
  floatSpeed: randomBetween(0.9, 1.7),
  floatPhase: randomBetween(0, Math.PI * 2),
})

const createAnimals = (animalId: AnimalId) => [createStageAnimal(animalId)]

export const createIntroState = (): GameState => ({
  phase: 'intro',
  animals: createAnimals('cat'),
  message: '先开启摄像头，再点击“启动”。',
  rewardEvent: null,
  resumeRunningAfterNext: false,
})

export const resumeRunningState = (state: GameState): GameState => {
  if (state.phase === 'running') {
    return state
  }

  if (state.phase === 'rewarding') {
    return {
      ...state,
      message: '奖励播放中，请稍等。',
    }
  }

  if (state.phase === 'await-next') {
    return {
      ...state,
      message: '请点击“下一个动物”。',
    }
  }

  return {
    ...state,
    phase: 'running',
    message: '请小朋友用手掌摸一摸动物。',
  }
}

export const pauseState = (state: GameState): GameState => {
  if (state.phase !== 'running') {
    return state
  }

  return {
    ...state,
    phase: 'paused',
    message: '已暂停，点击“启动”继续。',
  }
}

export const nextAnimalState = (state: GameState): GameState => {
  if (state.phase === 'rewarding') {
    return {
      ...state,
      message: '奖励播放中，暂时不能切换。',
    }
  }

  const currentAnimal = state.animals[0]?.animalId ?? 'cat'
  const nextAnimal = sampleAnimal(currentAnimal)
  const shouldResumeRunning =
    state.phase === 'running' || (state.phase === 'await-next' && state.resumeRunningAfterNext)

  return {
    ...state,
    phase: shouldResumeRunning ? 'running' : 'paused',
    animals: createAnimals(nextAnimal),
    rewardEvent: null,
    resumeRunningAfterNext: false,
    message: shouldResumeRunning ? '新动物已出现，摸摸它。' : '新动物已准备好，点击“启动”。',
  }
}

export const findTouchedAnimal = (state: GameState, x: number, y: number) =>
  state.animals.find((animal) => {
    const head = getAnimalHeadHitProfile(animal.animalId)
    const headX = animal.x + head.headOffsetX * animal.scale
    const headY = animal.y + head.headOffsetY * animal.scale
    const dx = x - headX
    const dy = y - headY
    const forgivingRadius = (head.headRadius + 14) * animal.scale
    return Math.sqrt(dx * dx + dy * dy) <= forgivingRadius
  })

export const applyAnimalTouch = (state: GameState, slotId: string): GameState => {
  if (state.phase !== 'running') {
    return state
  }

  const touchedAnimal = state.animals.find((animal) => animal.slotId === slotId)
  if (!touchedAnimal) {
    return state
  }

  const touchedDefinition = ANIMAL_BY_ID[touchedAnimal.animalId] ?? ANIMAL_BY_ID.cat

  return {
    ...state,
    phase: 'rewarding',
    rewardEvent: {
      seq: (state.rewardEvent?.seq ?? 0) + 1,
      animalId: touchedAnimal.animalId,
      x: touchedAnimal.x,
      y: touchedAnimal.y,
    },
    resumeRunningAfterNext: true,
    message: `Great! ${touchedDefinition.word}`,
  }
}

export const completeRewardState = (state: GameState): GameState => {
  if (state.phase !== 'rewarding') {
    return state
  }

  return {
    ...state,
    phase: 'await-next',
    rewardEvent: null,
    message: '奖励完成，请点击“下一个动物”。',
  }
}
