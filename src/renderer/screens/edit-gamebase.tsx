import { Container, Stack, Tab, Tabs } from '@mui/material'
import { GameBase } from '@shared/models/settings.model'
import { toast } from 'react-toastify'
import { GamebaseForm } from '../components/gamebase-form/gamebase-form'
import { useSelectedGamebase } from '../hooks/useGamebase'
import { useState } from 'react'
import { TabPanel } from '../components/common/tab-panel'
import { BaseEditForm } from '../components/forms/base-edit-form'
import { MasterDetail } from '../components/master-detail/master-detail.component'
import { createColumnHelper } from '@tanstack/react-table'
import useEntityStore from '../hooks/useEntityStore'
import { GenreEditForm } from '../components/forms/genre-edit-form'
import { t } from 'i18next'
import { BaseDTO, GenreDTO } from '@shared/models/form-schemes.model'

const getFullLabel = (genre: GenreDTO): string => {
  if (!genre.parent) {
    return genre.name ?? ''
  }
  const parentLabel = getFullLabel(genre.parent)
  return parentLabel ? parentLabel + ' - ' + genre.name : genre.name!
}

const genreColumnHelper = createColumnHelper<GenreDTO>()
const genreColumns = [
  genreColumnHelper.accessor('id', {
    header: 'ID',
    enableColumnFilter: true,
    filterFn: 'includesString',
    cell: (value) => value.getValue()?.toString()
  }),
  genreColumnHelper.accessor(
    (row) => {
      return getFullLabel(row)
    },
    { header: 'NAME' }
  )
]

const baseColumnHelper = createColumnHelper<BaseDTO>()
const baseColumns = [
  baseColumnHelper.accessor('id', {
    header: 'ID',
    enableColumnFilter: true,
    filterFn: 'includesString',
    cell: (value) => value.getValue()?.toString()
  }),
  baseColumnHelper.accessor('name', { header: 'NAME' })
]

export function EditGamebase() {
  const createNew = (): BaseDTO => {
    return {
      id: undefined,
      name: undefined
    }
  }

  const [selectedTab, setSelectedTab] = useState(0)
  const handleTabChange = (event: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab)
  }

  const genres = useEntityStore((state) => state.genreObjects)
  const loadGenres = useEntityStore((state) => state.loadGenres)
  const languages = useEntityStore((state) => state.languageObjects)
  const loadLanguages = useEntityStore((state) => state.loadLanguages)
  const difficulties = useEntityStore((state) => state.difficultyObjects)
  const loadDifficulties = useEntityStore((state) => state.loadDifficulty)
  const rarities = useEntityStore((state) => state.rarityObjects)
  const loadRarities = useEntityStore((state) => state.loadRarities)
  const licenses = useEntityStore((state) => state.licenseObjects)
  const loadLicenses = useEntityStore((state) => state.loadLicenses)

  // const navigate = useNavigate();
  const { selectedGamebase } = useSelectedGamebase()

  const onSubmit = (gamebase: GameBase) => {
    if (selectedGamebase) {
      // the form does not contain the id, so we need to set it here
      gamebase.id = selectedGamebase.id
      window.electron.editGamebase(gamebase).then(() => {
        toast.success(t('translation:forms.messages.save_success'), {
          position: 'bottom-left'
        })
      })
    }
  }

  return (
    <Stack direction="column" spacing={2} sx={{ padding: '10px', flex: '1' }}>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label={t('translation:gamebase.tabs.general')} value={0} />
        <Tab label={t('translation:gamebase.tabs.genres')} value={1} />
        <Tab label={t('translation:gamebase.tabs.languages')} value={2} />
        <Tab label={t('translation:gamebase.tabs.difficulties')} value={3} />
        <Tab label={t('translation:gamebase.tabs.rarities')} value={4} />
        <Tab label={t('translation:gamebase.tabs.licenses')} value={5} />
      </Tabs>

      <TabPanel value={selectedTab} index={0}>
        <Container sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <GamebaseForm
            onSubmit={onSubmit}
            gamebase={selectedGamebase}
            title={t('translation:gamebase.edit')}
          />
        </Container>
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <MasterDetail
          columns={genreColumns}
          tableName="Genre"
          title={t('translation:gamebase.tabs.genres')}
          EditForm={GenreEditForm}
          createNew={createNew}
          data={genres}
          loadData={loadGenres}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        <MasterDetail
          columns={baseColumns}
          tableName="Language"
          title={t('translation:gamebase.tabs.languages')}
          EditForm={BaseEditForm}
          createNew={createNew}
          data={languages}
          loadData={loadLanguages}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={3}>
        <MasterDetail
          columns={baseColumns}
          tableName="Difficulty"
          title={t('translation:gamebase.tabs.difficulties')}
          EditForm={BaseEditForm}
          createNew={createNew}
          data={difficulties}
          loadData={loadDifficulties}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={4}>
        <MasterDetail
          columns={baseColumns}
          tableName="Rarity"
          title={t('translation:gamebase.tabs.rarities')}
          EditForm={BaseEditForm}
          createNew={createNew}
          data={rarities}
          loadData={loadRarities}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={5}>
        <MasterDetail
          columns={baseColumns}
          tableName="License"
          title={t('translation:gamebase.tabs.licenses')}
          EditForm={BaseEditForm}
          createNew={createNew}
          data={licenses}
          loadData={loadLicenses}
        />
      </TabPanel>
    </Stack>
  )
}
