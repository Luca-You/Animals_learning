import { ANIMAL_BY_ID, type AnimalId } from '../content/animals'

type SoundMode = 'real' | 'virtual'

type VirtualPattern =
  | 'soft_hum'
  | 'trumpet'
  | 'thump'
  | 'water_click'
  | 'snap'
  | 'flutter'
  | 'swish'
  | 'tiny_steps'
  | 'creep'
  | 'clack'
  | 'snuffle'
  | 'blink'
  | 'yip'
  | 'gentle_bubble'

interface AnimalSoundProfile {
  mode: SoundMode
  urls?: string[]
  virtualPattern?: VirtualPattern
  playbackRate?: number
  volume?: number
}

const SOUND_URLS = {
  dogBark: 'https://assets.mixkit.co/active_storage/sfx/1/1-preview.mp3',
  dogGrowl: 'https://assets.mixkit.co/active_storage/sfx/59/59-preview.mp3',
  catMeow: 'https://assets.mixkit.co/active_storage/sfx/93/93-preview.mp3',
  lionRoar: 'https://assets.mixkit.co/active_storage/sfx/6/6-preview.mp3',
  beastRoar: 'https://assets.mixkit.co/active_storage/sfx/13/13-preview.mp3',
  wolfHowl: 'https://assets.mixkit.co/active_storage/sfx/1775/1775-preview.mp3',
  monkey: 'https://assets.mixkit.co/active_storage/sfx/108/108-preview.mp3',
  horseNeigh: 'https://assets.mixkit.co/active_storage/sfx/85/85-preview.mp3',
  cowMoo: 'https://assets.mixkit.co/active_storage/sfx/1751/1751-preview.mp3',
  sheepBaa: 'https://assets.mixkit.co/active_storage/sfx/1741/1741-preview.mp3',
  goatBaa: 'https://assets.mixkit.co/active_storage/sfx/1763/1763-preview.mp3',
  rooster: 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3',
  geese: 'https://assets.mixkit.co/active_storage/sfx/20/20-preview.mp3',
  owl: 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3',
  frog: 'https://assets.mixkit.co/active_storage/sfx/1241/1241-preview.mp3',
  bee: 'https://assets.mixkit.co/active_storage/sfx/1926/1926-preview.mp3',
  snake: 'https://assets.mixkit.co/active_storage/sfx/327/327-preview.mp3',
  bat: 'https://assets.mixkit.co/active_storage/sfx/314/314-preview.mp3',
  squirrel: 'https://assets.mixkit.co/active_storage/sfx/430/430-preview.mp3',
} as const

