import { Controller } from 'react-hook-form'
import { FormInputProps } from './form-input-props'
import { TextField } from '@mui/material'

const FormTextField = ({ name, label, control, sx, multiline, rows, disabled }: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={(renderProps) => (
        <TextField
          label={label}
          onChange={renderProps.field.onChange}
          value={renderProps.field.value}
          error={!!renderProps.fieldState.error}
          size="small"
          helperText={renderProps.fieldState.error?.message ?? null}
          sx={sx}
          multiline={multiline}
          rows={rows}
          disabled={disabled}
        />
      )}
    />
  )
}
export default FormTextField
