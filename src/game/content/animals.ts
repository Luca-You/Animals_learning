export type AnimalId = string

export interface AnimalDefinition {
  id: AnimalId
  labelZh: string
  word: string
  soundLabel: string
  textureKey: string
  palette: {
    glow: string
    badge: string
    shadow: string
  }
}

export interface AnimalHeadHitProfile {
  headOffsetX: number
  headOffsetY: number
  headRadius: number
}

const palettePresets = [
  { glow: '#ffe4b8', badge: '#ff9d5c', shadow: '#b86c3b' },
  { glow: '#d8f5c9', badge: '#75b84b', shadow: '#4b7f31' },
  { glow: '#ffeaa6', badge: '#ffbf3d', shadow: '#c48c00' },
  { glow: '#dceeff', badge: '#7bb6e8', shadow: '#4b84b7' },
  { glow: '#f2defd', badge: '#b98be5', shadow: '#7f59b8' },
  { glow: '#ffd9d9', badge: '#f07f7f', shadow: '#b85757' },
] as const

const animalItems: Array<{
  id: string
  word: string
  labelZh: string
  soundLabel: string
}> = [
  { id: 'dog', word: 'dog', labelZh: '狗', soundLabel: 'Woof' },
  { id: 'cat', word: 'cat', labelZh: '猫', soundLabel: 'Meow' },
  { id: 'elephant', word: 'elephant', labelZh: '大象', soundLabel: 'Trumpet' },
  { id: 'lion', word: 'lion', labelZh: '狮子', soundLabel: 'Roar' },
  { id: 'tiger', word: 'tiger', labelZh: '老虎', soundLabel: 'Roar' },
  { id: 'giraffe', word: 'giraffe', labelZh: '长颈鹿', soundLabel: 'Hum' },
  { id: 'monkey', word: 'monkey', labelZh: '猴子', soundLabel: 'Chatter' },
  { id: 'bear', word: 'bear', labelZh: '熊', soundLabel: 'Growl' },
  { id: 'rabbit', word: 'rabbit', labelZh: '兔子', soundLabel: 'Hop' },
  { id: 'kangaroo', word: 'kangaroo', labelZh: '袋鼠', soundLabel: 'Boing' },
  { id: 'dolphin', word: 'dolphin', labelZh: '海豚', soundLabel: 'Click' },
  { id: 'penguin', word: 'penguin', labelZh: '企鹅', soundLabel: 'Honk' },
  { id: 'crocodile', word: 'crocodile', labelZh: '鳄鱼', soundLabel: 'Snap' },
  { id: 'koala', word: 'koala', labelZh: '树袋熊', soundLabel: 'Squeak' },
  { id: 'zebra', word: 'zebra', labelZh: '斑马', soundLabel: 'Neigh' },
  { id: 'gorilla', word: 'gorilla', labelZh: '大猩猩', soundLabel: 'Grunt' },
  { id: 'hippopotamus', word: 'hippopotamus', labelZh: '河马', soundLabel: 'Snort' },
  { id: 'camel', word: 'camel', labelZh: '骆驼', soundLabel: 'Groan' },
  { id: 'polar_bear', word: 'polar bear', labelZh: '北极熊', soundLabel: 'Growl' },
  { id: 'owl', word: 'owl', labelZh: '猫头鹰', soundLabel: 'Hoot' },
  { id: 'snake', word: 'snake', labelZh: '蛇', soundLabel: 'Hiss' },
  { id: 'butterfly', word: 'butterfly', labelZh: '蝴蝶', soundLabel: 'Flutter' },
  { id: 'horse', word: 'horse', labelZh: '马', soundLabel: 'Neigh' },
  { id: 'cow', word: 'cow', labelZh: '牛', soundLabel: 'Moo' },
  { id: 'sheep', word: 'sheep', labelZh: '羊', soundLabel: 'Baa' },
  { id: 'goat', word: 'goat', labelZh: '山羊', soundLabel: 'Maa' },
  { id: 'chicken', word: 'chicken', labelZh: '鸡', soundLabel: 'Cluck' },
  { id: 'duck', word: 'duck', labelZh: '鸭子', soundLabel: 'Quack' },
  { id: 'fish', word: 'fish', labelZh: '鱼', soundLabel: 'Splash' },
  { id: 'whale', word: 'whale', labelZh: '鲸鱼', soundLabel: 'Whale Song' },
  { id: 'shark', word: 'shark', labelZh: '鲨鱼', soundLabel: 'Swish' },
  { id: 'octopus', word: 'octopus', labelZh: '章鱼', soundLabel: 'Blub' },
  { id: 'frog', word: 'frog', labelZh: '青蛙', soundLabel: 'Ribbit' },
  { id: 'bee', word: 'bee', labelZh: '蜜蜂', soundLabel: 'Buzz' },
  { id: 'ant', word: 'ant', labelZh: '蚂蚁', soundLabel: 'Tiny Steps' },
  { id: 'spider', word: 'spider', labelZh: '蜘蛛', soundLabel: 'Creep' },
  { id: 'crab', word: 'crab', labelZh: '螃蟹', soundLabel: 'Clack' },
  { id: 'panda', word: 'panda', labelZh: '熊猫', soundLabel: 'Munch' },
  { id: 'deer', word: 'deer', labelZh: '鹿', soundLabel: 'Rustle' },
  { id: 'wolf', word: 'wolf', labelZh: '狼', soundLabel: 'Howl' },
  { id: 'fox', word: 'fox', labelZh: '狐狸', soundLabel: 'Yip' },
  { id: 'squirrel', word: 'squirrel', labelZh: '松鼠', soundLabel: 'Chirp' },
  { id: 'flamingo', word: 'flamingo', labelZh: '火烈鸟', soundLabel: 'Honk' },
  { id: 'ostrich', word: 'ostrich', labelZh: '鸵鸟', soundLabel: 'Boom' },
  { id: 'bat', word: 'bat', labelZh: '蝙蝠', soundLabel: 'Screech' },
  { id: 'hedgehog', word: 'hedgehog', labelZh: '刺猬', soundLabel: 'Snuffle' },
  { id: 'leopard', word: 'leopard', labelZh: '豹子', soundLabel: 'Roar' },
  { id: 'chameleon', word: 'chameleon', labelZh: '变色龙', soundLabel: 'Blink' },
]

