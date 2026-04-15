export type ExtraFileType = 'image' | 'pdf' | 'text' | 'video'

export interface ExtraFileResult {
  type: ExtraFileType
  mimeType: string
  data?: string
  filePath?: string
}
