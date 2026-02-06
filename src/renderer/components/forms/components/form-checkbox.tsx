import { Controller } from 'react-hook-form'
import { FormInputProps } from './form-input-props'
import { Checkbox, FormControl, FormControlLabel } from '@mui/material'

const FormCheckbox = ({ name, label, control, sx }: FormInputProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        return (
          <FormControl>
            <FormControlLabel
              control={<Checkbox sx={sx} checked={value} onChange={onChange} />}
              label={label}
            />
          </FormControl>
        )
      }}
    />
  )
}

export default FormCheckbox
