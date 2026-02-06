// C64 Format Parser Library - Functional Approach
// Supports .prg, .t64, .d64, .d71, .d81, .g64, .crt, .p00, .tap formats

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type C64FileType = 'PRG' | 'SEQ' | 'USR' | 'REL' | 'DEL' | 'CBM' | 'DIR'
export type C64DiskFormat = 'PRG' | 'T64' | 'D64' | 'D71' | 'D81' | 'G64' | 'CRT' | 'P00' | 'TAP'

export interface C64File {
  name: string
  type: C64FileType
  size: number
  loadAddress?: number
  data: Uint8Array
  blocks?: number
  startAddress?: number
  endAddress?: number
}

export interface C64Directory {
  diskName?: string
  diskId?: string
  format: C64DiskFormat
  files: C64File[]
  freeBlocks?: number
  totalBlocks?: number
  sides?: number
  tracks?: number
  version?: string
}

export interface CartridgeInfo {
  name: string
  type: number
  exrom: boolean
  game: boolean
  chips: CartridgeChip[]
}

export interface CartridgeChip {
  type: 'ROM' | 'RAM' | 'FLASH'
  bank: number
  startAddress: number
  size: number
  data: Uint8Array
}

export interface TapeInfo {
  version: number
  platform: string
  videoStandard: 'PAL' | 'NTSC'
  dataLength: number
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class C64FormatError extends Error {
  constructor(
    message: string,
    public format?: string,
    public offset?: number
  ) {
    super(message)
    this.name = 'C64FormatError'
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert PETSCII to ASCII
 */
export const petsciiToAscii = (data: Uint8Array, offset: number, length: number): string => {
  let result = ''
  for (let i = 0; i < length && offset + i < data.length; i++) {
    const byte = data[offset + i]
    if (byte === 0) break

    if (byte >= 32 && byte <= 126) {
      result += String.fromCharCode(byte)
    } else if (byte >= 193 && byte <= 218) {
      result += String.fromCharCode(byte - 96)
    } else if (byte === 160) {
      result += ' ' // Shifted space
    } else {
      result += byte < 32 ? '' : '?'
    }
  }
  return result.trim()
}

/**
 * Read little-endian 16-bit value
 */
export const readWord = (data: Uint8Array, offset: number): number => {
  return data[offset] | (data[offset + 1] << 8)
}

/**
 * Read little-endian 32-bit value
 */
export const readDWord = (data: Uint8Array, offset: number): number => {
  return (
    data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)
  )
}

/**
 * Format load address as hex string
 */
export const formatLoadAddress = (address: number): string => {
  return `$${address.toString(16).toUpperCase().padStart(4, '0')}`
}

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${Math.round((bytes / 1024) * 10) / 10} KB`
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`
}

/**
 * Get file type from type byte
 */
export const getFileType = (typeByte: number): C64FileType => {
  const type = typeByte & 0x0f
  switch (type) {
    case 0:
      return 'DEL'
    case 1:
      return 'SEQ'
    case 2:
      return 'PRG'
    case 3:
      return 'USR'
    case 4:
      return 'REL'
    case 5:
      return 'CBM'
    case 6:
      return 'DIR'
    default:
      return 'PRG'
  }
}

// ============================================================================
// FORMAT DETECTION
// ============================================================================

/**
 * Detect format from file extension or content
 */
export const detectFormat = (data: Uint8Array, filename?: string): C64DiskFormat => {
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'prg':
        return 'PRG'
      case 't64':
        return 'T64'
      case 'd64':
        return 'D64'
      case 'd71':
        return 'D71'
      case 'd81':
        return 'D81'
      case 'g64':
        return 'G64'
      case 'crt':
        return 'CRT'
      case 'tap':
        return 'TAP'
    }