const SOUND_PROFILES: Record<string, AnimalSoundProfile> = {
  dog: { mode: 'real', urls: [SOUND_URLS.dogBark, SOUND_URLS.dogGrowl], volume: 0.95 },
  cat: { mode: 'real', urls: [SOUND_URLS.catMeow], volume: 0.95 },
  elephant: { mode: 'virtual', virtualPattern: 'trumpet', volume: 0.9 },
  lion: { mode: 'real', urls: [SOUND_URLS.lionRoar], volume: 0.95 },
  tiger: { mode: 'real', urls: [SOUND_URLS.lionRoar, SOUND_URLS.beastRoar], playbackRate: 0.95, volume: 0.95 },
  giraffe: { mode: 'virtual', virtualPattern: 'soft_hum', volume: 0.85 },
  monkey: { mode: 'real', urls: [SOUND_URLS.monkey], volume: 0.9 },
  bear: { mode: 'real', urls: [SOUND_URLS.beastRoar], playbackRate: 0.85, volume: 0.95 },
  rabbit: { mode: 'virtual', virtualPattern: 'soft_hum', volume: 0.82 },
  kangaroo: { mode: 'virtual', virtualPattern: 'thump', volume: 0.9 },
  dolphin: { mode: 'virtual', virtualPattern: 'water_click', volume: 0.9 },
  penguin: { mode: 'real', urls: [SOUND_URLS.geese], playbackRate: 1.08, volume: 0.88 },
  crocodile: { mode: 'virtual', virtualPattern: 'snap', volume: 0.92 },
  koala: { mode: 'virtual', virtualPattern: 'snuffle', volume: 0.86 },
  zebra: { mode: 'real', urls: [SOUND_URLS.horseNeigh], playbackRate: 1.02, volume: 0.9 },
  gorilla: { mode: 'real', urls: [SOUND_URLS.beastRoar], playbackRate: 0.8, volume: 0.95 },
  hippopotamus: { mode: 'real', urls: [SOUND_URLS.beastRoar], playbackRate: 0.76, volume: 0.95 },
  camel: { mode: 'real', urls: [SOUND_URLS.goatBaa], playbackRate: 0.72, volume: 0.9 },
  polar_bear: { mode: 'real', urls: [SOUND_URLS.beastRoar], playbackRate: 0.78, volume: 0.95 },
  owl: { mode: 'real', urls: [SOUND_URLS.owl], volume: 0.88 },
  snake: { mode: 'real', urls: [SOUND_URLS.snake], volume: 0.9 },
  butterfly: { mode: 'virtual', virtualPattern: 'flutter', volume: 0.84 },
  horse: { mode: 'real', urls: [SOUND_URLS.horseNeigh], volume: 0.92 },
  cow: { mode: 'real', urls: [SOUND_URLS.cowMoo], volume: 0.92 },
  sheep: { mode: 'real', urls: [SOUND_URLS.sheepBaa], volume: 0.9 },
  goat: { mode: 'real', urls: [SOUND_URLS.goatBaa], volume: 0.9 },
  chicken: { mode: 'real', urls: [SOUND_URLS.rooster], volume: 0.9 },
  duck: { mode: 'real', urls: [SOUND_URLS.geese], playbackRate: 1.13, volume: 0.88 },
  fish: { mode: 'virtual', virtualPattern: 'gentle_bubble', volume: 0.86 },
  whale: { mode: 'virtual', virtualPattern: 'water_click', playbackRate: 0.72, volume: 0.9 },
  shark: { mode: 'virtual', virtualPattern: 'swish', volume: 0.88 },
  octopus: { mode: 'virtual', virtualPattern: 'gentle_bubble', playbackRate: 0.9, volume: 0.86 },
  frog: { mode: 'real', urls: [SOUND_URLS.frog], volume: 0.92 },
  bee: { mode: 'real', urls: [SOUND_URLS.bee], volume: 0.88 },
  ant: { mode: 'virtual', virtualPattern: 'tiny_steps', volume: 0.8 },
  spider: { mode: 'virtual', virtualPattern: 'creep', volume: 0.84 },
  crab: { mode: 'virtual', virtualPattern: 'clack', volume: 0.9 },
  panda: { mode: 'real', urls: [SOUND_URLS.beastRoar], playbackRate: 0.88, volume: 0.92 },
  deer: { mode: 'real', urls: [SOUND_URLS.horseNeigh], playbackRate: 1.08, volume: 0.88 },
  wolf: { mode: 'real', urls: [SOUND_URLS.wolfHowl], volume: 0.94 },
  fox: { mode: 'virtual', virtualPattern: 'yip', volume: 0.88 },
  squirrel: { mode: 'real', urls: [SOUND_URLS.squirrel], volume: 0.9 },
  flamingo: { mode: 'real', urls: [SOUND_URLS.geese], playbackRate: 1.16, volume: 0.88 },
  ostrich: { mode: 'real', urls: [SOUND_URLS.geese], playbackRate: 0.9, volume: 0.9 },
  bat: { mode: 'real', urls: [SOUND_URLS.bat], volume: 0.88 },
  hedgehog: { mode: 'virtual', virtualPattern: 'snuffle', volume: 0.86 },
  leopard: { mode: 'real', urls: [SOUND_URLS.lionRoar, SOUND_URLS.beastRoar], playbackRate: 1.02, volume: 0.92 },
  chameleon: { mode: 'virtual', virtualPattern: 'blink', volume: 0.82 },
}

const DEFAULT_PROFILE: AnimalSoundProfile = {
  mode: 'virtual',
  virtualPattern: 'soft_hum',
  volume: 0.85,
}

const SPEECH_RATE = 0.66
const SPEECH_GAP_MS = 480
const ANIMAL_SOUND_DURATION_MS = 5000

const waitMs = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

export class RewardAudioController {
  private audioContext: AudioContext | null = null
  private readonly speechSynthesis = window.speechSynthesis ?? null
  private readonly audioElementCache = new Map<string, HTMLAudioElement>()
  private sequenceToken = 0
  private activeElement: HTMLAudioElement | null = null
  private activeVirtualNodes: AudioNode[] = []

  async warmUp() {
    await this.ensureAudioContext()
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume().catch(() => undefined)
    }

