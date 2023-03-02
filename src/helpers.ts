export const colorFormats = ["rgb", "hex", "hsl", "hsv", "hwb", "cmyk"] as const

export type ConversionType = typeof colorFormats[number]
