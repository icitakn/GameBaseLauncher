import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import { BaseEditForm } from '../components/forms/base-edit-form'
import useEntityStore from '../hooks/useEntityStore'
import { BaseDTO } from '@shared/models/form-schemes.model'
import { t } from 'i18next'

const columnHelper = createColumnHelper<BaseDTO>()
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableColumnFilter: true,
    filterFn: 'includesString',
    cell: (value) => value.getValue()?.toString()
  }),
  columnHelper.accessor('name', { header: 'Name', filterFn: 'includesString' })
]

export function Artists() {
  const createNew = () => {
    return {
      id: undefined,
      name: undefined
    }
  }

  const artistStore = useEntityStore((state) => state.artistObjects)
  const loadArtists = useEntityStore((state) => state.loadArtists)

  return (
    <MasterDetail
      columns={columns}
      tableName="Artist"
      title={t('translation:menu.artists')}
      EditForm={BaseEditForm}
      createNew={createNew}
      data={artistStore}
      loadData={loadArtists}
    />
  )
}