export const ANIMALS: AnimalDefinition[] = animalItems.map((animal, index) => ({
  ...animal,
  textureKey: `animal-${animal.id}`,
  palette: palettePresets[index % palettePresets.length],
}))

export const ANIMAL_BY_ID: Record<AnimalId, AnimalDefinition> = Object.fromEntries(
  ANIMALS.map((animal) => [animal.id, animal]),
)

const mammalHeadAnimals = new Set<AnimalId>([
  'dog',
  'cat',
  'elephant',
  'lion',
  'tiger',
  'monkey',
  'bear',
  'rabbit',
  'kangaroo',
  'koala',
  'zebra',
  'gorilla',
  'hippopotamus',
  'camel',
  'polar_bear',
  'horse',
  'cow',
  'sheep',
  'goat',
  'panda',
  'deer',
  'wolf',
  'fox',
  'squirrel',
  'hedgehog',
  'leopard',
])

const birdHeadAnimals = new Set<AnimalId>(['owl', 'penguin', 'chicken', 'duck', 'flamingo', 'ostrich'])
const fishHeadAnimals = new Set<AnimalId>(['fish', 'dolphin', 'whale', 'shark'])
const longHeadAnimals = new Set<AnimalId>(['snake', 'crocodile', 'chameleon'])
const centerHeadAnimals = new Set<AnimalId>(['frog', 'bee', 'ant', 'spider', 'crab', 'bat', 'octopus', 'butterfly'])

export const getAnimalHeadHitProfile = (animalId: AnimalId): AnimalHeadHitProfile => {
  if (mammalHeadAnimals.has(animalId)) {
    return { headOffsetX: 72, headOffsetY: -44, headRadius: 70 }
  }

  if (birdHeadAnimals.has(animalId)) {
    return { headOffsetX: 0, headOffsetY: -64, headRadius: 66 }
  }

  if (fishHeadAnimals.has(animalId)) {
    return { headOffsetX: -54, headOffsetY: -12, headRadius: 66 }
  }

  if (longHeadAnimals.has(animalId)) {
    return { headOffsetX: 116, headOffsetY: -40, headRadius: 62 }
  }

  if (centerHeadAnimals.has(animalId)) {
    return { headOffsetX: 0, headOffsetY: -52, headRadius: 64 }
  }

  if (animalId === 'giraffe') {
    return { headOffsetX: 76, headOffsetY: -88, headRadius: 58 }
  }

  return { headOffsetX: 64, headOffsetY: -42, headRadius: 66 }
}