    void this.preloadPrimarySources()
  }

  async playRewardSequence(animalId: AnimalId) {
    const token = ++this.sequenceToken
    this.stopAllPlayback()

    await this.speakSentenceTwice(animalId, token)
    if (token !== this.sequenceToken) {
      return
    }

    const profile = SOUND_PROFILES[animalId] ?? DEFAULT_PROFILE
    if (profile.mode === 'real') {
      const played = await this.playRealAnimalSound(profile, token)
      if (!played) {
        await this.playVirtualAnimalSound({ ...profile, mode: 'virtual', virtualPattern: 'soft_hum' }, token)
      }
      return
    }

    await this.playVirtualAnimalSound(profile, token)
  }

  dispose() {
    this.sequenceToken += 1
    this.stopAllPlayback()
    if (this.audioContext) {
      void this.audioContext.close().catch(() => undefined)
      this.audioContext = null
    }
  }

  private async speakSentenceTwice(animalId: AnimalId, token: number) {
    const animalWord = ANIMAL_BY_ID[animalId]?.word ?? 'animal'
    const sentence = `It is a ${animalWord}.`
    await this.speakOnce(sentence, token)
    if (token !== this.sequenceToken) {
      return
    }
    await waitMs(SPEECH_GAP_MS)
    if (token !== this.sequenceToken) {
      return
    }
    await this.speakOnce(sentence, token)
  }

  private async speakOnce(text: string, token: number) {
    if (!this.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
      return
    }

    await new Promise<void>((resolve) => {
      if (token !== this.sequenceToken) {
        resolve()
        return
      }

      const utterance = new window.SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = SPEECH_RATE
      utterance.pitch = 1
      utterance.volume = 1
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()

      try {
        this.speechSynthesis.cancel()
        this.speechSynthesis.speak(utterance)
      } catch {
        resolve()
      }

      window.setTimeout(resolve, 7000)
    })
  }

  private async playRealAnimalSound(profile: AnimalSoundProfile, token: number) {
    const urls = profile.urls ?? []
    if (urls.length === 0) {
      return false
    }

    const audio = await this.getPlayableAudio(urls)
    if (!audio || token !== this.sequenceToken) {
      return false
    }

    this.activeElement = audio
    audio.loop = true
    audio.currentTime = 0
    audio.playbackRate = profile.playbackRate ?? 1
    audio.volume = Math.max(0, Math.min(1, profile.volume ?? 0.9))

    try {
      await audio.play()
    } catch {
      this.stopActiveElement()
      return false
    }

    await waitMs(ANIMAL_SOUND_DURATION_MS)
    if (token === this.sequenceToken) {
      this.stopActiveElement()
    }
    return true
  }

  private async playVirtualAnimalSound(profile: AnimalSoundProfile, token: number) {
    const context = await this.ensureAudioContext()
    if (!context || token !== this.sequenceToken) {
      return
    }

    if (context.state === 'suspended') {
      await context.resume().catch(() => undefined)
    }

    const pattern = profile.virtualPattern ?? 'soft_hum'
    const master = context.createGain()
    master.gain.value = Math.max(0, Math.min(1, profile.volume ?? 0.85))
    master.connect(context.destination)
    this.activeVirtualNodes.push(master)

    const duration = ANIMAL_SOUND_DURATION_MS / 1000
    const startAt = context.currentTime + 0.02
    const rateScale = profile.playbackRate ?? 1

    switch (pattern) {
      case 'trumpet':
        this.scheduleTrumpet(context, master, startAt, duration, rateScale)
        break
      case 'thump':
        this.scheduleThump(context, master, startAt, duration, rateScale)
        break
      case 'water_click':
      case 'gentle_bubble':
        this.scheduleWaterClicks(context, master, startAt, duration, rateScale, pattern === 'gentle_bubble')
        break
      case 'snap':
        this.scheduleSnap(context, master, startAt, duration, rateScale)
        break
      case 'flutter':
        this.scheduleFlutter(context, master, startAt, duration, rateScale)
        break
      case 'swish':
        this.scheduleSwish(context, master, startAt, duration, rateScale)
        break
      case 'tiny_steps':
        this.scheduleTinySteps(context, master, startAt, duration, rateScale)
        break
      case 'creep':
        this.scheduleCreep(context, master, startAt, duration, rateScale)
        break
      case 'clack':
        this.scheduleClack(context, master, startAt, duration, rateScale)
        break
      case 'snuffle':
        this.scheduleSnuffle(context, master, startAt, duration, rateScale)
        break
      case 'blink':
        this.scheduleBlink(context, master, startAt, duration, rateScale)
        break
      case 'yip':
        this.scheduleYip(context, master, startAt, duration, rateScale)
        break
      case 'soft_hum':
      default:
        this.scheduleSoftHum(context, master, startAt, duration, rateScale)
        break
    }

    await waitMs(ANIMAL_SOUND_DURATION_MS)
    if (token === this.sequenceToken) {
      this.stopVirtualNodes()
    }
  }

  private async getPlayableAudio(urls: string[]) {
    for (const url of urls) {
      const audio = this.getOrCreateAudioElement(url)
      if (!audio) {
        continue
      }
      const ok = await this.ensureAudioReady(audio)
      if (ok) {
        return audio
      }
    }
    return null
  }

  private getOrCreateAudioElement(url: string) {
    const cached = this.audioElementCache.get(url)
    if (cached) {
      return cached
    }

    try {
      const audio = new Audio(url)
      audio.preload = 'auto'
      this.audioElementCache.set(url, audio)
      return audio
    } catch {
      return null
    }
  }

  private async ensureAudioReady(audio: HTMLAudioElement) {
    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return true
    }

    try {
      await audio.load()
    } catch {
      // Some browsers throw on load(); rely on events below.
    }

    return await new Promise<boolean>((resolve) => {
      const cleanup = () => {
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
      }

      const onCanPlay = () => {
        cleanup()
        resolve(true)
      }
      const onError = () => {
        cleanup()
        resolve(false)
      }

      audio.addEventListener('canplay', onCanPlay, { once: true })
      audio.addEventListener('error', onError, { once: true })
      window.setTimeout(() => {
        cleanup()
        resolve(audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
      }, 2500)
    })
  }

  private async preloadPrimarySources() {
    const importantUrls = Array.from(
      new Set([
        SOUND_URLS.dogBark,
        SOUND_URLS.catMeow,
        SOUND_URLS.lionRoar,
        SOUND_URLS.cowMoo,
        SOUND_URLS.sheepBaa,
        SOUND_URLS.goatBaa,
        SOUND_URLS.horseNeigh,
      ]),
    )
    await Promise.allSettled(
      importantUrls.map(async (url) => {
        const audio = this.getOrCreateAudioElement(url)
        if (!audio) {
          return
        }
        await this.ensureAudioReady(audio)
      }),
    )
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new window.AudioContext()
    }
    return this.audioContext
  }

  private stopAllPlayback() {
    this.stopActiveElement()
    this.stopVirtualNodes()
    this.speechSynthesis?.cancel()
  }

  private stopActiveElement() {
    if (!this.activeElement) {
      return
    }
    try {
      this.activeElement.pause()
      this.activeElement.currentTime = 0
      this.activeElement.loop = false
    } catch {
      // Ignore media state errors.
    } finally {
      this.activeElement = null
    }
  }

  private stopVirtualNodes() {
    for (const node of this.activeVirtualNodes) {
      try {
        node.disconnect()
      } catch {
        // Ignore disconnect errors.
      }
    }
    this.activeVirtualNodes = []
  }

  private scheduleSoftHum(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const osc = context.createOscillator()
    const gain = context.createGain()
    const end = start + duration
    osc.type = 'sine'
    osc.frequency.setValueAtTime(240 * rate, start)
    osc.frequency.exponentialRampToValueAtTime(190 * rate, start + duration * 0.5)
    osc.frequency.exponentialRampToValueAtTime(220 * rate, end)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.35)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    osc.connect(gain)
    gain.connect(output)
    osc.start(start)
    osc.stop(end)
    this.activeVirtualNodes.push(osc, gain)
  }

  private scheduleTrumpet(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 1.1 / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(170 * rate, t)
      osc.frequency.linearRampToValueAtTime(290 * rate, t + 0.18)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.24, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.58)
      this.activeVirtualNodes.push(osc, gain)
    }
  }

  private scheduleThump(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.72 / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(120 * rate, t)
      osc.frequency.exponentialRampToValueAtTime(60 * rate, t + 0.25)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.35)
      this.activeVirtualNodes.push(osc, gain)
    }
  }

  private scheduleWaterClicks(
    context: AudioContext,
    output: AudioNode,
    start: number,
    duration: number,
    rate: number,
    gentle: boolean,
  ) {
    const interval = (gentle ? 0.35 : 0.22) / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'sine'
      const base = gentle ? 500 : 850
      osc.frequency.setValueAtTime(base * rate, t)
      osc.frequency.exponentialRampToValueAtTime((gentle ? 200 : 420) * rate, t + 0.09)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(gentle ? 0.09 : 0.12, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.14)
      this.activeVirtualNodes.push(osc, gain)
    }
  }

  private scheduleSnap(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.64 / rate
    for (let t = start; t < start + duration; t += interval) {
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.06), context.sampleRate)
      const channel = buffer.getChannelData(0)
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = (Math.random() * 2 - 1) * Math.exp((-i / channel.length) * 20)
      }
      const source = context.createBufferSource()
      const gain = context.createGain()
      source.buffer = buffer
      gain.gain.value = 0.22
      source.connect(gain)
      gain.connect(output)
      source.start(t)
      source.stop(t + 0.07)
      this.activeVirtualNodes.push(source, gain)
    }
  }

  private scheduleFlutter(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < channel.length; i += 1) {
      const t = i / context.sampleRate
      channel[i] = (Math.random() * 2 - 1) * 0.06 * Math.sin(t * 30 * rate)
    }
    const source = context.createBufferSource()
    source.buffer = buffer
    const filter = context.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 1700 * rate
    const gain = context.createGain()
    gain.gain.value = 0.85
    source.connect(filter)
    filter.connect(gain)
    gain.connect(output)
    source.start(start)
    source.stop(start + duration)
    this.activeVirtualNodes.push(source, filter, gain)
  }

  private scheduleSwish(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < channel.length; i += 1) {
      const progress = i / channel.length
      const sweep = Math.sin(progress * Math.PI * 12 * rate)
      channel[i] = (Math.random() * 2 - 1) * 0.08 * sweep
    }
    const source = context.createBufferSource()
    source.buffer = buffer
    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 420 * rate
    const gain = context.createGain()
    gain.gain.value = 0.85
    source.connect(filter)
    filter.connect(gain)
    gain.connect(output)
    source.start(start)
    source.stop(start + duration)
    this.activeVirtualNodes.push(source, filter, gain)
  }

  private scheduleTinySteps(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.15 / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'square'
      osc.frequency.value = 1000 * rate
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.035, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.06)
      this.activeVirtualNodes.push(osc, gain)
    }
  }

  private scheduleCreep(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < channel.length; i += 1) {
      const t = i / context.sampleRate
      channel[i] = (Math.random() * 2 - 1) * 0.03 * (0.5 + 0.5 * Math.sin(t * 18 * rate))
    }
    const source = context.createBufferSource()
    source.buffer = buffer
    const filter = context.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 1200 * rate
    const gain = context.createGain()
    gain.gain.value = 1
    source.connect(filter)
    filter.connect(gain)
    gain.connect(output)
    source.start(start)
    source.stop(start + duration)
    this.activeVirtualNodes.push(source, filter, gain)
  }

  private scheduleClack(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.42 / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'square'
      osc.frequency.value = 380 * rate
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.14, t + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.12)
      this.activeVirtualNodes.push(osc, gain)
    }
  }

  private scheduleSnuffle(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.62 / rate
    for (let t = start; t < start + duration; t += interval) {
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.35), context.sampleRate)
      const channel = buffer.getChannelData(0)
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = (Math.random() * 2 - 1) * Math.exp((-i / channel.length) * 4)
      }
      const source = context.createBufferSource()
      source.buffer = buffer
      const filter = context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 380 * rate
      const gain = context.createGain()
      gain.gain.value = 0.2
      source.connect(filter)
      filter.connect(gain)
      gain.connect(output)
      source.start(t)
      source.stop(t + 0.36)
      this.activeVirtualNodes.push(source, filter, gain)
    }
  }

  private scheduleBlink(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.75 / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 620 * rate
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.06, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.24)
      this.activeVirtualNodes.push(osc, gain)
    }
  }

  private scheduleYip(context: AudioContext, output: AudioNode, start: number, duration: number, rate: number) {
    const interval = 0.9 / rate
    for (let t = start; t < start + duration; t += interval) {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(420 * rate, t)
      osc.frequency.linearRampToValueAtTime(680 * rate, t + 0.08)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.16, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
      osc.connect(gain)
      gain.connect(output)
      osc.start(t)
      osc.stop(t + 0.26)
      this.activeVirtualNodes.push(osc, gain)
    }
  }
}
