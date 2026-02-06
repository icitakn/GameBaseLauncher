import { SimplePaletteColorOptions } from '@mui/material'

declare module '@mui/material/styles' {
  interface PaletteOptions {
    content?: Partial<SimplePaletteColorOptions>
  }

  interface Palette {
    content?: Partial<SimplePaletteColorOptions>
  }
}
