import React, { ChangeEvent } from 'react'
import { TextField } from '@mui/material'
import { Header } from '@tanstack/react-table'

const ColumnFilter = React.memo(({ header }: { header: Header<unknown, unknown> }) => {
  const [value, setValue] = React.useState(header.column.getFilterValue() ?? '')

  React.useEffect(() => {
    setValue(header.column.getFilterValue() ?? '')
  }, [header.column])

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e?.target?.value
      setValue(newValue)
      header.column.setFilterValue(newValue || undefined)
    },
    [header.column]
  )

  return (
    <TextField
      variant="standard"
      size="small"
      placeholder="Filter"
      value={value}
      onChange={handleChange}
    />
  )
})

ColumnFilter.displayName = 'ColumnFilter'

export default ColumnFilter
