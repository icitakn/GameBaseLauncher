import { Emulator, GameBase } from '@shared/models/settings.model'
import { Game } from '../entities/game.entity'
import * as child from 'child_process'
import * as fs from 'fs'
import log from 'electron-log'
import path from 'path'
import os from 'os'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const PAL_NTSC = ['PAL', 'Universal', 'NTSC', 'PAL(+NTSC?)']
const CONTROLS = [
  'JoyPort2',
  'JoyPort1',
  'Keyboard',
  'PaddlePort2',
  'PaddlePort1',
  'Mouse',
  'LightPen',
  'KoalaPad',
  'LightGun'
]

export interface GemusContext {
  gamebase: GameBase
  game: Game
  gamepathfile: string // full path + filename of the game being run
  emulatorPath: string // path to emulator executable (without filename)
  kvPairs: Record<string, string> // key=value pairs for this game
}

interface ExecutionState {
  commandLineParams: string // accumulated CLP for the main emulator
  commandLine2Params: string // accumulated CLP for a secondary target
  emulatorExecutable: string // resolved emulator path
}

// ---------------------------------------------------------------------------
// Environment Variable Resolution
// ---------------------------------------------------------------------------

function resolveEnvVars(text: string, ctx: GemusContext): string {
  const gamepathfile = ctx.gamepathfile
  const gamefile = path.basename(gamepathfile)
  const gamepath = path.dirname(gamepathfile)
  const gamefilenoext = path.basename(gamepathfile, path.extname(gamepathfile))
  const emupath = ctx.emulatorPath ?? ''
  const dbpath = ctx.gamebase?.folders?.games ?? ''

  let result = text

  // Standard variables
  const vars: Record<string, string> = {
    '%gamepathfile%': gamepathfile,
    '%gamefile%': gamefile,
    '%gamepath%': gamepath,
    '%gamefilenoext%': gamefilenoext,
    '%emupath%': emupath,
    '%dbpath%': dbpath,
    '%dbdriveletter%': dbpath ? dbpath.charAt(0) : '',
    '%gbgamepath%': ctx.gamebase?.folders?.extractTo ?? os.tmpdir(),
    '%storedmusic%': ctx.gamebase?.folders?.music ?? '',
    '%commandline%': '', // filled in later if needed
    '%crlf%': '\r\n',
    '%crlfx2%': '\r\n\r\n',
    '%tab%': '\t',
    '%numfiles%': '1',
    '%imageindex%': '0',
    '%imagename%': '',
    '%c64imagename%': ''
  }

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(key, value)
  }

  // Key=value pairs: %keyname_value%
  for (const [k, v] of Object.entries(ctx.kvPairs)) {
    result = result.replaceAll(`%${k}_value%`, v)
  }

  return result
}

// ---------------------------------------------------------------------------
// Comparison / Condition Evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluates a GEMUS condition line, e.g.
 *   "GameType CONTAINS(D64||TAP)"
 *   "Control = JoyPort1"
 *   "NumPlayers > 1"
 *   "%gamefile% CONTAINS(*128k*)"
 *   "QUESTION(Do you want NTSC?) = YES"
 *   "Key_memory CONTAINS(512)"
 */