    // P00-P99 format
    if (ext && /^p[0-9]{2}$/.test(ext)) {
      return 'P00'
    }
  }

  // Content-based detection
  if (data.length >= 32) {
    // T64 signature
    const headerStr = Array.from(data.slice(0, 32))
      .map((b) => String.fromCharCode(b))
      .join('')
    if (headerStr.includes('C64 tape image file') || headerStr.includes('C64S tape file')) {
      return 'T64'
    }

    // CRT signature
    if (headerStr.startsWith('C64 CARTRIDGE   ')) {
      return 'CRT'
    }

    // TAP signature
    if (headerStr.startsWith('C64-TAPE-RAW')) {
      return 'TAP'
    }
  }

  // Size-based detection for disk images
  switch (data.length) {
    case 174848:
      return 'D64' // Standard D64
    case 175531:
      return 'D64' // D64 with error info
    case 349696:
      return 'D71' // Standard D71
    case 351062:
      return 'D71' // D71 with error info
    case 819200:
      return 'D81' // Standard D81
    case 822400:
      return 'D81' // D81 with error info
  }

  // G64 detection (variable size, but has specific header)
  if (data.length > 12 && data[0] === 0x47 && data[1] === 0x43 && data[2] === 0x52) {
    return 'G64'
  }

  // P00 format detection
  if (data.length > 26 && data[0] === 0x43 && data[1] === 0x36 && data[2] === 0x34) {
    return 'P00'
  }

  // Default to PRG
  return 'PRG'
}

// ============================================================================
// INDIVIDUAL FORMAT PARSERS
// ============================================================================

/**
 * Parse PRG format
 */
export const parsePRG = (data: Uint8Array, filename?: string): C64Directory => {
  if (data.length < 2) {
    throw new C64FormatError('PRG file too small', 'PRG')
  }

  const loadAddress = readWord(data, 0)
  const programData = data.slice(2)

  const file: C64File = {
    name: filename ? filename.replace(/\.[^/.]+$/, '').toUpperCase() : 'PROGRAM',
    type: 'PRG',
    size: programData.length,
    loadAddress,
    data: programData
  }

  return {
    format: 'PRG',
    files: [file]
  }
}

/**
 * Parse T64 format
 */
export const parseT64 = (data: Uint8Array): C64Directory => {
  if (data.length < 64) {
    throw new C64FormatError('T64 file too small', 'T64')
  }

  // const signature = petsciiToAscii(data, 0, 32)
  const version = readWord(data, 32)
  // const maxEntries = readWord(data, 34)
  const usedEntries = readWord(data, 36)
  const tapeName = petsciiToAscii(data, 40, 24)

  const files: C64File[] = []
  let offset = 64

  for (let i = 0; i < usedEntries && offset + 32 <= data.length; i++) {
    const entryType = data[offset]

    if (entryType === 1) {
      // const fileType = data[offset + 1]
      const startAddress = readWord(data, offset + 2)
      const endAddress = readWord(data, offset + 4)
      const fileOffset = readDWord(data, offset + 8)
      const fileName = petsciiToAscii(data, offset + 16, 16)

      if (fileOffset > 0 && fileOffset < data.length) {
        const fileSize = endAddress - startAddress
        if (fileOffset + fileSize <= data.length) {
          const fileData = data.slice(fileOffset, fileOffset + fileSize)

          files.push({
            name: fileName || `FILE_${i}`,
            type: 'PRG',
            size: fileSize,
            loadAddress: startAddress,
            startAddress,
            endAddress,
            data: fileData
          })
        }
      }
    }

    offset += 32
  }

  return {
    diskName: tapeName,
    format: 'T64',
    files,
    version: version.toString()
  }
}

/**
 * Parse D64 format
 */
export const parseD64 = (data: Uint8Array): C64Directory => {
  if (data.length < 174848) {
    throw new C64FormatError('D64 file too small', 'D64')
  }

  const headerSector = readSector(data, 18, 0, 'D64')
  const diskName = petsciiToAscii(headerSector, 144, 16)
  const diskId = petsciiToAscii(headerSector, 162, 2)

  // Calculate free blocks from BAM
  let freeBlocks = 0
  for (let track = 1; track <= 35; track++) {
    if (track !== 18) {
      const bamOffset = (track - 1) * 4
      if (bamOffset < headerSector.length) {
        freeBlocks += headerSector[bamOffset]
      }
    }
  }

  const files = readDirectoryChain(data, 18, 1, 'D64')

  return {
    diskName,
    diskId,
    format: 'D64',
    files,
    freeBlocks,
    totalBlocks: 664,
    tracks: 35
  }
}

/**
 * Parse D71 format (double-sided D64)
 */
