import AdmZip from 'adm-zip'
import { statSync, existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { C64Parser, parse } from '../parser/c64_parser_lib'
import { Settings } from '../../shared/models/settings.model'
import path from 'path'
import { app } from 'electron'

const CONFIG_FILE = 'config.json'

// Funktion zum Ermitteln des Config-Pfads
function getConfigPath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, CONFIG_FILE)
}

export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, path.sep)
}

export function extract(filename: string, extractTo: string) {
  console.log('extracting ', filename, ' to ', extractTo)
  const c = new AdmZip(normalizePath(filename))
  c.extractAllTo(extractTo)
}

export function listFilesInZip(filename: string) {
  const c = new AdmZip(normalizePath(filename))
  const entries = c.getEntries()
  const result: { [key: string]: any } = {}

  for (const entry of entries) {
    result[entry.name] = {
      type: entry.isDirectory ? 'directory' : 'file'
    }
  }

  return result
}

export function listFilesInContainer(filename: string) {
  const normalizedFilename = normalizePath(filename)
  const result: { [key: string]: any } = {}
  const fileBuffer = readFileSync(normalizedFilename)
  const data = new Uint8Array(fileBuffer)
  try {
    const c64Parsed = parse(data, normalizedFilename)
    const files = c64Parsed.files
    for (const entry of files) {
      result[entry.name] = {
        type: 'file',
        size: entry.size
      }
    }
  } catch (error) {
    console.error(error)
  }

  return result
}

export function encodeImageToBase64(filePath: string): string {
  const normalizedFilename = normalizePath(filePath)
  try {
    console.log('loading image ', normalizedFilename)
    const image = readFileSync(normalizedFilename)
    return image.toString('base64')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to read or encode image at path: ${normalizedFilename}. Error: ${error.message}`
      )
    } else {
      throw new Error(
        `Failed to read or encode image at path: ${normalizedFilename}. Unknown error occurred.`
      )
    }
  }
}

const isFile = (fileName: string) => {
  const normalizedFilename = normalizePath(fileName)

  return lstatSync(normalizedFilename).isFile()
}

export function getSimilarFilesInFolder(file: string): string[] {
  const normalizedFilename = normalizePath(file)

  const baseFileName = path.parse(normalizedFilename).name
  const folderPath = path.dirname(normalizedFilename)

  return readdirSync(folderPath)
    .filter((fileName) => fileName.startsWith(baseFileName))
    .filter((fileName) => {
      const suffix = fileName.replace(baseFileName, '')
      return suffix.startsWith('.') || suffix.match('^_[0-9]+')
    })
    .map((fileName) => {
      return path.join(folderPath, fileName)
    })
    .filter(isFile)
}

export function getSettings(): Settings {
  const configPath = getConfigPath()
  if (existsSync(configPath)) {
    const file = readFileSync(configPath, { encoding: 'utf8', flag: 'r' })
    return JSON.parse(file)
  }
  throw new Error('No settings found!')
}

export function getOrCreateSettings(): Settings {
  const configPath = getConfigPath()

  if (existsSync(configPath)) {
    const file = readFileSync(configPath, { encoding: 'utf8', flag: 'r' })
    return JSON.parse(file)
  }

  const settings: Settings = {
    language: 'en',
    gamebases: [],
    stats: {
      gamesPlayed: [],
      musicListenedTo: []
    }
  }

  writeFileSync(configPath, JSON.stringify(settings), {
    encoding: 'utf8',
    flag: 'w'
  })

  return settings
}

export function saveSettings(settings: Settings): void {
  const configPath = getConfigPath()
  writeFileSync(configPath, JSON.stringify(settings), {
    encoding: 'utf8',
    flag: 'w'
  })
}

export async function readDir(dirPath: string) {
  try {
    const entries = (await readdirSync(dirPath, { withFileTypes: true })).filter(
      (item) => !/(^|\/)\.[^/.]/g.test(item.name)
    )
    const result: { [key: string]: any } = {}

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      try {
        const stats = await statSync(fullPath)
        result[entry.name] = {
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats?.size
        }
      } catch (error) {
        /* empty */
      }
    }

    return result
  } catch (err) {
    console.error('Error reading dir:', err)
    return {}
  }
}

export function readC64FromZip(zipPath: string, c64FileName: string) {
  const normalizedFilename = normalizePath(zipPath)

  try {
    const zip = new AdmZip(normalizedFilename)

    const entry = zip.getEntry(c64FileName)
    if (!entry) {
      throw new Error(`File "${c64FileName}" not found in zip archive`)
    }

    const fileBuffer = entry.getData()
    const uint8Data = new Uint8Array(fileBuffer)

    const directory = C64Parser.parse(uint8Data, c64FileName)
    const files = directory.files
    const result: { [key: string]: any } = {}

    files.forEach((entry, index) => {
      result[entry.name] = {
        type: 'file',
        size: entry.size,
        index
      }
    })
    console.log('c64', result)
    return result
  } catch (error) {
    throw new Error(`Error while reading "${c64FileName}" from "${normalizedFilename}": ${error}`)
  }
}
