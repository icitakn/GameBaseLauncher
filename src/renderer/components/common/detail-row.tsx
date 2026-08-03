import { Grid2 } from '@mui/material'
import { ReactElement, ReactNode } from 'react'

type DetailRowProps = {
  label: string
  children: ReactNode
}

export const DetailRow = ({ label, children }: DetailRowProps): ReactElement => {
  return (
    <>
      <Grid2 size={6}>
        <div>{label}</div>
      </Grid2>
      <Grid2 size={6}>
        <div style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>{children}</div>
      </Grid2>
    </>
  )
}
