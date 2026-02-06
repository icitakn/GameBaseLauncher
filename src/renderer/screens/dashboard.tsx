import React, { useState, useEffect, useContext } from 'react'
import {
  Box,
  Grid2,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Modal
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGamepad,
  faTrophy,
  faClock,
  faStar,
  faPlayCircle,
  faMusic,
  faPlay,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import { SettingsContext } from '../contexts/settings.context'
import { GamePlayed, MusicListened } from '@shared/models/settings.model'
import { formatLastPlayed, formatPlaytime } from '../lib/datetime-utils'
import { t } from 'i18next'

const Dashboard = () => {
  const { settings, setSettings } = useContext(SettingsContext)

  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalPlayTime: '0',
    gamebases: 0
  })

  const [recentGames, setRecentGames] = useState<GamePlayed[]>([])
  const [recentMusic, setRecentMusic] = useState<MusicListened[]>([])

  useEffect(() => {
    if (settings) {
      const recentlyPlayed = settings?.stats?.gamesPlayed ?? []
      recentlyPlayed.sort((a, b) => b.lastPlayedAtMs - a.lastPlayedAtMs)
      const totalPlayTime =
        recentlyPlayed && recentlyPlayed.length > 0
          ? recentlyPlayed.map((game) => game.playtimeInMs).reduce((acc, val) => acc + val)
          : 0

      setStats({
        totalGamesPlayed: recentlyPlayed.length,
        totalPlayTime: (totalPlayTime / (1000 * 60 * 60)).toFixed(2),
        gamebases: settings.gamebases.length
      })

      setRecentGames(recentlyPlayed.slice(0, Math.min(recentlyPlayed.length, 10)))

      const recentlyListened = settings?.stats?.musicListenedTo ?? []
      recentlyListened.sort((a, b) => b.lastPlayedAtMs - a.lastPlayedAtMs)

      setRecentMusic(recentlyListened.slice(0, Math.min(recentlyListened.length, 10)))
    }
  }, [settings])

  const StatCard = ({
    icon,
    title,
    value,
    subtitle
  }: {
    icon: IconDefinition
    title: string
    value: any
    subtitle: string
  }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" color="white" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="rgba(255,255,255,0.6)">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <FontAwesomeIcon icon={icon} size="lg" color="white" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )

  function handleStartGame(game: GamePlayed): void {
    setModalMsg(t('translation:common.starting') + ' ' + game.name)
    setOpen(true)
    window.electron.execute(game.gamebaseId, game.id)
  }

  function handlePlayMusic(music: MusicListened): void {
    setModalMsg(t('translation:common.starting') + ' ' + music.name)
    setOpen(true)
    window.electron.playMusic(music.gamebaseId, {
      gameId: music.fromGame ? music.id : undefined,
      musicId: music.fromGame ? undefined : music.id
    })
  }

  const [open, setOpen] = React.useState(false)
  const [modalMsg, setModalMsg] = React.useState('')
  const handleClose = () => setOpen(false)
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, minHeight: '100%' }}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {modalMsg}
          </Typography>
        </Box>
      </Modal>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
          {t('translation:common.welcome')}
        </Typography>
      </Box>

      {/* Statistiken Cards */}
      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={faGamepad}
            title={t('translation:dashboard.games_played')}
            value={stats.totalGamesPlayed}
            subtitle=""
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={faClock}
            title={t('translation:dashboard.play_time')}
            value={`${stats.totalPlayTime}h`}
            subtitle=""
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={faTrophy}
            title={t('translation:dashboard.no_of_gamebases')}
            value={stats.gamebases}
            subtitle=""
          />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FontAwesomeIcon
                  icon={faPlayCircle}
                  style={{
                    fontSize: '24px',
                    color: '#1976d2',
                    marginRight: '8px'
                  }}
                />
                <Typography variant="h6" component="h2" fontWeight="bold">
                  {t('translation:dashboard.recently_played_games')}
                </Typography>
              </Box>
              <List>
                {recentGames.length === 0 && (
                  <Typography variant="subtitle1" fontWeight="medium" component="span">
                    {t('translation:dashboard.no_games_played')}
                  </Typography>
                )}
                {recentGames.map((game, index) => (
                  <React.Fragment key={'game-' + index}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                          <FontAwesomeIcon icon={faGamepad} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box component="span" display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="medium" component="span">
                              {game.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box component="span" display="flex" alignItems="center" gap={2} mt={0.5}>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {game.genre} • {formatPlaytime(game.playtimeInMs)}
                            </Typography>
                            <Box component="span" display="flex" alignItems="center" gap={0.5}>
                              <FontAwesomeIcon
                                icon={faStar}
                                style={{ fontSize: '14px', color: '#ffc107' }}
                              />
                              <Typography variant="body2" component="span">
                                {game.rating}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box textAlign="right" mr={1}>
                          <Typography variant="body2" color="text.secondary">
                            {formatLastPlayed(game.lastPlayedAtMs)}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStartGame(game)}
                          startIcon={<FontAwesomeIcon icon={faPlay} />}
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: 'auto',
                            px: 2,
                            '&:hover': {
                              bgcolor: '#45a049',
                              transform: 'scale(1.02)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          {t('translation:buttons.play')}
                        </Button>
                      </Box>{' '}
                    </ListItem>
                    {index < recentGames.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ marginTop: '2em', marginBottom: '2em' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FontAwesomeIcon
                  icon={faPlayCircle}
                  style={{
                    fontSize: '24px',
                    color: '#1976d2',
                    marginRight: '8px'
                  }}
                />
                <Typography variant="h6" component="h2" fontWeight="bold">
                  {t('translation:dashboard.recently_played_music')}
                </Typography>
              </Box>
              <List>
                {recentMusic.length === 0 && (
                  <Typography variant="subtitle1" fontWeight="medium" component="span">
                    {t('translation:dashboard.no_music_played')}
                  </Typography>
                )}
                {recentMusic.map((music, index) => (
                  <React.Fragment key={'music-' + index}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                          <FontAwesomeIcon icon={faMusic} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box component="span" display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="medium" component="span">
                              {music.name}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box textAlign="right" mr={1}>
                          <Typography variant="body2" color="text.secondary">
                            {formatLastPlayed(music.lastPlayedAtMs)}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handlePlayMusic(music)}
                          startIcon={<FontAwesomeIcon icon={faPlay} />}
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: 'auto',
                            px: 2,
                            '&:hover': {
                              bgcolor: '#45a049',
                              transform: 'scale(1.02)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          {t('translation:buttons.play')}
                        </Button>
                      </Box>{' '}
                    </ListItem>
                    {index < recentGames.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  )
}

export default Dashboard
