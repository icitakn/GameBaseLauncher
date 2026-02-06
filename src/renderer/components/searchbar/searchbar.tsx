import { Autocomplete, Chip, TextField } from '@mui/material'

export interface SearchbarProps {
  onChangeHandler: (filters: { [name: string]: string[] }) => void
  fieldNames: string[]
}

export function Searchbar({ onChangeHandler, fieldNames }: SearchbarProps) {
  return (
    <Autocomplete
      clearIcon={false}
      options={[]}
      freeSolo
      multiple
      renderTags={(value, props) =>
        value.map((option, index) => <Chip label={option} {...props({ index })} key={index} />)
      }
      onChange={(event: any, newValue: string[]) => {
        const newFilter: { [name: string]: string[] } =
          newValue && newValue.length > 0
            ? {
                [fieldNames[0]]: newValue
                // TODO: other field names than name
              }
            : {}
        onChangeHandler(newFilter)
      }}
      renderInput={(params) => (
        <TextField label="Filter (Type + Enter)" variant="standard" {...params} />
      )}
      sx={{ flex: 1 }}
    />
  )
}