export const parseD71 = (data: Uint8Array): C64Directory => {
  if (data.length < 349696) {
    throw new C64FormatError('D71 file too small', 'D71')
  }

  const headerSector = readSector(data, 18, 0, 'D71')
  const diskName = petsciiToAscii(headerSector, 144, 16)
  const diskId = petsciiToAscii(headerSector, 162, 2)

  // D71 has directory on both sides
  const files1 = readDirectoryChain(data, 18, 1, 'D71')
  const files2 = readDirectoryChain(data, 53, 0, 'D71') // Second side directory

  return {
    diskName,
    diskId,
    format: 'D71',
    files: [...files1, ...files2],
    totalBlocks: 1328,
    tracks: 70,
    sides: 2
  }
}

/**
 * Parse D81 format (3.5" disk)
 */
export const parseD81 = (data: Uint8Array): C64Directory => {
  if (data.length < 819200) {
    throw new C64FormatError('D81 file too small', 'D81')
  }

  // D81 has different layout - directory track is 40
  const headerSector = readSectorD81(data, 40, 0)
  const diskName = petsciiToAscii(headerSector, 4, 16)
  const diskId = petsciiToAscii(headerSector, 22, 2)

  const files = readDirectoryChainD81(data, 40, 1)

  return {
    diskName,
    diskId,
    format: 'D81',
    files,
    totalBlocks: 3200,
    tracks: 80
  }
}

/**
 * Parse CRT format (cartridge)
 */
export const parseCRT = (data: Uint8Array): C64Directory => {
  if (data.length < 64) {
    throw new C64FormatError('CRT file too small', 'CRT')
  }

  const signature = Array.from(data.slice(0, 16))
    .map((b) => String.fromCharCode(b))
    .join('')
  if (!signature.startsWith('C64 CARTRIDGE   ')) {
    throw new C64FormatError('Invalid CRT signature', 'CRT')
  }

  const headerLength = readDWord(data, 16)
  const version = readWord(data, 20)
  // const cartridgeType = readWord(data, 22)
  // const exrom = data[24] === 1
  // const game = data[25] === 1
  const cartridgeName = petsciiToAscii(data, 32, 32)

  const chips: CartridgeChip[] = []
  let offset = headerLength

  while (offset < data.length) {
    if (offset + 16 > data.length) break

    const chipSignature = Array.from(data.slice(offset, offset + 4))
      .map((b) => String.fromCharCode(b))
      .join('')
    if (chipSignature !== 'CHIP') break

    const chipLength = readDWord(data, offset + 4)
    // const chipType = readWord(data, offset + 8)
    const bank = readWord(data, offset + 10)
    const startAddress = readWord(data, offset + 12)
    const imageSize = readWord(data, offset + 14)

    const chipData = data.slice(offset + 16, offset + 16 + imageSize)

    chips.push({
      type: 'ROM',
      bank,
      startAddress,
      size: imageSize,
      data: chipData
    })

    offset += chipLength
  }

  // Convert to file representation
  const files: C64File[] = chips.map((chip, index) => ({
    name: `CHIP_${index}_BANK_${chip.bank}`,
    type: 'PRG',
    size: chip.size,
    loadAddress: chip.startAddress,
    data: chip.data
  }))

  return {
    diskName: cartridgeName,
    format: 'CRT',
    files,
    version: version.toString()
  }
}

/**
 * Parse P00 format (PC64 emulator format)
 */
export const parseP00 = (data: Uint8Array, filename?: string): C64Directory => {
  if (data.length < 26) {
    throw new C64FormatError('P00 file too small', 'P00')
  }

  const signature = Array.from(data.slice(0, 7))
    .map((b) => String.fromCharCode(b))
    .join('')
  if (signature !== 'C64File') {
    throw new C64FormatError('Invalid P00 signature', 'P00')
  }

  const dosName = petsciiToAscii(data, 8, 17)
  // const relativeRecordSize = data[25]
  const programData = data.slice(26)

  const loadAddress = programData.length >= 2 ? readWord(programData, 0) : 0

  const file: C64File = {
    name: dosName || (filename ? filename.replace(/\.[^/.]+$/, '').toUpperCase() : 'PROGRAM'),
    type: 'PRG',
    size: programData.length - 2,
    loadAddress,
    data: programData.slice(2)
  }

  return {
    format: 'P00',
    files: [file]
  }
}

/**
 * Parse TAP format (tape raw data)
 */
