export type Adjust = {
  exposure: number
  contrast: number
  saturation: number
  warmth: number
  hue: number
  fade: number
  vignette: number
}

export type Crop = {
  aspect: string
  zoom: number
  x: number
  y: number
  straighten: number
  turns: number
  flipX: boolean
  flipY: boolean
}

export type Edit = { filter: string; adjust: Adjust; crop: Crop }

export type StageImage = {
  id: string
  name: string
  src?: string
  background?: string
  fill?: string
  scale?: number
}

export const adjustments: { key: keyof Adjust; label: string; min: number; max: number }[] = [
  { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100 },
  { key: 'hue', label: 'Hue', min: -180, max: 180 },
  { key: 'fade', label: 'Fade', min: 0, max: 100 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 100 },
]

export const aspects = [
  { id: 'original', label: 'Original', ratio: 4 / 5 },
  { id: 'square', label: '1:1', ratio: 1 },
  { id: 'portrait', label: '3:4', ratio: 3 / 4 },
  { id: 'story', label: '9:16', ratio: 9 / 16 },
  { id: 'wide', label: '16:9', ratio: 16 / 9 },
]

export const filters: { id: string; label: string; adjust: Partial<Adjust> }[] = [
  { id: 'none', label: 'None', adjust: {} },
  { id: 'vivid', label: 'Vivid', adjust: { saturation: 35, contrast: 15 } },
  { id: 'warm', label: 'Warm', adjust: { warmth: 45, exposure: 5 } },
  { id: 'cool', label: 'Cool', adjust: { warmth: -45, saturation: -10 } },
  { id: 'fade', label: 'Fade', adjust: { fade: 45, contrast: -15 } },
  { id: 'mono', label: 'Mono', adjust: { saturation: -100, contrast: 20 } },
  {
    id: 'noir',
    label: 'Noir',
    adjust: { saturation: -100, contrast: 45, exposure: -15, vignette: 50 },
  },
]

export const defaultEdit: Edit = {
  filter: 'none',
  adjust: { exposure: 0, contrast: 0, saturation: 0, warmth: 0, hue: 0, fade: 0, vignette: 0 },
  crop: {
    aspect: 'original',
    zoom: 1,
    x: 0,
    y: 0,
    straighten: 0,
    turns: 0,
    flipX: false,
    flipY: false,
  },
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function combined(edit: Edit): Adjust {
  const preset = filters.find((f) => f.id === edit.filter)?.adjust ?? {}
  const result = { ...edit.adjust }
  for (const { key, min, max } of adjustments) {
    result[key] = clamp(edit.adjust[key] + (preset[key] ?? 0), min, max)
  }
  return result
}

export function ratioOf(edit: Edit) {
  const ratio = aspects.find((a) => a.id === edit.crop.aspect)?.ratio ?? 4 / 5
  return edit.crop.turns % 2 && edit.crop.aspect === 'original' ? 1 / ratio : ratio
}

export function coverScale(edit: Edit) {
  const r = ratioOf(edit)
  const angle = ((edit.crop.turns * 90 + edit.crop.straighten) * Math.PI) / 180
  const cos = Math.abs(Math.cos(angle))
  const sin = Math.abs(Math.sin(angle))
  return Math.max(cos + sin / r, sin * r + cos)
}

export function panLimit(edit: Edit) {
  return ((edit.crop.zoom * coverScale(edit) - 1) / 2) * 100
}
