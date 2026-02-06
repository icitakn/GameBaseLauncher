import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import { GamePanel } from '../components/detail-panels/game-panel/game-panel'
import { GameForm } from '../components/forms/game-form'
import useEntityStore from '../hooks/useEntityStore'
import { useMemo } from 'react'
import { GameDTO } from '@shared/models/form-schemes.model'
import { t } from 'i18next'

const columnHelper = createColumnHelper<GameDTO>()

export default function Games() {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        enableColumnFilter: true,
        filterFn: 'includesString',
        cell: (value) => value.getValue()?.toString()
      }),
      columnHelper.accessor('name', {
        header: 'NAME',
        enableColumnFilter: true
      })
    ],
    []
  )

  const createNew = (): GameDTO => {
    return {
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
    }
  }

  const gameStore = useEntityStore((state) => state.gameObjects)
  const loadGames = useEntityStore((state) => state.loadGames)

  return (
    <MasterDetail
      columns={columns}
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
