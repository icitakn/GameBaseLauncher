import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import { GamePanel } from '../components/detail-panels/game-panel/game-panel'
import { GameForm } from '../components/forms/game-form'
import useEntityStore from '../hooks/useEntityStore'
import { useMemo } from 'react'
import { GameDTO } from '@shared/models/form-schemes.model'
import { useTranslation } from 'react-i18next'
import { ColumnOption } from '../components/column-picker/column-picker-dialog'

const columnHelper = createColumnHelper<GameDTO>()

/** Hilfsfunktion: gibt den Anzeigenamen eines relationalen Felds zurück */
const nameOf = (val: unknown): string => {
  if (!val) return ''
  return typeof val === 'object' && 'name' in val ? (val as { name: string }).name : String(val)
}

const buildGameColumns = (t: (key: string) => string): ColumnOption<GameDTO>[] => [
  {
    key: 'id',
    label: t('translation:forms.fields.id'),
    column: columnHelper.accessor('id', {
      header: t('translation:forms.fields.id'),
      enableColumnFilter: true,
      filterFn: 'includesString',
      cell: (info) => info.getValue()?.toString()
    })
  },
  {
    key: 'name',
    label: t('translation:forms.fields.name'),
    column: columnHelper.accessor('name', {
      header: t('translation:forms.fields.name'),
      enableColumnFilter: true
    })
  },
  {
    key: 'year',
    label: t('translation:game.year'),
    column: columnHelper.accessor('year', {
      header: t('translation:game.year'),
      enableSorting: true,
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'genre',
    label: t('translation:game.genre'),
    column: columnHelper.accessor('genre', {
      header: t('translation:game.genre'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'publisher',
    label: t('translation:game.publisher'),
    column: columnHelper.accessor('publisher', {
      header: t('translation:game.publisher'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'developer',
    label: t('translation:game.developer'),
    column: columnHelper.accessor('developer', {
      header: t('translation:game.developer'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'programmer',
    label: t('translation:game.programmer'),
    column: columnHelper.accessor('programmer', {
      header: t('translation:game.programmer'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'musician',
    label: t('translation:game.musician'),
    column: columnHelper.accessor('musician', {
      header: t('translation:game.musician'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'artist',
    label: t('translation:game.artist'),
    column: columnHelper.accessor('artist', {
      header: t('translation:game.artist'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'language',
    label: t('translation:game.language'),
    column: columnHelper.accessor('language', {
      header: t('translation:game.language'),
      enableColumnFilter: true,
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'difficulty',
    label: t('translation:game.difficulty'),
    column: columnHelper.accessor('difficulty', {
      header: t('translation:game.difficulty'),
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'rarity',
    label: t('translation:game.rarity'),
    column: columnHelper.accessor('rarity', {
      header: t('translation:game.rarity'),
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'license',
    label: t('translation:game.license'),
    column: columnHelper.accessor('license', {
      header: t('translation:game.license'),
      cell: (info) => nameOf(info.getValue())
    })
  },
  {
    key: 'rating',
    label: t('translation:game.rating'),
    column: columnHelper.accessor('rating', {
      header: t('translation:game.rating'),
      enableSorting: true,
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'reviewRating',
    label: t('translation:game.review_rating'),
    column: columnHelper.accessor('reviewRating', {
      header: t('translation:game.review_rating'),
      enableSorting: true,
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'classic',
    label: t('translation:forms.game.fields.ratings.classic'),
    column: columnHelper.accessor('classic', {
      header: t('translation:forms.game.fields.ratings.classic'),
      cell: (info) => (info.getValue() ? '★' : '')
    })
  },
  {
    key: 'playersFrom',
    label: t('translation:game.player_number_min'),
    column: columnHelper.accessor('playersFrom', {
      header: t('translation:game.player_number_min'),
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'playersTo',
    label: t('translation:game.player_number_max'),
    column: columnHelper.accessor('playersTo', {
      header: t('translation:game.player_number_max'),
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'length',
    label: t('translation:game.game_length'),
    column: columnHelper.accessor('length', {
      header: t('translation:game.game_length'),
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
    label: t('translation:game.favorite'),
    column: columnHelper.accessor('fav', {
      header: t('translation:game.favorite'),
      cell: (info) => (info.getValue() ? '♥' : '')
    })
  },
  {
    key: 'adult',
    label: t('translation:game.adult'),
    column: columnHelper.accessor('adult', {
      header: t('translation:game.adult'),
      cell: (info) => (info.getValue() ? '✓' : '')
    })
  },
  {
    key: 'playable',
    label: t('translation:game.playable'),
    column: columnHelper.accessor('playable', {
      header: t('translation:game.playable'),
      cell: (info) => (info.getValue() ? '✓' : '')
    })
  },
  {
    key: 'original',
    label: t('translation:game.original'),
    column: columnHelper.accessor('original', {
      header: t('translation:game.original'),
      cell: (info) => (info.getValue() ? '✓' : '')
    })
  },
  {
    key: 'filename',
    label: t('translation:game.filename'),
    column: columnHelper.accessor('filename', {
      header: t('translation:game.filename'),
      enableColumnFilter: true
    })
  }
]

/** Standardmäßig angezeigte Spalten beim ersten Start */
const DEFAULT_COLUMN_KEYS = ['id', 'name']

export default function Games() {
  const { t } = useTranslation()

  const availableColumns = useMemo<ColumnOption<GameDTO>[]>(
    () => buildGameColumns(t as (key: string) => string),
    [t]
  )

  const defaultColumns = useMemo(
    () => availableColumns.filter((c) => DEFAULT_COLUMN_KEYS.includes(c.key)).map((c) => c.column),
    [availableColumns]
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
      availableColumns={availableColumns}
      tableName="Game"
      DetailsPanel={GamePanel}
      title={t('menu.games')}
      EditForm={GameForm}
      createNew={createNew}
      data={gameStore}
      loadData={loadGames}
    />
  )
}