export const parseTAP = (data: Uint8Array): C64Directory => {
  if (data.length < 20) {
    throw new C64FormatError('TAP file too small', 'TAP')
  }

  const signature = Array.from(data.slice(0, 12))
    .map((b) => String.fromCharCode(b))
    .join('')
  if (!signature.startsWith('C64-TAPE-RAW')) {
    throw new C64FormatError('Invalid TAP signature', 'TAP')
  }

  const version = data[12]
  const platform = data[13] === 0 ? 'C64' : 'VIC20'
  // const videoStandard = data[14] === 0 ? 'PAL' : 'NTSC'
  const dataLength = readDWord(data, 16)

  // TAP files contain raw pulse data, not file structure
  // We create a single "file" representing the entire tape
  const file: C64File = {
    name: 'TAPE_DATA',
    type: 'SEQ',
    size: dataLength,
    data: data.slice(20, 20 + dataLength)
  }

  return {
    diskName: `${platform} TAPE`,
    format: 'TAP',
    files: [file],
    version: version.toString()
  }
}

// ============================================================================
// DISK READING UTILITIES
// ============================================================================

/**
 * Read sector from D64/D71
 */
const readSector = (
  data: Uint8Array,
  track: number,
  sector: number,
  format: 'D64' | 'D71'
): Uint8Array => {
  let offset = 0
  const maxTrack = format === 'D71' ? 70 : 35

  if (track > maxTrack) {
    throw new C64FormatError(`Track ${track} out of range for ${format}`)
  }

  // Calculate offset for D64/D71
  for (let t = 1; t < track; t++) {
    if (t <= 17) offset += 21 * 256
    else if (t <= 24) offset += 19 * 256
    else if (t <= 30) offset += 18 * 256
    else if (t <= 35) offset += 17 * 256
    else if (format === 'D71') {
      // Second side of D71 (tracks 36-70)
      if (t <= 52) offset += 21 * 256
      else if (t <= 59) offset += 19 * 256
      else if (t <= 65) offset += 18 * 256
      else offset += 17 * 256
    }
  }

  offset += sector * 256

  if (offset + 256 > data.length) {
    throw new C64FormatError(`Sector ${track}/${sector} out of bounds`)
  }

  return data.slice(offset, offset + 256)
}

/**
 * Read sector from D81
 */
const readSectorD81 = (data: Uint8Array, track: number, sector: number): Uint8Array => {
  if (track > 80 || sector >= 40) {
    throw new C64FormatError(`Invalid D81 sector ${track}/${sector}`)
  }

  const offset = ((track - 1) * 40 + sector) * 256

  if (offset + 256 > data.length) {
    throw new C64FormatError(`D81 sector ${track}/${sector} out of bounds`)
  }

  return data.slice(offset, offset + 256)
}

/**
 * Read directory chain for D64/D71
 */
const readDirectoryChain = (
  data: Uint8Array,
  startTrack: number,
  startSector: number,
  format: 'D64' | 'D71'
): C64File[] => {
  const files: C64File[] = []
  let track = startTrack
  let sector = startSector

  while (track !== 0) {
    const dirData = readSector(data, track, sector, format)
    track = dirData[0]
    sector = dirData[1]

    for (let i = 0; i < 8; i++) {
      const entryOffset = 2 + i * 32
      const fileType = dirData[entryOffset]

      if (fileType !== 0) {
        const fileName = petsciiToAscii(dirData, entryOffset + 3, 16)
        const fileTrack = dirData[entryOffset + 1]
        const fileSector = dirData[entryOffset + 2]
        const fileBlocks = readWord(dirData, entryOffset + 30)

        if (fileTrack !== 0) {
          try {
            const fileData = readFileChain(data, fileTrack, fileSector, format)

            files.push({
              name: fileName,
              type: getFileType(fileType),
              size: fileData.length,
              blocks: fileBlocks,
              data: fileData
            })
          } catch (error) {
            console.warn(`Skipping corrupted file: ${fileName}`)
          }
        }
      }
    }
  }

  return files
}

/**
 * Read directory chain for D81
 */
