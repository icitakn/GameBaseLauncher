import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import { MusicianForm } from '../components/forms/musician-form'
import useEntityStore from '../hooks/useEntityStore'
import { MusicianDTO } from '@shared/models/form-schemes.model'
import { t } from 'i18next'

const columnHelper = createColumnHelper<MusicianDTO>()
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableColumnFilter: true,
    filterFn: 'includesString',
    cell: (value) => value.getValue()?.toString()
  }),
  columnHelper.accessor('name', { header: 'NAME' })
]

export function Musicians() {
  const createNew = (): MusicianDTO => {
    return {
      id: undefined,
      name: '',
      photo: undefined,
      grp: undefined,
      nick: undefined
    }
  }

  const musicianStore = useEntityStore((state) => state.musicianObjects)
  const loadMusicians = useEntityStore((state) => state.loadMusicians)

  return (
    <MasterDetail
      columns={columns}
      tableName="Musician"
      title={t('translation:menu.musicians')}
      EditForm={MusicianForm}
      createNew={createNew}
      data={musicianStore}
      loadData={loadMusicians}
    />
  )
}
