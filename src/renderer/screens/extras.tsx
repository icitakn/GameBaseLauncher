import { createColumnHelper } from '@tanstack/react-table'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import useEntityStore from '../hooks/useEntityStore'
import { useMemo } from 'react'
import { ExtraDTO } from '@shared/models/form-schemes.model'
import { useTranslation } from 'react-i18next'
import { ColumnOption } from '../components/column-picker/column-picker-dialog'
import { useColumnSelection } from '@renderer/hooks/useColumnSelection'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import { ExtraPanel } from '@renderer/components/detail-panels/extra-panel/extra-panel'
import { ExtraForm } from '@renderer/components/forms/extra-form'

const columnHelper = createColumnHelper<ExtraDTO>()

const buildExtraColumns = (t: (key: string) => string): ColumnOption<ExtraDTO>[] => [
  {
    key: 'id',
    label: t('translation:forms.fields.id'),
    column: columnHelper.accessor('id', {
      header: t('translation:forms.fields.id'),
      size: 80,
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
      enableColumnFilter: true,
      cell: (info) => info.getValue() ?? ''
    })
  },
  {
    key: 'game',
    label: t('translation:extra.game'),
    column: columnHelper.accessor((row) => row.game?.name ?? '', {
      id: 'game',
      header: t('translation:extra.game'),
      size: 150,
      enableColumnFilter: true,
      filterFn: 'includesString',
      cell: (info) => info.getValue()
    })
  }
]

const DEFAULT_COLUMN_KEYS = ['id', 'name', 'game']

export default function Extras() {
  const { t } = useTranslation()

  const { selectedGamebase } = useSelectedGamebase()
  const { getColumnKeys } = useColumnSelection('Extra')

  const availableColumns = useMemo<ColumnOption<ExtraDTO>[]>(
    () => buildExtraColumns(t as (key: string) => string),
    [t]
  )

  const defaultColumns = useMemo(
    () => availableColumns.filter((c) => DEFAULT_COLUMN_KEYS.includes(c.key)).map((c) => c.column),
    [availableColumns]
  )

  const defaultActiveKeys = useMemo(
    () => defaultColumns.map((col) => (col as any).accessorKey ?? (col as any).id ?? ''),
    [defaultColumns]
  )

  const initialColumnKeys = useMemo(() => getColumnKeys(defaultActiveKeys), [selectedGamebase?.id])

  const createNew = (): ExtraDTO => ({
    id: null,
    name: '',
    game: null,
    displayOrder: null,
    type: null,
    path: null,
    data: null,
    fileToRun: null
  })

  const extraStore = useEntityStore((state) => state.extraObjects)
  const loadExtras = useEntityStore((state) => state.loadExtras)

  if (!selectedGamebase) return null

  return (
    <MasterDetail
      key={selectedGamebase.id}
      columns={defaultColumns}
      availableColumns={availableColumns}
      initialColumnKeys={initialColumnKeys}
      tableName="Extra"
      DetailsPanel={ExtraPanel}
      title={t('menu.extras')}
      EditForm={ExtraForm}
      createNew={createNew}
      data={extraStore}
      loadData={loadExtras}
    />
  )
}
