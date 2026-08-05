import { Grid2 } from '@mui/material'
import { ReactElement, ReactNode } from 'react'

type DetailRowProps = {
  label: string
  children: ReactNode
}

export const DetailRow = ({ label, children }: DetailRowProps): ReactElement => {
  return (
    <>
      <Grid2 size={6} sx={{ minWidth: 0 }}>
        <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{label}</div>
      </Grid2>
      <Grid2 size={6} sx={{ minWidth: 0 }}>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>{children}</div>
      </Grid2>
    </>
  )
}
