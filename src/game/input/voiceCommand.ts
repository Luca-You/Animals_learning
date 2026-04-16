type SpeechRecognitionErrorCode =
  | 'aborted'
  | 'audio-capture'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'network'
  | 'no-speech'
  | 'not-allowed'
  | 'phrases-not-supported'
  | 'service-not-allowed'
  | string

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionResultListLike {
  length: number
  [index: number]: SpeechRecognitionResultLike
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: SpeechRecognitionErrorCode
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives?: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike
type VoiceStatus = 'idle' | 'listening' | 'error' | 'unsupported'
type VoiceStatusHandler = (status: VoiceStatus, message: string) => void
type NextOneHandler = () => boolean | Promise<boolean>

const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | null => {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

const normalizeTranscript = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const compactText = (text: string) => normalizeTranscript(text).replace(/\s+/g, '')

const isNextOneCommand = (transcript: string) => {
  const normalized = normalizeTranscript(transcript)
  if (!normalized) {
    return false
  }

  const compact = compactText(transcript)
  if (
    compact.includes('nextone') ||
    compact.includes('nexton') ||
    compact.includes('nextwon') ||
    compact.includes('next1') ||
    compact.includes('nextanimal')
  ) {
    return true
  }

  return /\bnext\s+(one|on|won|1|animal)\b/.test(normalized) || normalized === 'next'
}

const errorToMessage = (error: SpeechRecognitionErrorCode) => {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return '麦克风权限被拒绝，请在浏览器中允许麦克风。'
    case 'audio-capture':
      return '未检测到可用麦克风。'
    case 'network':
      return '语音识别网络异常，请稍后重试。'
    case 'language-not-supported':
      return '当前浏览器不支持英语语音识别。'
    default:
      return '语音识别暂时不可用，请稍后重试。'
  }
}

export class VoiceCommandController {
  private recognition: SpeechRecognitionLike | null = null
  private shouldRestart = false
  private statusHandler: VoiceStatusHandler | null = null
  private onNextOne: NextOneHandler | null = null
  private lastTriggerAt = 0
  private readonly triggerCooldownMs = 700
  private commandEnabled = true
  private commandInFlight = false

  setStatusHandler(handler: VoiceStatusHandler) {
    this.statusHandler = handler
  }

  setCommandEnabled(enabled: boolean) {
    this.commandEnabled = enabled
    if (!this.recognition) {
      return
    }
    if (enabled) {
      this.emitStatus('listening', '语音控制已开启，说 “Next one” 切换动物。')
    } else {
      this.emitStatus('listening', '语音监听已暂停，等待当前播报完成。')
    }
  }

  async start(onNextOne: NextOneHandler) {
    this.onNextOne = onNextOne
    this.commandEnabled = true

    const recognitionCtor = getSpeechRecognitionCtor()
    if (!recognitionCtor) {
      this.emitStatus('unsupported', '当前浏览器不支持语音识别。')
      return false
    }

    try {
      await this.requestMicrophonePermission()
    } catch (error) {
      const message = error instanceof Error ? error.message : '麦克风权限获取失败。'
      this.emitStatus('error', message)
      return false
    }

    this.stop()

    const recognition = new recognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 5

    recognition.onresult = (event) => {
      if (!this.commandEnabled || this.commandInFlight) {
        return
      }

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        let matched = false

        for (let altIndex = 0; altIndex < result.length; altIndex += 1) {
          const transcript = result[altIndex]?.transcript ?? ''
          if (!isNextOneCommand(transcript)) {
            continue
          }
          matched = true
          break
        }

        if (!matched) {
          continue
        }

        const now = Date.now()
        if (now - this.lastTriggerAt < this.triggerCooldownMs) {
          return
        }

        this.lastTriggerAt = now
        this.commandInFlight = true

        void Promise.resolve(this.onNextOne?.())
          .then((accepted) => {
            if (accepted) {
              this.emitStatus('listening', '已识别语音 “Next one”，已切换下一个动物。')
            }
          })
          .finally(() => {
            window.setTimeout(() => {
              this.commandInFlight = false
            }, this.triggerCooldownMs)
          })

        return
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (this.commandEnabled) {
          this.emitStatus('listening', '语音控制已开启，说 “Next one” 切换动物。')
        }
        return
      }

      this.emitStatus('error', errorToMessage(event.error))
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldRestart = false
      }
    }

    recognition.onend = () => {
      if (!this.shouldRestart || !this.recognition) {
        return
      }

      window.setTimeout(() => {
        if (!this.shouldRestart || !this.recognition) {
          return
        }

        try {
          this.recognition.start()
          if (this.commandEnabled) {
            this.emitStatus('listening', '语音控制已开启，说 “Next one” 切换动物。')
          }
        } catch {
          // Retry on next loop.
        }
      }, 220)
    }

    this.recognition = recognition
    this.shouldRestart = true

    try {
      recognition.start()
      this.emitStatus('listening', '语音控制已开启，说 “Next one” 切换动物。')
      return true
    } catch {
      this.emitStatus('error', '语音识别启动失败，请刷新后重试。')
      return false
    }
  }

  stop() {
    this.shouldRestart = false

    if (this.recognition) {
      this.recognition.onend = null
      this.recognition.onerror = null
      this.recognition.onresult = null
      try {
        this.recognition.stop()
      } catch {
        // Ignore.
      }
      this.recognition = null
    }

    this.emitStatus('idle', '未开启')
  }

  dispose() {
    this.stop()
    this.onNextOne = null
    this.statusHandler = null
  }

  private emitStatus(status: VoiceStatus, message: string) {
    this.statusHandler?.(status, message)
  }

  private async requestMicrophonePermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前浏览器不支持麦克风权限请求。')
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    for (const track of stream.getTracks()) {
      track.stop()
    }
  }
}
