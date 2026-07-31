import { Grid2 } from '@mui/material'
import { ReactElement } from 'react'

export const DetailRow = ({
  label,
  value
}: {
  label: string
  value: string | number | undefined | null
}): ReactElement => {
  return (
    <>
      <Grid2 size={6}>
        <div>{label}</div>
      </Grid2>
      <Grid2 size={6}>
        <div style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>{value}</div>
      </Grid2>
    </>
  )
}
