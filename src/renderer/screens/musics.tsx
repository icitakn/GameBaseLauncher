import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import useEntityStore from '../hooks/useEntityStore'
import { MusicForm } from '../components/forms/music-form'
import { MusicDTO } from '@shared/models/form-schemes.model'
import { MusicPanel } from '../components/detail-panels/music-panel/music-panel'
import { t } from 'i18next'

const columnHelper = createColumnHelper<MusicDTO>()
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableColumnFilter: true,
    filterFn: 'includesString',
    cell: (value) => value.getValue()?.toString()
  }),
  columnHelper.accessor('name', { header: 'NAME' })
]

export function Musics() {
  const createNew = (): MusicDTO => {
    return {
      id: undefined,
      name: undefined,
      game: null,
      filename: undefined,
      musician: null,
      fav: undefined,
      adult: undefined
    }
  }

  const data = useEntityStore((state) => state.musicObjects)
  const loadData = useEntityStore((state) => state.loadMusics)

  return (
    <MasterDetail
      columns={columns}
      tableName="Music"
      title={t('translation:menu.musics')}
      EditForm={MusicForm}
      createNew={createNew}
      data={data}
      loadData={loadData}
      DetailsPanel={MusicPanel}
    />
  )
}
