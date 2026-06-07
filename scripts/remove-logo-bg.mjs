import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const logoPath = join(root, 'public', 'ogen-logo.png')
const faviconPath = join(root, 'public', 'favicon.png')

async function removeWhiteBg(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lightness = (max + min) / 2

    if (lightness >= 248) {
      data[i + 3] = 0
    } else if (lightness >= 225) {
      data[i + 3] = Math.round(((248 - lightness) / 23) * 255)
    } else if (lightness >= 200 && max - min < 18) {
      data[i + 3] = Math.round(((225 - lightness) / 25) * 180)
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath)
}

await removeWhiteBg(logoPath, logoPath)
await removeWhiteBg(faviconPath, faviconPath)
console.log('Logo background removed:', logoPath)
