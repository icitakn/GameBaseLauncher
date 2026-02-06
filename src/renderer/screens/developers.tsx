import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import useEntityStore from '../hooks/useEntityStore'
import { BaseEditForm } from '../components/forms/base-edit-form'
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
  columnHelper.accessor('name', { header: 'NAME' })
]

export function Developers() {
  const createNew = (): BaseDTO => {
    return {
      id: undefined,
      name: undefined
    }
  }

  const data = useEntityStore((state) => state.developerObjects)
  const loadData = useEntityStore((state) => state.loadDevelopers)

  return (
    <MasterDetail
      columns={columns}
      tableName="Developer"
      title={t('translation:menu.developers')}
      EditForm={BaseEditForm}
      createNew={createNew}
      data={data}
      loadData={loadData}
    />
  )
}