function evaluateCondition(condition: string, ctx: GemusContext): boolean {
  condition = condition.trim()

  // QUESTION(text) = YES|NO  – we auto-answer NO (no GUI in this context)
  const questionMatch = condition.match(/^QUESTION\((.+?)\)\s*=\s*(YES|NO)$/i)
  if (questionMatch) {
    log.info(`[GEMUS] QUESTION: "${questionMatch[1]}" → auto-answering NO`)
    return questionMatch[2].toUpperCase() === 'NO'
  }

  // Resolve the field name or environment variable to a string value
  let fieldValue: string | undefined

  const ext = path.extname(ctx.gamepathfile).replace('.', '').toUpperCase()
  const gamefile = path.basename(ctx.gamepathfile)
  const gamefilenoext = path.basename(ctx.gamepathfile, path.extname(ctx.gamepathfile))

  // Comparison with env vars as the left-hand side: %gamefile% CONTAINS(…)
  const envVarLhs = condition.match(/^(%\w+%)\s+(CONTAINS|EXCLUDES)\((.+?)\)$/i)
  if (envVarLhs) {
    const resolved = resolveEnvVars(envVarLhs[1], ctx)
    return applyContainsOperator(resolved, envVarLhs[2].toUpperCase(), envVarLhs[3])
  }

  // Named field comparisons
  const containsMatch = condition.match(/^(\w+)\s+(CONTAINS|EXCLUDES)\((.+?)\)$/i)
  if (containsMatch) {
    const fieldName = containsMatch[1]
    const operator = containsMatch[2].toUpperCase()
    const pattern = containsMatch[3]

    if (fieldName.toLowerCase().startsWith('key_')) {
      const keyName = fieldName.substring(4).toLowerCase()
      fieldValue = ctx.kvPairs[keyName] ?? ''
    } else {
      switch (fieldName.toLowerCase()) {
        case 'gametype':
          fieldValue = ext
          break
        case 'gamecomment':
          fieldValue = ctx.game.comment ?? ''
          break
        case 'versioncomment':
          fieldValue = ctx.game.vComment ?? ''
          break
        case 'imagename':
          fieldValue = gamefilenoext.toUpperCase()
          break
        case 'numfiles':
          fieldValue = '1'
          break
        default:
          // Try env var resolution
          fieldValue = resolveEnvVars(`%${fieldName}%`, ctx)
      }
    }
    return applyContainsOperator(fieldValue ?? '', operator, pattern)
  }

  // Scalar comparisons: FieldName =|!=|<|> Value
  const scalarMatch = condition.match(/^(\w+)\s*(=|!=|<|>)\s*(.+)$/)
  if (scalarMatch) {
    const fieldName = scalarMatch[1]
    const operator = scalarMatch[2]
    const rhs = scalarMatch[3].trim()

    if (fieldName.toLowerCase().startsWith('key_')) {
      const keyName = fieldName.substring(4).toLowerCase()
      fieldValue = ctx.kvPairs[keyName] ?? ''
    } else {
      switch (fieldName.toLowerCase()) {
        case 'control':
          fieldValue =
            ctx.game.control !== undefined && ctx.game.control !== null
              ? CONTROLS[ctx.game.control]
              : ''
          break
        case 'numplayers':
          fieldValue = String(ctx.game.playersTo ?? 0)
          break
        case 'palntsc':
          fieldValue =
            ctx.game.v_PalNtsc !== undefined && ctx.game.v_PalNtsc !== null
              ? PAL_NTSC[ctx.game.v_PalNtsc]
              : ''
          break
        case 'truedriveemu':
          fieldValue = ctx.game.vTrueDriveEmu ? 'YES' : 'NO'
          break
        case 'gametype':
          fieldValue = ext
          break
        case 'numfiles':
          fieldValue = '1'
          break
        default:
          fieldValue = resolveEnvVars(`%${fieldName}%`, ctx)
          break
      }
    }

    const lhsNum = parseFloat(fieldValue ?? '')
    const rhsNum = parseFloat(rhs)
    const numericCompare = !isNaN(lhsNum) && !isNaN(rhsNum)

    switch (operator) {
      case '=':
        return (fieldValue ?? '').toLowerCase() === rhs.toLowerCase()
      case '!=':
        return (fieldValue ?? '').toLowerCase() !== rhs.toLowerCase()
      case '<':
        return numericCompare ? lhsNum < rhsNum : false
      case '>':
        return numericCompare ? lhsNum > rhsNum : false
    }
  }

  log.warn(`[GEMUS] Cannot evaluate condition: "${condition}"`)
  return false
}

/**
 * Tests CONTAINS / EXCLUDES with wildcard patterns separated by ||.
 * Wildcards: *text* → contains, text* → starts, *text → ends, text → exact, * → non-empty
 */
function applyContainsOperator(value: string, operator: string, patternList: string): boolean {
  const patterns = patternList.split('||')
  const upperValue = value.toUpperCase()

  const matchesAny = patterns.some((raw) => {
    const p = raw.trim()
    if (p === '*') return value.length > 0
    if (p.startsWith('*') && p.endsWith('*')) {
      return upperValue.includes(p.slice(1, -1).toUpperCase())
    }
    if (p.startsWith('*')) return upperValue.endsWith(p.slice(1).toUpperCase())
    if (p.endsWith('*')) return upperValue.startsWith(p.slice(0, -1).toUpperCase())
    return upperValue === p.toUpperCase()
  })

  return operator === 'CONTAINS' ? matchesAny : !matchesAny
}

// ---------------------------------------------------------------------------
// Config file helpers (Set_CFG_Value / Set_INI_Value)
// ---------------------------------------------------------------------------

