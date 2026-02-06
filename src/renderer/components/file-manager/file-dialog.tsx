import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  Alert
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUp,
  faFile,
  faFileArchive,
  faFolder,
  faHome,
  faSearch
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { SEPARATOR } from '@shared/consts'

export interface FileDialogProps {
  open: boolean
  onClose: (event: any) => void
  onSelect: (selected: any) => void
  mode: 'both' | 'file' | 'directory'
  title: string
  multiSelect: boolean
  filters?: string[]
  path?: string
  rootPath?: string
  archiveFile?: string
  preselectedPath?: string
  containerFile?: string
}

export const FileDialog = ({
  open,
  onClose,
  onSelect,
  mode = 'both',
  title = t('translation:file_dialog.title'),
  multiSelect = false,
  filters = [],
  path,
  rootPath,
  archiveFile,
  preselectedPath,
  containerFile
}: FileDialogProps) => {
  // Refs for Auto-Scroll
  const listRef = useRef<HTMLUListElement>(null)
  const preselectedItemRef = useRef<HTMLLIElement>(null)

  // Helper function to normalize path
  const normalizePath = (p: string): string => {
    if (!p) return p

    // Remove trailing slashes (except for root paths like C:\ or /)
    let normalized = p.replace(/[\\/]+$/, '')

    // Special case: preserve root paths
    if (window.navigator.platform.startsWith('Win')) {
      if (/^[A-Za-z]:$/.test(normalized)) {
        normalized += '\\'
      }
      // Normalize to backslashes on Windows
      normalized = normalized.replace(/\//g, '\\')
    } else {
      // Normalize to forward slashes on Unix
      normalized = normalized.replace(/\\/g, '/')
      // Preserve root /
      if (normalized === '') normalized = '/'
    }

    // Remove duplicate separators
    normalized = normalized.replace(
      /[\\/]{2,}/g,
      window.navigator.platform.startsWith('Win') ? '\\' : '/'
    )

    return normalized
  }

  // Get initial folder based on props
  const getInitialPath = (): string => {
    if (archiveFile) {
      // If a file is preselected, navigate to its folder
      if (preselectedPath) {
        const segments = preselectedPath.split('/').filter(Boolean)
        return segments.length > 1 ? '/' + segments.slice(0, -1).join('/') : '/'
      }
      return '/' // In archive mode we start with the root of the archive
    }

    if (preselectedPath) {
      const normalized = normalizePath(preselectedPath)

      // Determine the folder of the preselected file/folder
      if (rootPath && !normalized.startsWith(normalizePath(rootPath))) {
        console.warn('Preselected path is not within root path')
        return normalizePath(rootPath)
      }

      // For directory mode: navigate directly to the folder (normalized)
      if (mode === 'directory') {
        console.log('returning pre', normalized)
        return normalized
      } else {
        // For files: navigate to the parent directory
        const segments = normalized.split(/[\\/]/).filter(Boolean)
        console.log('segments', segments)

        if (segments.length === 0) {
          return rootPath
            ? normalizePath(rootPath)
            : window.navigator.platform.startsWith('Win')
              ? 'C:\\'
              : '/'
        }

        const parentPath =
          (window.navigator.platform.startsWith('Win') ? '' : '/') +
          segments.slice(0, -1).join(SEPARATOR)
        console.log('parentPath', parentPath)

        return normalizePath(
          parentPath || rootPath || (window.navigator.platform.startsWith('Win') ? 'C:\\' : '/')
        )
      }
    }

    if (rootPath) {
      const normalizedRoot = normalizePath(rootPath)
      return path && normalizePath(path).startsWith(normalizedRoot)
        ? normalizePath(path)
        : normalizedRoot
    }
    return path ? normalizePath(path) : window.navigator.platform.startsWith('Win') ? 'C:\\' : '/'
  }

  const [currentPath, setCurrentPath] = useState(getInitialPath())
  const [dirContent, setDirContent] = useState<Record<string, any>>({})
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isArchiveMode, setIsArchiveMode] = useState(!!archiveFile)
  const [preselectionDone, setPreselectionDone] = useState(false)
  const [showRootPathWarning, setShowRootPathWarning] = useState(false)

  // Reset all state values when opening
  useEffect(() => {
    if (open) {
      setCurrentPath(getInitialPath())
      setIsArchiveMode(!!archiveFile)
      setSelectedItems([]) // Reset selection
      setSearchTerm('') // Reset search
      setDirContent({}) // Reset directory content
      setPreselectionDone(false) // Reset preselection flag
      setShowRootPathWarning(false) // Reset warning
    }
  }, [open, rootPath, archiveFile, path, preselectedPath])

  // Reset when closing as additional safety
  useEffect(() => {
    if (!open) {
      setSelectedItems([])
      setSearchTerm('')
      setDirContent({})
      setPreselectionDone(false)
      setShowRootPathWarning(false)
    }
  }, [open])

  useEffect(() => {
    if (open && currentPath) {
      if (isArchiveMode && archiveFile) {
        console.log('## archive', archiveFile)
        console.log('## container', containerFile)

        // Read archive content
        window.electron
          .readFile(archiveFile, currentPath, containerFile)
          .then((content) => {
            setDirContent(content)
          })
          .catch((error) => {
            console.error('Error reading archive:', error)
            setDirContent({})
          })
      } else {
        // Normal directory reading
        window.electron.readDir(currentPath).then((content) => {
          setDirContent(content)
        })
      }
    }
  }, [open, currentPath, isArchiveMode, archiveFile, containerFile])

  // Auto-scroll to preselected element
  useEffect(() => {
    if (preselectedItemRef.current && listRef.current && !preselectionDone) {
      const timer = setTimeout(() => {
        preselectedItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100) // Short delay to ensure the DOM is rendered

      return () => clearTimeout(timer)
    }
  }, [dirContent, preselectedPath, preselectionDone])

  // Separate effect for preselection
  useEffect(() => {
    if (preselectionDone) {
      return
    }

    const checkPreselection = async () => {
      if (!open || !preselectedPath || !currentPath || Object.keys(dirContent).length === 0) {
        console.log('early return', open, preselectedPath, currentPath, dirContent)
        return
      }

      try {
        let selectionSuccessful = false

        if (isArchiveMode) {
          // Archive mode: Check if the preselected file is in the current directory
          const fileName = preselectedPath.split('/').pop()
          if (fileName && dirContent[fileName]) {
            const item = dirContent[fileName]
            if (item.type === 'directory') {
              // For folders: navigate to the folder
              navigateTo(preselectedPath, true) // true = Auto-Navigation
              selectionSuccessful = true
            } else {
              // For files: select the file
              setSelectedItems([
                {
                  name: fileName,
                  path: preselectedPath,
                  type: item.type,
                  size: item.size
                }
              ])
              selectionSuccessful = true
            }
          }
        } else {
          // Normal mode: Check if we are already in the correct directory
          const fileName = preselectedPath.split(/[\\/]/).pop()

          // Normalize paths for comparison
          const normalizedCurrent = currentPath.replace(/\\/g, '/').replace(/\/+/g, '/')
          const normalizedPreselected = preselectedPath.replace(/\\/g, '/').replace(/\/+/g, '/')
          const normalizedParent =
            normalizedPreselected.substring(0, normalizedPreselected.lastIndexOf('/')) || '/'

          console.log('normalizedCurrent', normalizedCurrent)
          console.log('normalizedPreselected', normalizedPreselected)
          console.log('normalizedParent', normalizedParent)

          if (mode === 'directory') {
            // Directory mode: If preselectedPath is a subfolder, navigate there
            if (normalizedCurrent !== normalizedPreselected && isWithinRootPath(preselectedPath)) {
              // Check if the path exists by navigating step by step
              const currentSegments = normalizedCurrent.split('/').filter(Boolean)
              const targetSegments = normalizedPreselected.split('/').filter(Boolean)

              // Find the next step to the target
              if (targetSegments.length > currentSegments.length) {
                const nextSegment = targetSegments[currentSegments.length]
                if (dirContent[nextSegment] && dirContent[nextSegment].type === 'directory') {
                  const nextPath = normalizedCurrent.endsWith('/')
                    ? normalizedCurrent + nextSegment
                    : normalizedCurrent + '/' + nextSegment
                  navigateTo(nextPath.replace(/\//g, SEPARATOR), true) // true = Auto-Navigation
                  selectionSuccessful = true
                  return
                }
              }
            } else if (normalizedCurrent === normalizedPreselected) {
              selectionSuccessful = true
            }
          } else {
            // File mode: Check if we are in the correct parent directory
            if (normalizedCurrent === normalizedParent) {
              // We are in the right directory, select the file
              if (fileName && dirContent[fileName] && dirContent[fileName].type !== 'directory') {
                const item = dirContent[fileName]
                setSelectedItems([
                  {
                    name: fileName,
                    path: preselectedPath,
                    type: item.type,
                    size: item.size
                  }
                ])
                selectionSuccessful = true
              }
            } else if (
              normalizedCurrent.length < normalizedParent.length &&
              normalizedParent.startsWith(normalizedCurrent)
            ) {
              // We need to navigate deeper
              const remainingPath = normalizedParent
                .substring(normalizedCurrent.length)
                .replace(/^\//, '')
              const nextSegment = remainingPath.split('/')[0]

              if (
                nextSegment &&
                dirContent[nextSegment] &&
                dirContent[nextSegment].type === 'directory'
              ) {
                const nextPath = normalizedCurrent.endsWith('/')
                  ? normalizedCurrent + nextSegment
                  : normalizedCurrent + '/' + nextSegment
                navigateTo(nextPath.replace(/\//g, SEPARATOR), true) // true = Auto-Navigation
                selectionSuccessful = true
                return
              }
            }
          }
        }

        // If preselection failed and no rootPath is set
        if (!selectionSuccessful && !rootPath && !isArchiveMode) {
          setShowRootPathWarning(true)
          setPreselectionDone(true) // Avoid further attempts
        }
      } catch (error) {
        console.error('Error during preselection:', error)
        // On error and missing rootPath, show warning
        if (!rootPath && !isArchiveMode) {
          setShowRootPathWarning(true)
          setPreselectionDone(true)
        }
      }
    }
    console.log('preselection')
    checkPreselection()
  }, [open, currentPath, dirContent, preselectedPath, isArchiveMode, mode, preselectionDone])

  if (!open) return null

  const getPathSegments = (path: string): string[] => {
    return path === '/' ? [] : path.split(/[\\/]/).filter(Boolean)
  }

  const getRootPathSegments = (): string[] => {
    if (!rootPath) return []
    return rootPath === '/' ? [] : rootPath.split(/[\\/]/).filter(Boolean)
  }

  // Checks if the given path is within the root path
  const isWithinRootPath = (path: string): boolean => {
    if (!rootPath) return true
    if (isArchiveMode) return true // Different rules apply in archive mode

    const normalizedPath = path.replace(/\\/g, '/')
    const normalizedRoot = rootPath.replace(/\\/g, '/')

    return normalizedPath.startsWith(normalizedRoot)
  }

  const navigateTo = (path: string, isAutoNavigation = false): void => {
    const normalizedPath = normalizePath(path)

    // Check if navigation is allowed
    if (!isWithinRootPath(normalizedPath) && !isArchiveMode) {
      return // Navigation outside root path not allowed
    }

    setCurrentPath(normalizedPath)
    setSelectedItems([]) // Reset selection on navigation

    // If user navigates manually, disable preselection
    if (!isAutoNavigation) {
      setPreselectionDone(true)
    }
  }

  const navigateUp = (): void => {
    const segments = getPathSegments(currentPath)

    if (isArchiveMode) {
      // In archive mode: only navigate within the archive
      if (segments.length > 0) {
        const parentPath = '/' + segments.slice(0, -1).join('/')
        navigateTo(parentPath === '/' ? '/' : parentPath)
      }
      return
    }

    if (rootPath) {
      const rootSegments = getRootPathSegments()
      const currentSegments = getPathSegments(currentPath)

      // Check if we are already in the root directory
      if (currentSegments.length <= rootSegments.length) {
        return // Already in root or above - no navigation up possible
      }

      // Navigate one level up, but not beyond root
      const newSegments = currentSegments.slice(0, -1)
      const parentPath =
        (window.navigator.platform.startsWith('Win') ? '' : '/') + newSegments.join(SEPARATOR)
      navigateTo(parentPath || rootPath)
    } else {
      // Standard navigation without root restriction
      if (segments.length > 1) {
        const parentPath =
          (window.navigator.platform.startsWith('Win') ? '' : '/') + segments.slice(0, -1).join('/')
        navigateTo(parentPath)
      } else if (currentPath !== '/') {
        navigateTo(window.navigator.platform.startsWith('Win') ? 'C:\\' : '/')
      }
    }
  }

  const navigateToRoot = (): void => {
    if (isArchiveMode) {
      navigateTo('/')
    } else if (rootPath) {
      navigateTo(rootPath)
    } else {
      navigateTo(window.navigator.platform.startsWith('Win') ? 'C:\\' : '/')
    }
  }

  const handleItemClick = (name: string, item: any): void => {
    let fullPath: string

    if (isArchiveMode) {
      // In archive mode we use Unix-style paths
      fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
    } else {
      // Normal filesystem navigation
      const normalized = normalizePath(currentPath)
      fullPath = `${normalized}${SEPARATOR}${name}`
      fullPath = normalizePath(fullPath) // Normalize the result
    }

    if (item.type === 'directory') {
      navigateTo(fullPath)
    } else {
      if (multiSelect) {
        setSelectedItems((prev) => {
          const exists = prev.some((s) => s.name === name)
          if (exists) {
            return prev.filter((s) => s.name !== name)
          } else {
            return [...prev, { name, path: fullPath, type: item.type, size: item.size }]
          }
        })
      } else {
        setSelectedItems([{ name, path: fullPath, type: item.type, size: item.size }])
      }
    }
  }

  const handleClose = (event: any): void => {
    // Reset all values when closing
    setSelectedItems([])
    setSearchTerm('')
    setDirContent({})
    setCurrentPath(getInitialPath())

    // Call original onClose
    onClose(event)
  }

  const handleSelect = (): void => {
    if (mode === 'directory') {
      onSelect({ path: currentPath, type: 'directory' })
    } else if (selectedItems.length > 0) {
      onSelect(multiSelect ? selectedItems : selectedItems[0])
    }
  }

  // Check if "Up" button should be disabled
  const isUpButtonDisabled = (): boolean => {
    if (isArchiveMode) {
      return currentPath === '/'
    }

    if (rootPath) {
      const rootSegments = getRootPathSegments()
      const currentSegments = getPathSegments(currentPath)
      return currentSegments.length <= rootSegments.length
    }

    return currentPath === '/' || currentPath === 'C:\\'
  }

  // Helper function to check if an item is preselected
  const isPreselectedItem = (name: string): boolean => {
    if (!preselectedPath) return false

    if (isArchiveMode) {
      const fileName = preselectedPath.split('/').pop()
      return fileName === name
    } else {
      const fileName = preselectedPath.split(/[\\/]/).pop()
      return fileName === name
    }
  }

  // Generate breadcrumbs based on mode
  const generateBreadcrumbs = () => {
    if (isArchiveMode) {
      const segments = getPathSegments(currentPath)
      return (
        <Breadcrumbs separator="/" sx={{ fontSize: '0.875rem' }}>
          <Link
            component="button"
            onClick={() => navigateTo('/')}
            underline="hover"
            sx={{ fontSize: '0.875rem' }}
          >
            Archive Root
          </Link>
          {segments.map((segment: string, index: number) => {
            const pathToSegment = '/' + segments.slice(0, index + 1).join('/')
            return (
              <Link
                key={`${index}-${segment}`}
                component="button"
                onClick={() => navigateTo(pathToSegment)}
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                {segment}
              </Link>
            )
          })}
        </Breadcrumbs>
      )
    } else {
      const allSegments = getPathSegments(currentPath)
      const rootSegments = getRootPathSegments()

      // Show only segments that come after the root path
      const visibleSegments = allSegments.slice(rootSegments.length)

      return (
        <Breadcrumbs separator="/" sx={{ fontSize: '0.875rem' }}>
          <Link
            component="button"
            onClick={navigateToRoot}
            underline="hover"
            sx={{ fontSize: '0.875rem' }}
          >
            {rootPath ? 'Root' : 'Root'}
          </Link>
          {visibleSegments.map((segment: string, index: number) => {
            // Build the path correctly
            const allSegmentsToThis = [...rootSegments, ...visibleSegments.slice(0, index + 1)]
            const pathToSegment = window.navigator.platform.startsWith('Win')
              ? allSegmentsToThis.join(SEPARATOR)
              : '/' + allSegmentsToThis.join(SEPARATOR)

            return (
              <Link
                key={`${index}-${segment}`}
                component="button"
                onClick={() => navigateTo(pathToSegment)}
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                {segment}
              </Link>
            )
          })}
        </Breadcrumbs>
      )
    }
  }

  const items = dirContent ? Object.entries(dirContent) : []
  const filteredItems = items
    .filter(([name]) => searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(([nameA, itemA], [nameB, itemB]) => {
      if (isArchiveMode) {
        return 0
      }
      if ((itemA as any).type === 'directory' && (itemB as any).type !== 'directory') {
        return -1
      }
      if ((itemA as any).type !== 'directory' && (itemB as any).type === 'directory') {
        return 1
      }

      return nameA.toLowerCase().localeCompare(nameB.toLowerCase())
    })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'directory':
        return <FontAwesomeIcon icon={faFolder} style={{ color: '#FFA726' }} />
      case 'archive':
        return <FontAwesomeIcon icon={faFileArchive} style={{ color: '#FF7043' }} />
      default:
        return <FontAwesomeIcon icon={faFile} style={{ color: '#90A4AE' }} />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'directory':
        return 'Folder'
      case 'archive':
        return 'Archive'
      default:
        return 'File'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '600px',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {title}
            {isArchiveMode && (
              <Chip
                label={t('translation:file_dialog.archive_mode')}
                color="secondary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
      </DialogTitle>

      {/* Navigation Toolbar */}
      <Box sx={{ px: 3, pb: 1 }}>
        {/* Warning for missing root path */}
        {showRootPathWarning && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setShowRootPathWarning(false)}>
            {t('translation:file_dialog.preselected_not_found')}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={navigateUp}
              size="small"
              disabled={isUpButtonDisabled()}
              title={t('translation:file_dialog.back')}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Address bar */}
            <Box sx={{ flex: 1, minWidth: 0 }}>{generateBreadcrumbs()}</Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <IconButton
              onClick={navigateToRoot}
              size="small"
              title={t('translation:file_dialog.home')}
            >
              <FontAwesomeIcon icon={faHome} />
            </IconButton>
          </Box>
        </Paper>

        {/* Search field */}
        <TextField
          fullWidth
          size="small"
          placeholder={t('translation:file_dialog.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} size="sm" />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      <DialogContent sx={{ flex: 1, minHeight: 0, px: 3, pt: 0 }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {mode === 'directory' && (
            <Box sx={{ mb: 1 }}>
              <Chip
                label={`${t('translation:file_dialog.current_folder')}: ${currentPath}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}

          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <List ref={listRef} sx={{ flex: 1, overflow: 'auto', p: 0 }} dense>
              {filteredItems.length === 0 ? (
                <ListItem sx={{ justifyContent: 'center', py: 4 }}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm
                        ? `${t('translation:file_dialog.no_results_for')} "${searchTerm}"`
                        : t('translation:file_dialog.folder_empty')}
                    </Typography>
                  </Box>
                </ListItem>
              ) : (
                filteredItems.map(([name, item]) => {
                  const isSelected = selectedItems.some((s) => s.name === name)
                  const isPreselected = isPreselectedItem(name)

                  return (
                    <ListItem
                      key={name}
                      disablePadding
                      ref={isPreselected ? preselectedItemRef : null}
                    >
                      <ListItemButton
                        onClick={() => handleItemClick(name, item)}
                        selected={isSelected}
                        sx={{
                          px: 2,
                          backgroundColor:
                            isPreselected && !isSelected ? 'action.hover' : 'transparent',
                          borderLeft:
                            isPreselected && !isSelected ? '3px solid' : '3px solid transparent',
                          borderLeftColor:
                            isPreselected && !isSelected ? 'primary.main' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                              backgroundColor: 'primary.dark'
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'primary.contrastText'
                            }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getFileIcon((item as any).type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={name}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: isPreselected && !isSelected ? 'medium' : 'normal'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  )
                })
              )}
            </List>
          </Paper>

          {selectedItems.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('translation:file_dialog.selected')} ({selectedItems.length}
                ):
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, maxHeight: 100, overflow: 'auto' }}>
                <Box display="flex" gap={1} sx={{ flexWrap: 'wrap' }}>
                  {selectedItems.map((item: any, index: number) => (
                    <Chip
                      key={index}
                      label={`${item.name}`}
                      onDelete={() =>
                        setSelectedItems((prev: any[]) =>
                          prev.filter((_: any, i: number) => i !== index)
                        )
                      }
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} color="inherit">
          {t('translation:buttons.cancel')}
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={mode !== 'directory' && selectedItems.length === 0}
        >
          {mode === 'directory'
            ? t('translation:file_dialog.select_folder')
            : t('translation:file_dialog.select')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
