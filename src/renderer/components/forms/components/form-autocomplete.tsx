import { Autocomplete, createFilterOptions, FormControl, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'
import { FormInputProps } from './form-input-props'
import { useState } from 'react'
import { IdLabelObject } from '@shared/models/form-schemes.model'

interface FormAutocompleteProps extends FormInputProps {
  options: IdLabelObject[]
  optionsLoader: () => Promise<void>
  preselected?: IdLabelObject
}

const filter = createFilterOptions<IdLabelObject>()

const FormAutocomplete = ({
  name,
  label,
  control,
  sx,
  optionsLoader,
  options,
  preselected
}: FormAutocompleteProps) => {
  if (!preselected || !preselected.id) {
    preselected = { id: 0, label: '-' }
  }
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subDialogOpen, toggleSubdialog] = useState(false)
  const [preLoadedOptions, setPreLoadedOptions] = useState([preselected])

  const handleOpen = () => {
    setOpen(true)
    ;(async () => {
      setLoading(true)
      if (!loaded) {
        await optionsLoader()
        setLoaded(true)
      }
      setLoading(false)
    })()
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleCloseSubdialog = () => {
    toggleSubdialog(false)
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, ref, value }, fieldState }) => {
          let mappedValue
          if (typeof value === 'number') {
            mappedValue = loaded ? options.findLast((option) => option.id === value) : preselected
          } else {
            if (value && Object.hasOwn(value, 'id')) {
              mappedValue = loaded
                ? options.findLast((option) => option.id === value.id)
                : preselected
            } else {
              mappedValue = value
            }
          }
          return (
            <FormControl>
              <Autocomplete
                // freeSolo
                open={open}
                onOpen={handleOpen}
                onClose={handleClose}
                options={options}
                onBlur={onBlur}
                onChange={(event, newValue) => {
                  // if (typeof newValue === 'string') {
                  //   // timeout to avoid instant validation of the dialog's form.
                  //   setTimeout(() => {
                  //     toggleSubdialog(true);
                  //     // setDialogValue({
                  //     //   title: newValue,
                  //     //   year: '',
                  //     // });
                  //   });
                  // } else if (newValue && newValue.inputValue) {
                  //   toggleSubdialog(true);
                  //   // setDialogValue({
                  //   //   title: newValue.inputValue,
                  //   //   year: '',
                  //   // });
                  // }
                  onChange(newValue)
                }}
                sx={sx}
                size="small"
                forcePopupIcon={true}
                loading={loading}
                value={mappedValue}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                // filterOptions={(options, params) => {
                //   const filtered = filter(options, params);
                //   if (params.inputValue !== '') {
                //     console.log('params: ', params);
                //     filtered.push({
                //       inputValue: `Add "${params.inputValue}"`,
                //       label: `Add "${params.inputValue}"`,
                //     });
                //   }

                //   return filtered;
                // }}
                getOptionKey={(option) => {
                  // if (typeof option === 'string') {
                  //   return "new";
                  // } else {
                  return option.id
                  // }
                }}
                getOptionLabel={(option) => {
                  // if (typeof option === 'string') {
                  //   return option;
                  // }

                  // if (option.inputValue) {
                  //     return option.inputValue;
                  // }
                  return option.label
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={label}
                    inputRef={ref}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? null}
                  />
                )}
              />
            </FormControl>
          )
        }}
      />
    </>
  )
}
export default FormAutocomplete
