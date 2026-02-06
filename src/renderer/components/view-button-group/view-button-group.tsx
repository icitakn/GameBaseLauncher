import { faFloppyDisk, faTable } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'

export interface ViewButtonGroupProps {
  onViewOptionChange: (viewOption: string) => void
}

export function ViewButtonGroup({ onViewOptionChange }: ViewButtonGroupProps) {
  const [viewOption, setViewOption] = useState<string | null>('table')

  const handleViewOption = (
    event: React.MouseEvent<HTMLElement>,
    selectedViewOption: string | null
  ) => {
    setViewOption(selectedViewOption)
    onViewOptionChange(selectedViewOption)
  }

  return (
    <ToggleButtonGroup value={viewOption} onChange={handleViewOption} exclusive>
      <ToggleButton value="table">
        <FontAwesomeIcon icon={faTable} />
      </ToggleButton>
      <ToggleButton value="disk">
        <FontAwesomeIcon icon={faFloppyDisk} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
