import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { Controller } from 'react-hook-form'
import { FormInputProps } from './form-input-props'
import { IdLabelObject } from '@shared/models/form-schemes.model'

interface FormSelectProps extends FormInputProps {
  options: IdLabelObject[]
}

const FormSelect = ({ name, label, control, sx, options }: FormSelectProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={(renderProps) => (
        <FormControl>
          <InputLabel id={name}>{label}</InputLabel>
          <Select
            onChange={renderProps.field.onChange}
            value={renderProps.field.value}
            sx={sx}
            label={name}
            size="small"
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  )
}
export default FormSelect
