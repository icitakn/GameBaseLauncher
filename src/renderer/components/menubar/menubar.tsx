import React, { ReactNode, useContext } from 'react'
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Typography
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleDown,
  faArrowsSplitUpAndLeft,
  faCog,
  faGamepad,
  faGuitar,
  faLaptopCode,
  faMusic,
  faPaintBrush,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import { t } from 'i18next'
import { GameBase } from '@shared/models/settings.model'
import { SettingsContext } from '@renderer/contexts/settings.context'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import useEntityStore from '@renderer/hooks/useEntityStore'

function GamebaseDropDown({ gamebases }: { gamebases: GameBase[] }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = React.useState<number>()
  const open = Boolean(anchorEl)
  const handleOpenMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setSelectedIndex(index)
    setAnchorEl(null)

    useEntityStore.getState().clearStore()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <List component="div" aria-label="Gamebase selection">
        <ListItemButton
          key="open-button"
          id="open-button"
          aria-haspopup="listbox"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleOpenMenuClick}
        >
          {selectedIndex != null ? (
            <ListItemText primary={gamebases[selectedIndex]?.name} />
          ) : (
            <ListItemText primary={t('translation:gamebase.menuitem_add')} />
          )}
          <FontAwesomeIcon icon={faAngleDown} />
        </ListItemButton>
      </List>
      <Menu
        key="gamebase-menu"
        id="gamebase-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'open-button',
          role: 'listbox'
        }}
      >
        {gamebases?.map((gamebase, index) => (
          <Link to={'/gamebase/' + gamebase.id} key={gamebase.id}>
            <MenuItem
              key={gamebase.id}
              selected={index === selectedIndex}
              onClick={(event) => handleMenuItemClick(event, index)}
            >
              {gamebase.name}
            </MenuItem>
          </Link>
        ))}
      </Menu>
    </>
  )
}

const GblNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiListItemButton-root': {
    paddingLeft: 24,
    paddingRight: 24
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20
  }
})

function GamebaseLogo() {
  const navigate = useNavigate()
  function onIconClick(): void {
    navigate('/')
  }

  return (
    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => onIconClick()}>
      <Typography variant="h2" sx={{ WebkitTextStroke: '1px black' }}>
        GBL
      </Typography>
      <Typography variant="h6">GameBaseLauncher</Typography>
    </div>
  )
}

type MenuItem = {
  uri: string
  label: string
  icon: ReactNode
}

export function Menubar() {
  const { settings, setSettings } = useContext(SettingsContext)
  const { selectedGamebase } = useSelectedGamebase()
  const navigate = useNavigate()
  const isImporting = selectedGamebase?.state ? selectedGamebase.state.endsWith('%') : false

  const menuItems: MenuItem[] = [
    {
      uri: '/games',
      label: t('translation:menu.games'),
      icon: <FontAwesomeIcon icon={faGamepad} />
    },
    {
      uri: '/artists',
      label: t('translation:menu.artists'),
      icon: <FontAwesomeIcon icon={faPaintBrush} />
    },
    {
      uri: '/musicians',
      label: t('translation:menu.musicians'),
      icon: <FontAwesomeIcon icon={faGuitar} />
    },
    {
      uri: '/programmers',
      label: t('translation:menu.programmers'),
      icon: <FontAwesomeIcon icon={faLaptopCode} />
    },
    {
      uri: '/publishers',
      label: t('translation:menu.publishers'),
      icon: <FontAwesomeIcon icon={faArrowsSplitUpAndLeft} />
    },
    {
      uri: '/developers',
      label: t('translation:menu.developers'),
      icon: <FontAwesomeIcon icon={faLaptopCode} />
    },
    {
      uri: '/crackers',
      label: t('translation:menu.crackers'),
      icon: <FontAwesomeIcon icon={faLaptopCode} />
    },
    {
      uri: '/musics',
      label: t('translation:menu.musics'),
      icon: <FontAwesomeIcon icon={faMusic} />
    },
    {
      uri: '/edit',
      label: t('translation:menu.gb_settings'),
      icon: <FontAwesomeIcon icon={faCog} />
    }
  ]

  return (
    <GblNav
      component="nav"
      disablePadding
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <GamebaseLogo />
      <Divider sx={{ bgcolor: 'primary.contrastText' }} />
      {settings?.gamebases && settings.gamebases.length > 0 && (
        <GamebaseDropDown gamebases={settings?.gamebases} />
      )}

      <ListItemButton sx={{ flexGrow: 0 }} onClick={() => navigate('/gamebase/add')}>
        <ListItemIcon>
          <FontAwesomeIcon icon={faPlusCircle} />
        </ListItemIcon>
        <ListItemText sx={{ my: 0 }} primary={t('translation:menu.add_gamebase')} />
      </ListItemButton>

      {selectedGamebase && (
        <>
          <Divider sx={{ bgcolor: 'primary.contrastText' }} />

          {isImporting && (
            <Box sx={{ px: 3, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">
                {t('translation:gamebase.messages.importing')} ({selectedGamebase.state})
              </Typography>
            </Box>
          )}

          {menuItems.map((item) => (
            <ListItemButton
              sx={{ flexGrow: 0 }}
              onClick={() => navigate('/gamebase/' + selectedGamebase.id + item.uri)}
              key={item.label}
              disabled={isImporting}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText sx={{ my: 0 }} primary={item.label} />
            </ListItemButton>
          ))}
        </>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ bgcolor: 'primary.contrastText' }} />
      <ListItemButton sx={{ flexGrow: 0 }} onClick={() => navigate('/settings')}>
        <ListItemIcon>
          <FontAwesomeIcon icon={faCog} />
        </ListItemIcon>
        <ListItemText sx={{ my: 0 }} primary={t('translation:menu.app_settings')} />
      </ListItemButton>
    </GblNav>
  )
}
