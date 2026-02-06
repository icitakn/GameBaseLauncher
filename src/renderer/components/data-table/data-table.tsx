import { Box, CircularProgress, Stack, TableCell, TableRow, useTheme } from '@mui/material'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode
} from 'react'
import { TableVirtuoso, TableProps, ContextProp } from 'react-virtuoso'
import * as Tanstack from '@tanstack/react-table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import ColumnFilter from './column-filter'

export interface DataTableProps<T> {
  columns: Tanstack.ColumnDef<T, any>[]
  data: T[]
  onSelectionChange?: (selected: T | null) => void
  loading: boolean
  noHeader?: boolean
}

const TableHeader = <T,>({
  headerGroup
}: {
  headerGroup: Tanstack.HeaderGroup<T>
}): ReactElement => (
  <TableRow
    key={headerGroup.id}
    style={{
      backgroundColor: 'lightgray',
      color: 'black',
      margin: 0
    }}
  >
    {headerGroup.headers.map((header: Tanstack.Header<T, unknown>) => {
      return (
        <TableCell key={header.id} colSpan={header.colSpan}>
          <Stack direction="column">
            <Stack
              sx={{
                justifyContent: 'space-between',
                flexDirection: 'row'
              }}
            >
              <div style={{ flex: 1, fontSize: 'larger' }}>
                {Tanstack.flexRender(header.column.columnDef.header, header.getContext())}
              </div>
              {header.column.getCanFilter() && (
                <FontAwesomeIcon
                  icon={faFilter}
                  style={{
                    marginRight: '2px',
                    fontSize: 'larger',
                    cursor: 'pointer',
                    color: header.column.getIsFiltered() ? 'white' : 'black'
                  }}
                />
              )}

              {header.column.getCanSort() ? (
                header.column.getIsSorted() ? (
                  header.column.getIsSorted() === 'asc' ? (
                    <FontAwesomeIcon
                      icon={faSortDown}
                      style={{ fontSize: 'larger', cursor: 'pointer' }}
                      onClick={header.column.getToggleSortingHandler()}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faSortUp}
                      style={{ fontSize: 'larger', cursor: 'pointer' }}
                      onClick={header.column.getToggleSortingHandler()}
                    />
                  )
                ) : (
                  <FontAwesomeIcon
                    icon={faSort}
                    style={{ fontSize: 'larger', cursor: 'pointer' }}
                    onClick={header.column.getToggleSortingHandler()}
                  />
                )
              ) : null}
            </Stack>
            {header.column.getCanFilter() && (
              <ColumnFilter header={header as Tanstack.Header<unknown, unknown>} />
            )}
          </Stack>
        </TableCell>
      )
    })}
  </TableRow>
)

TableHeader.displayName = 'TableHeader'

export default function DataTable<T>({
  data,
  columns,
  onSelectionChange,
  loading,
  noHeader
}: DataTableProps<T>): ReactElement {
  const [rowSelection, setRowSelection] = useState<Tanstack.RowSelectionState>({})
  const [sorting, setSorting] = useState<Tanstack.SortingState>([])
  const [columnFilters, setColumnFilters] = useState<Tanstack.ColumnFiltersState>([])
  const theme = useTheme()

  const table = Tanstack.useReactTable<T>({
    data,
    columns: columns as Tanstack.ColumnDef<T, unknown>[],
    state: {
      sorting,
      rowSelection,
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: Tanstack.getCoreRowModel(),
    getSortedRowModel: Tanstack.getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: false,
    getFilteredRowModel: Tanstack.getFilteredRowModel()
  })

  const { rows } = table.getRowModel()

  useEffect(() => {
    if (Object.keys(rowSelection).length === 0) {
      onSelectionChange?.(null)
    } else {
      const row = rows.find((r) => {
        return r.id === Object.keys(rowSelection)[0]
      })
      if (row) {
        onSelectionChange?.(row.original)
      }
    }
  }, [rowSelection, rows, onSelectionChange])

  const headerGroups = useMemo(() => table.getHeaderGroups(), [table])

  const fixedHeaderContent = useCallback((): ReactNode => {
    if (noHeader) {
      return null
    }
    return headerGroups.map((headerGroup) => (
      <TableHeader<T> key={headerGroup.id} headerGroup={headerGroup} />
    ))
  }, [headerGroups, noHeader])

  const TableComponent = useMemo(
    () =>
      ({ style, ...props }: TableProps & { style: CSSProperties }) => {
        return (
          <table
            {...props}
            style={{
              ...style,
              width: '100%',
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              borderSpacing: 0
            }}
          />
        )
      },
    []
  ) as ComponentType<TableProps & ContextProp<unknown>>

  const TableRowComponent = useCallback(
    (
      props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>
    ) => {
      // eslint-disable-next-line react/prop-types
      const index = props['data-index'] as number
      const row = rows[index] as Tanstack.Row<T>

      return (
        <TableRow
          {...props}
          sx={[
            row.getIsSelected() && {
              background: theme.palette.secondary.main
            },
            {
              '&:hover': {
                boxShadow: 'inset 0 0 0 10em rgba(0, 0, 0, 0.1)'
              }
            }
          ]}
          onClick={() => row.toggleSelected()}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} style={{ padding: '6px' }}>
              {Tanstack.flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      )
    },
    [rows, theme.palette.secondary.main]
  )

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', height: '100%' }}>
      <TableVirtuoso
        style={{
          height: '100%',
          width: '100%',
          boxSizing: 'border-box'
        }}
        totalCount={rows.length}
        data={rows}
        components={{
          Table: TableComponent,
          TableRow: TableRowComponent
        }}
        fixedHeaderContent={fixedHeaderContent}
      />
    </Box>
  )
}
