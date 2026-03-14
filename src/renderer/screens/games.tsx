import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import { GamePanel } from '../components/detail-panels/game-panel/game-panel'
import { GameForm } from '../components/forms/game-form'
import useEntityStore from '../hooks/useEntityStore'
import { useMemo } from 'react'
import { GameDTO } from '@shared/models/form-schemes.model'
import { t } from 'i18next'
import { ColumnOption } from '../components/column-picker/column-picker-dialog'

const columnHelper = createColumnHelper<GameDTO>()

/**
 * Alle verfügbaren Spalten für die Games-Tabelle.
 * Einfach neue Einträge hinzufügen oder entfernen.
 * Die Reihenfolge hier bestimmt die Reihenfolge im Picker-Dialog
 * und in der Tabelle.
 */
const ALL_GAME_COLUMNS: ColumnOption<GameDTO>[] = [
  {
    key: 'id',
    label: 'ID',
    column: columnHelper.accessor('id', {
      header: 'ID',
      enableColumnFilter: true,
      filterFn: 'includesString',
      cell: (info) => info.getValue()?.toString()
    })
  },
  {
    key: 'name',
    label: 'Name',
    column: columnHelper.accessor('name', {
      header: 'NAME',
      enableColumnFilter: true
    })
  },
  {
    key: 'year',
    label: 'Jahr',
    column: columnHelper.accessor('year', {
      header: 'JAHR',
      enableSorting: true,
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'genre',
    label: 'Genre',
    column: columnHelper.accessor('genre', {
      header: 'GENRE',
      enableColumnFilter: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        // genre kann ein Objekt mit name-Feld oder ein primitiver Wert sein
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'publisher',
    label: 'Publisher',
    column: columnHelper.accessor('publisher', {
      header: 'PUBLISHER',
      enableColumnFilter: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'developer',
    label: 'Entwickler',
    column: columnHelper.accessor('developer', {
      header: 'ENTWICKLER',
      enableColumnFilter: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'programmer',
    label: 'Programmierer',
    column: columnHelper.accessor('programmer', {
      header: 'PROGRAMMIERER',
      enableColumnFilter: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'musician',
    label: 'Musiker',
    column: columnHelper.accessor('musician', {
      header: 'MUSIKER',
      enableColumnFilter: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'language',
    label: 'Sprache',
    column: columnHelper.accessor('language', {
      header: 'SPRACHE',
      enableColumnFilter: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'difficulty',
    label: 'Schwierigkeit',
    column: columnHelper.accessor('difficulty', {
      header: 'SCHWIERIGKEIT',
      cell: (info) => {
        const val = info.getValue()
        if (!val) return ''
        return typeof val === 'object' && 'name' in val ? (val as any).name : String(val)
      }
    })
  },
  {
    key: 'rating',
    label: 'Bewertung',
    column: columnHelper.accessor('rating', {
      header: 'BEWERTUNG',
      enableSorting: true,
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'classic',
    label: 'Klassiker',
    column: columnHelper.accessor('classic', {
      header: 'KLASSIKER',
      cell: (info) => (info.getValue() ? '★' : '')
    })
  },
  {
    key: 'playersFrom',
    label: 'Spieler (von)',
    column: columnHelper.accessor('playersFrom', {
      header: 'SPIELER VON',
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'playersTo',
    label: 'Spieler (bis)',
    column: columnHelper.accessor('playersTo', {
      header: 'SPIELER BIS',
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'length',
    label: 'Länge',
    column: columnHelper.accessor('length', {
      header: 'LÄNGE',
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'palNtsc',
    label: 'PAL/NTSC',
    column: columnHelper.accessor('palNtsc', {
      header: 'PAL/NTSC',
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'fav',
    label: 'Favorit',
    column: columnHelper.accessor('fav', {
      header: 'FAV',
      cell: (info) => (info.getValue() ? '♥' : '')
    })
  },
  {
    key: 'adult',
    label: 'FSK 18',
    column: columnHelper.accessor('adult', {
      header: 'ADULT',
      cell: (info) => (info.getValue() ? '✓' : '')
    })
  },
  {
    key: 'filename',
    label: 'Dateiname',
    column: columnHelper.accessor('filename', {
      header: 'DATEINAME',
      enableColumnFilter: true
    })
  }
]

/** Standardmäßig angezeigte Spalten beim ersten Start */
const DEFAULT_COLUMN_KEYS = ['id', 'name']

export default function Games() {
  const defaultColumns = useMemo(
    () => ALL_GAME_COLUMNS.filter((c) => DEFAULT_COLUMN_KEYS.includes(c.key)).map((c) => c.column),
    []
  )

  const createNew = (): GameDTO => ({
    id: null,
    name: '',
    year: 0,
    filename: '',
    fileToRun: '',
    filenameIndex: 0,
    scrnshotFilename: '',
    musician: null,
    genre: null,
    publisher: null,
    difficulty: null,
    cracker: null,
    sidFilename: '',
    highscore: '',
    fav: false,
    programmer: null,
    language: null,
    classic: 0,
    rating: 0,
    palNtsc: 0,
    length: 0,
    trainers: 0,
    playersFrom: 0,
    playersTo: 0,
    playersSim: false,
    adult: false,
    memoText: '',
    prequel: null,
    sequel: null,
    related: null,
    control: 0,
    crc: '',
    filesize: 0,
    version: 0,
    gemus: '',
    lengthType: 0,
    comment: '',
    versionComment: '',
    loadingScreen: false,
    highscoreSaver: false,
    includedDocs: false,
    trueDriveEmu: false,
    artist: null,
    developer: null,
    license: null,
    rarity: null,
    weblinkName: '',
    weblinkUrl: '',
    playable: false,
    original: false,
    cloneOf: null,
    reviewRating: 0
  })

  const gameStore = useEntityStore((state) => state.gameObjects)
  const loadGames = useEntityStore((state) => state.loadGames)

  return (
    <MasterDetail
      columns={defaultColumns}
      availableColumns={ALL_GAME_COLUMNS}
      tableName="Game"
      DetailsPanel={GamePanel}
      title={t('translation:menu.games')}
      EditForm={GameForm}
      createNew={createNew}
      data={gameStore}
      loadData={loadGames}
    />
  )
}
