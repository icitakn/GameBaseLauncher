import {
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  IconButton,
  Button
} from '@mui/material'
import { ExtraFileResult } from '@shared/types/file.types'
import { useEffect, useRef } from 'react'

interface ExtraDialogProps {
  open: boolean
  loading: boolean
  file: ExtraFileResult | null
  onClose: () => void
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  return new Blob([byteArray], { type: mimeType })
}

function VideoPlayer({ filePath, mimeType }: { filePath: string; mimeType: string }) {
  const normalizedPath = filePath.replace(/\\/g, '/')
  const videoSrc = `localfile://${normalizedPath}`

  return (
    <video key={videoSrc} controls style={{ maxWidth: '100%' }} src={videoSrc}>
      Error
    </video>
  )
}

export function ExtraDialog({ open, loading, file, onClose }: ExtraDialogProps) {
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [open])

  const renderContent = () => {
    if (loading) return <CircularProgress />
    if (!file) return null

    switch (file.type) {
      case 'image':
        return (
          <img
            src={`data:${file.mimeType};base64,${file.data}`}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        )
      case 'pdf': {
        const pdfBlob = base64ToBlob(file.data!, 'application/pdf')
        objectUrlRef.current = URL.createObjectURL(pdfBlob)

        return (
          <iframe
            src={objectUrlRef.current}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        )
      }
      case 'text':
        return (
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '70vh', overflowY: 'auto' }}>
            {file.data}
          </pre>
        )
      case 'video': {
        return <VideoPlayer filePath={file.filePath!} mimeType={file.mimeType} />
      }
    }
  }

  if (file?.mimeType === 'video/avi') return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Extra
        <Button onClick={onClose}>X</Button>
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