const readDirectoryChainD81 = (
  data: Uint8Array,
  startTrack: number,
  startSector: number
): C64File[] => {
  const files: C64File[] = []
  let track = startTrack
  let sector = startSector

  while (track !== 0) {
    const dirData = readSectorD81(data, track, sector)
    track = dirData[0]
    sector = dirData[1]

    for (let i = 0; i < 8; i++) {
      const entryOffset = 2 + i * 32
      const fileType = dirData[entryOffset]

      if (fileType !== 0) {
        const fileName = petsciiToAscii(dirData, entryOffset + 3, 16)
        const fileTrack = dirData[entryOffset + 1]
        const fileSector = dirData[entryOffset + 2]
        const fileBlocks = readWord(dirData, entryOffset + 30)

        if (fileTrack !== 0) {
          try {
            const fileData = readFileChainD81(data, fileTrack, fileSector)

            files.push({
              name: fileName,
              type: getFileType(fileType),
              size: fileData.length,
              blocks: fileBlocks,
              data: fileData
            })
          } catch (error) {
            console.warn(`Skipping corrupted file: ${fileName}`)
          }
        }
      }
    }
  }

  return files
}

/**
 * Read file chain for D64/D71
 */
const readFileChain = (
  data: Uint8Array,
  startTrack: number,
  startSector: number,
  format: 'D64' | 'D71'
): Uint8Array => {
  const fileData: number[] = []
  let track = startTrack
  let sector = startSector

  while (track !== 0) {
    const sectorData = readSector(data, track, sector, format)
    track = sectorData[0]
    sector = sectorData[1]

    if (track === 0) {
      const lastBytes = sector
      fileData.push(...Array.from(sectorData.slice(2, 2 + lastBytes)))
    } else {
      fileData.push(...Array.from(sectorData.slice(2)))
    }
  }

  return new Uint8Array(fileData)
}

/**
 * Read file chain for D81
 */
const readFileChainD81 = (
  data: Uint8Array,
  startTrack: number,
  startSector: number
): Uint8Array => {
  const fileData: number[] = []
  let track = startTrack
  let sector = startSector

  while (track !== 0) {
    const sectorData = readSectorD81(data, track, sector)
    track = sectorData[0]
    sector = sectorData[1]

    if (track === 0) {
      const lastBytes = sector
      fileData.push(...Array.from(sectorData.slice(2, 2 + lastBytes)))
    } else {
      fileData.push(...Array.from(sectorData.slice(2)))
    }
  }

  return new Uint8Array(fileData)
}

// ============================================================================
// MAIN PARSER API
// ============================================================================

/**
 * Main parser function - detects format and delegates to appropriate parser
 */
export const parse = (data: Uint8Array, filename?: string): C64Directory => {
  if (!data || data.length === 0) {
    throw new C64FormatError('Empty or invalid data')
  }

  const format = detectFormat(data, filename)

  switch (format) {
    case 'PRG':
      return parsePRG(data, filename)
    case 'T64':
      return parseT64(data)
    case 'D64':
      return parseD64(data)
    case 'D71':
      return parseD71(data)
    case 'D81':
      return parseD81(data)
    case 'CRT':
      return parseCRT(data)
    case 'P00':
      return parseP00(data, filename)
    case 'TAP':
      return parseTAP(data)
    default:
      throw new C64FormatError(`Unsupported format: ${format}`)
  }
}

// ============================================================================
// EXPORT MAIN API
// ============================================================================

export const C64Parser = {
  parse,
  detectFormat,

  // Individual parsers
  parsePRG,
  parseT64,
  parseD64,
  parseD71,
  parseD81,
  parseCRT,
  parseP00,
  parseTAP,

  // Utilities
  petsciiToAscii,
  formatLoadAddress,
  formatFileSize,
  getFileType,
  readWord,
  readDWord
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Basic usage:
import { C64Parser } from './c64-parser';
import * as fs from 'fs';

const data = new Uint8Array(fs.readFileSync('game.d64'));
const directory = C64Parser.parse(data, 'game.d64');

console.log(`📀 ${directory.diskName} (${directory.format})`);
console.log(`Files: ${directory.files.length}`);

directory.files.forEach(file => {
  console.log(`📄 ${file.name} - ${file.type} - ${C64Parser.formatFileSize(file.size)}`);
  if (file.loadAddress) {
    console.log(`   Load: ${C64Parser.formatLoadAddress(file.loadAddress)}`);
  }
});

// Advanced usage - individual parsers:
const d64Directory = C64Parser.parseD64(d64Data);
const t64Directory = C64Parser.parseT64(t64Data);
const cartridge = C64Parser.parseCRT(crtData);
*/