function setCfgValue(filePath: string, section: string, key: string, value: string): void {
  try {
    let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
    const sectionHeader = `[${section}]`
    const keyValue = `${key}=${value}`

    if (section) {
      const sectionIdx = content.indexOf(sectionHeader)
      if (sectionIdx === -1) {
        content += `\n${sectionHeader}\n${keyValue}\n`
      } else {
        const afterSection = content.indexOf('\n[', sectionIdx + 1)
        const sectionContent =
          afterSection === -1
            ? content.substring(sectionIdx)
            : content.substring(sectionIdx, afterSection)
        const keyRegex = new RegExp(`^${escapeRegex(key)}=.*$`, 'mi')
        let newSection: string
        if (keyRegex.test(sectionContent)) {
          newSection = sectionContent.replace(keyRegex, keyValue)
        } else {
          newSection = sectionContent.trimEnd() + '\n' + keyValue + '\n'
        }
        content =
          afterSection === -1
            ? content.substring(0, sectionIdx) + newSection
            : content.substring(0, sectionIdx) + newSection + content.substring(afterSection)
      }
    } else {
      const keyRegex = new RegExp(`^${escapeRegex(key)}=.*$`, 'mi')
      if (keyRegex.test(content)) {
        content = content.replace(keyRegex, keyValue)
      } else {
        content = keyValue + '\n' + content
      }
    }

    fs.writeFileSync(filePath, content, 'utf-8')
  } catch (e) {
    log.error(`[GEMUS] Set_CFG_Value failed for "${filePath}": ${e}`)
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------------
// Script Parser / Executor
// ---------------------------------------------------------------------------

/**
 * Tokenise a function call like:
 *   Add_CLP(-autorun %gamepathfile%)
 * into { name: 'Add_CLP', args: ['-autorun %gamepathfile%'] }
 */
function parseFunctionCall(line: string): { name: string; args: string[] } | null {
  const match = line.match(/^(\w+)\(([^)]*)\)$/)
  if (!match) return null
  const name = match[1]
  const rawArgs = match[2].trim()
  const args = rawArgs.length > 0 ? [rawArgs] : []
  return { name, args }
}

export type GemusScriptResult = {
  emulatorExecutable: string
  commandLineParams: string
  shouldRun: boolean
  exitMessage?: string
}

/**
 * Parses and executes a GEMUS script string.
 * Returns the resolved emulator command and parameters.
 */
export function executeGemusScript(
  scriptContent: string,
  ctx: GemusContext,
  emulator?: string
): GemusScriptResult {
  const lines = scriptContent.split(/\r?\n/)
  const state: ExecutionState = {
    commandLineParams: '',
    commandLine2Params: '',
    emulatorExecutable: emulator ?? ''
  }

  const result: GemusScriptResult = {
    emulatorExecutable: emulator ?? '',
    commandLineParams: '',
    shouldRun: true
  }

  let i = 0

  /**
   * Processes an If block starting AFTER the "If condition" line.
   * `firstBranchActive` = whether the If branch was true.
   */
  function processIfBlock(lines: string[], startIdx: number, firstBranchActive: boolean): number {
    let idx = startIdx
    let activeBranchFound = firstBranchActive

    idx = executeOrSkipUntilElseOrEndIf(lines, idx, firstBranchActive)

    while (idx < lines.length) {
      const raw = lines[idx].trim()
      const upper = raw.toUpperCase()
      idx++

      if (!raw || raw.startsWith(';')) continue

      if (upper === 'END IF' || upper === 'ENDIF') return idx

      if (upper.startsWith('ELSEIF ')) {
        const condition = raw.substring(7).trim()
        const condResult = !activeBranchFound && evaluateCondition(condition, ctx)
        if (condResult) activeBranchFound = true
        idx = executeOrSkipUntilElseOrEndIf(lines, idx, condResult)
        continue
      }

      if (upper === 'ELSE') {
        const runElse = !activeBranchFound
        idx = executeOrSkipUntilElseOrEndIf(lines, idx, runElse)
        continue
      }
    }
    return idx
  }

  /** Execute or skip lines until we hit ElseIf / Else / End If */
  function executeOrSkipUntilElseOrEndIf(
    lines: string[],
    startIdx: number,
    execute: boolean
  ): number {
    let idx = startIdx
    while (idx < lines.length) {
      const raw = lines[idx].trim()
      const upper = raw.toUpperCase()

      if (!raw || raw.startsWith(';')) {
        idx++
        continue
      }

      if (upper === 'END IF' || upper === 'ENDIF') return idx // don't consume
      if (upper === 'ELSE' || upper.startsWith('ELSEIF ')) return idx // don't consume

      idx++

      // Nested If
      if (upper.startsWith('IF ')) {
        if (execute) {
          const condition = raw.substring(3).trim()
          const condResult = evaluateCondition(condition, ctx)
          idx = processIfBlock(lines, idx, condResult)
        } else {
          idx = skipIfBlock(lines, idx)
        }
        continue
      }

      if (execute) {
        executeLine(raw, state, ctx, result)
      }
    }
    return idx
  }

  /** Skip a whole If/ElseIf/Else/End If block without executing */
  function skipIfBlock(lines: string[], startIdx: number): number {
    let depth = 1
    let idx = startIdx
    while (idx < lines.length && depth > 0) {
      const upper = lines[idx].trim().toUpperCase()
      idx++
      if (upper.startsWith('IF ')) depth++
      if (upper === 'END IF' || upper === 'ENDIF') depth--
    }
    return idx
  }

  // Main loop
  while (i < lines.length) {
    const raw = lines[i].trim()
    const upper = raw.toUpperCase()
    i++

    if (!raw || raw.startsWith(';')) continue

    if (upper.startsWith('IF ')) {
      const condition = raw.substring(3).trim()
      const condResult = evaluateCondition(condition, ctx)
      i = processIfBlock(lines, i, condResult)
      continue
    }

    executeLine(raw, state, ctx, result)
  }

  result.emulatorExecutable = state.emulatorExecutable
  result.commandLineParams = state.commandLineParams.trim()
  return result
}

// ---------------------------------------------------------------------------
// Individual function execution
// ---------------------------------------------------------------------------

function executeLine(
  line: string,
  state: ExecutionState,
  ctx: GemusContext,
  result: GemusScriptResult
): void {
  const fn = parseFunctionCall(line)
  if (!fn) {
    log.warn(`[GEMUS] Unrecognised line: "${line}"`)
    return
  }

  const arg = fn.args[0] ? resolveEnvVars(fn.args[0], ctx) : ''

  switch (fn.name.toUpperCase()) {
    case 'ADD_CLP': {
      state.commandLineParams += (state.commandLineParams ? ' ' : '') + arg
      log.info(`[GEMUS] Add_CLP → "${arg}" (CLP so far: "${state.commandLineParams}")`)
      break
    }

    case 'ADD_CLP2': {
      state.commandLine2Params += (state.commandLine2Params ? ' ' : '') + arg
      log.info(`[GEMUS] Add_CLP2 → "${arg}"`)
      break
    }

    case 'CLEAR_CLP': {
      state.commandLineParams = ''
      log.info('[GEMUS] Clear_CLP')
      break
    }

    case 'EDIT_CLP': {
      // EDIT_CLP(oldtext||newtext) - replace in existing CLP
      const parts = fn.args[0]?.split('||') ?? []
      if (parts.length >= 2) {
        const oldText = resolveEnvVars(parts[0], ctx)
        const newText = resolveEnvVars(parts[1], ctx)
        state.commandLineParams = state.commandLineParams.replace(oldText, newText)
        log.info(`[GEMUS] Edit_CLP: "${oldText}" → "${newText}"`)
      }
      break
    }

    case 'RUN_EMULATOR': {
      log.info(`[GEMUS] Run_Emulator() → "${state.emulatorExecutable}" ${state.commandLineParams}`)
      result.shouldRun = true
      result.emulatorExecutable = state.emulatorExecutable
      result.commandLineParams = state.commandLineParams.trim()
      spawnProcess(state.emulatorExecutable, state.commandLineParams)
      break
    }

    case 'RUN_GAMEFILE': {
      log.info(`[GEMUS] Run_GameFile() → "${ctx.gamepathfile}"`)
      spawnProcess(ctx.gamepathfile, '')
      break
    }

    case 'RUN_PROGRAM': {
      // RUN_PROGRAM(executable||params||workingdir||WAIT|NOWAIT)
      const parts = (fn.args[0] ?? '').split('||')
      const exe = resolveEnvVars(parts[0] ?? '', ctx)
      const parms = resolveEnvVars(parts[1] ?? '', ctx)
      const cwd = resolveEnvVars(parts[2] ?? '', ctx)
      const wait = (parts[3] ?? 'WAIT').toUpperCase() !== 'NOWAIT'
      log.info(`[GEMUS] Run_Program: "${exe}" ${parms} (wait=${wait})`)
      spawnProcess(exe, parms, cwd || undefined, wait)
      break
    }

    case 'SHOW_MESSAGE': {
      log.info(`[GEMUS] Show_Message: ${arg}`)
      console.log(`[GEMUS Message] ${arg}`)
      break
    }

    case 'SHOW_KV': {
      const kvStr = Object.entries(ctx.kvPairs)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')
      log.info(`[GEMUS] Show_KV:\n${kvStr}`)
      console.log(`[GEMUS KV Pairs]\n${kvStr}`)
      break
    }

    case 'WAIT': {
      const ms = parseInt(arg, 10) || 0
      log.info(`[GEMUS] Wait(${ms})`)
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
      break
    }

    case 'KILL_PROCESS': {
      log.info(`[GEMUS] Kill_Process(${arg})`)
      try {
        if (os.platform() === 'win32') {
          child.execSync(`taskkill /F /IM "${arg}"`)
        } else {
          child.execSync(`pkill -f "${arg}"`)
        }
      } catch (e) {
        log.warn(`[GEMUS] Kill_Process failed: ${e}`)
      }
      break
    }

    case 'SET_CFG_VALUE':
    case 'SET_CFG_ITEM': {
      // SET_CFG_VALUE(file||section||key||value)
      const parts = (fn.args[0] ?? '').split('||')
      const file = resolveEnvVars(parts[0] ?? '', ctx)
      const sect = resolveEnvVars(parts[1] ?? '', ctx)
      const key = resolveEnvVars(parts[2] ?? '', ctx)
      const val = resolveEnvVars(parts[3] ?? '', ctx)
      log.info(`[GEMUS] Set_CFG_Value: file="${file}" [${sect}] ${key}=${val}`)
      setCfgValue(file, sect, key, val)
      break
    }

    case 'SET_INI_VALUE': {
      // SET_INI_VALUE(file||section||key||value)
      const parts = (fn.args[0] ?? '').split('||')
      const file = resolveEnvVars(parts[0] ?? '', ctx)
      const sect = resolveEnvVars(parts[1] ?? '', ctx)
      const key = resolveEnvVars(parts[2] ?? '', ctx)
      const val = resolveEnvVars(parts[3] ?? '', ctx)
      log.info(`[GEMUS] Set_INI_Value: file="${file}" [${sect}] ${key}=${val}`)
      setCfgValue(file, sect, key, val)
      break
    }

    default:
      log.warn(`[GEMUS] Unknown function: "${fn.name}"`)
  }
}

// ---------------------------------------------------------------------------
// Process spawning helper
// ---------------------------------------------------------------------------

function spawnProcess(executable: string, params: string, cwd?: string, wait = false): void {
  if (!executable) {
    log.error('[GEMUS] spawnProcess: no executable specified')
    return
  }

  // Build the full command string and let the OS shell parse it.
  // This correctly handles quoted arguments (e.g. -autostart "C:\path\file.t64")
  // without us having to re-implement a shell-aware tokeniser.
  const quotedExe = executable.includes(' ') ? `"${executable}"` : executable
  const fullCommand = params ? `${quotedExe} ${params}` : quotedExe

  log.info(`[GEMUS] Spawning: ${fullCommand}`)

  if (wait) {
    child.execSync(fullCommand, { cwd, stdio: 'ignore' })
  } else {
    child.exec(fullCommand, { cwd })
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Reads a GEMUS script from the given file path.
 * Throws an error if the file cannot be read.
 */
export function loadGemusScript(scriptPath: string): string {
  try {
    return fs.readFileSync(scriptPath, 'utf-8')
  } catch (e) {
    const msg = `[GEMUS] Could not read script file "${scriptPath}": ${e}`
    log.error(msg)
    throw new Error(msg)
  }
}

/**
 * Parse key=value pairs stored on a game.
 * Multiple pairs separated by newlines or semicolons.
 */
export function parseKvPairs(raw: string | undefined): Record<string, string> {
  if (!raw) return {}
  const result: Record<string, string> = {}
  for (const line of raw.split(/[\r\n;]+/)) {
    const eqIdx = line.indexOf('=')
    if (eqIdx < 1) continue
    const key = line.substring(0, eqIdx).trim().toLowerCase()
    const val = line.substring(eqIdx + 1).trim()
    if (key) result[key] = val
  }
  return result
}
