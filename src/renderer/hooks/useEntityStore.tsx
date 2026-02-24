import { create } from 'zustand'
import {
  ArtistDTO,
  CrackerDTO,
  DeveloperDTO,
  DifficultyDTO,
  ExtraDTO,
  GameDTO,
  GenreDTO,
  IdLabelObject,
  LanguageDTO,
  LicenseDTO,
  MusicDTO,
  MusicianDTO,
  ProgrammerDTO,
  PublisherDTO,
  RarityDTO
} from '../../shared/models/form-schemes.model'
import { UUID } from 'node:crypto'
import { EntityType } from '@shared/types/database.types'
import { toast } from 'react-toastify'
import { t } from 'i18next'

interface BaseEntity {
  id?: number | null
  name?: string | null
}

interface LoadingState {
  isLoading: boolean
  progress: number
  loaded: number
  total: number
}

interface EntityLoadingState {
  [key: string]: LoadingState
}

const stateKeyMapper: {
  [key: string]: { objectKey: keyof State; labelKey: keyof State }
} = {
  Publisher: { objectKey: 'publisherObjects', labelKey: 'publishers' },
  Developer: { objectKey: 'developerObjects', labelKey: 'developers' },
  Programmer: { objectKey: 'programmerObjects', labelKey: 'programmers' },
  Music: { objectKey: 'musicObjects', labelKey: 'music' },
  Musician: { objectKey: 'musicianObjects', labelKey: 'musicians' },
  Artist: { objectKey: 'artistObjects', labelKey: 'artists' },
  Cracker: { objectKey: 'crackerObjects', labelKey: 'crackers' },
  Game: { objectKey: 'gameObjects', labelKey: 'games' },
  Genre: { objectKey: 'genreObjects', labelKey: 'genres' },
  Language: { objectKey: 'languageObjects', labelKey: 'languages' },
  Difficulty: { objectKey: 'difficultyObjects', labelKey: 'difficulties' },
  Rarity: { objectKey: 'rarityObjects', labelKey: 'rarities' },
  License: { objectKey: 'licenseObjects', labelKey: 'licenses' }
}

interface State {
  publishers: IdLabelObject[]
  publisherObjects: PublisherDTO[]
  developers: IdLabelObject[]
  developerObjects: DeveloperDTO[]
  extraObjects: ExtraDTO[]
  programmers: IdLabelObject[]
  programmerObjects: ProgrammerDTO[]
  music: IdLabelObject[]
  musicObjects: MusicDTO[]
  musicians: IdLabelObject[]
  musicianObjects: MusicianDTO[]
  artists: IdLabelObject[]
  artistObjects: ArtistDTO[]
  crackers: IdLabelObject[]
  crackerObjects: CrackerDTO[]
  games: IdLabelObject[]
  gameObjects: GameDTO[]

  genres: IdLabelObject[]
  languages: IdLabelObject[]
  rarities: IdLabelObject[]
  licenses: IdLabelObject[]
  difficulties: IdLabelObject[]

  genreObjects: GenreDTO[]
  languageObjects: LanguageDTO[]
  rarityObjects: RarityDTO[]
  licenseObjects: LicenseDTO[]
  difficultyObjects: DifficultyDTO[]

  loadPublishers: (gamebaseId: UUID) => Promise<void>
  loadProgrammers: (gamebaseId: UUID) => Promise<void>
  loadMusics: (gamebaseId: UUID) => Promise<void>
  loadMusicians: (gamebaseId: UUID) => Promise<void>
  loadDevelopers: (gamebaseId: UUID) => Promise<void>
  loadArtists: (gamebaseId: UUID) => Promise<void>
  loadCrackers: (gamebaseId: UUID) => Promise<void>
  loadGames: (gamebaseId: UUID) => Promise<void>
  loadExtras: (gamebaseId: UUID) => Promise<void>

  loadGenres: (gamebaseId: UUID) => Promise<void>
  loadLanguages: (gamebaseId: UUID) => Promise<void>
  loadRarities: (gamebaseId: UUID) => Promise<void>
  loadLicenses: (gamebaseId: UUID) => Promise<void>
  loadDifficulty: (gamebaseId: UUID) => Promise<void>

  loadPublisherById: (id: number, gamebaseId: UUID) => Promise<PublisherDTO | null>
  loadDeveloperById: (id: number, gamebaseId: UUID) => Promise<DeveloperDTO | null>
  loadProgrammerById: (id: number, gamebaseId: UUID) => Promise<ProgrammerDTO | null>
  loadMusicById: (id: number, gamebaseId: UUID) => Promise<MusicDTO | null>
  loadMusicianById: (id: number, gamebaseId: UUID) => Promise<MusicianDTO | null>
  loadArtistById: (id: number, gamebaseId: UUID) => Promise<ArtistDTO | null>
  loadCrackerById: (id: number, gamebaseId: UUID) => Promise<CrackerDTO | null>
  loadGameById: (id: number, gamebaseId: UUID) => Promise<GameDTO | null>
  loadExtraById: (id: number, gamebaseId: UUID) => Promise<ExtraDTO | null>
  loadGenreById: (id: number, gamebaseId: UUID) => Promise<GenreDTO | null>
  loadLanguageById: (id: number, gamebaseId: UUID) => Promise<LanguageDTO | null>
  loadRarityById: (id: number, gamebaseId: UUID) => Promise<RarityDTO | null>
  loadLicenseById: (id: number, gamebaseId: UUID) => Promise<LicenseDTO | null>
  loadDifficultyById: (id: number, gamebaseId: UUID) => Promise<DifficultyDTO | null>

  upsertEntity: <T extends BaseEntity>(
    entityType: EntityType,
    id: number | undefined | null,
    updatedData: Partial<T>,
    gamebaseId: UUID
  ) => Promise<void>

  deleteEntity: (entityType: EntityType, id: number, gamebaseId: UUID) => Promise<void>

  clearStore: () => void
  loadingStates: EntityLoadingState
}

const initialState = {
  publishers: [],
  publisherObjects: [],
  programmers: [],
  programmerObjects: [],
  music: [],
  musicObjects: [],
  musicians: [],
  musicianObjects: [],
  developers: [],
  developerObjects: [],
  extraObjects: [],
  artists: [],
  artistObjects: [],
  crackers: [],
  crackerObjects: [],
  games: [],
  gameObjects: [],
  genres: [],
  languages: [],
  rarities: [],
  licenses: [],
  difficulties: [],
  genreObjects: [],
  languageObjects: [],
  rarityObjects: [],
  licenseObjects: [],
  difficultyObjects: [],
  loadingStates: {}
}

// Helper function for generic entity loaders with batching
const createEntityLoaderWithBatching = <T extends BaseEntity>(
  entityType: string,
  stateKey: keyof State,
  objectsKey: keyof State,
  options?: {
    sortBy?: 'name' | 'id'
    customLabelFn?: (entity: T) => string
    useBatching?: boolean
  }
) => {
  return async (gamebaseId: UUID, set: any) => {
    const useBatching = options?.useBatching ?? true
    const sortBy = options?.sortBy ?? 'name'
    const customLabelFn = options?.customLabelFn

    try {
      set((state: State) => ({
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [entityType]: {
            isLoading: true,
            progress: 0,
            loaded: 0,
            total: 0
          }
        }
      }))

      const removeListener = window.electron.onLoadProgress((progressData) => {
        if (progressData.tableName === entityType) {
          set((state: State) => ({
            ...state,
            loadingStates: {
              ...state.loadingStates,
              [entityType]: {
                isLoading: true,
                progress: progressData.percentage,
                loaded: progressData.loaded,
                total: progressData.total
              }
            }
          }))
        }
      })

      const entities: T[] = await window.electron.getAll(entityType, {}, gamebaseId, useBatching)

      removeListener()

      const idLabelObjects: IdLabelObject[] = entities.map((entity: T) => ({
        id: entity.id!,
        label: customLabelFn ? customLabelFn(entity) : entity.name!
      }))

      if (sortBy === 'name') {
        idLabelObjects.sort((a, b) => a.label.localeCompare(b.label))
      } else {
        idLabelObjects.sort((a, b) => a.id - b.id)
      }

      set((state: State) => ({
        ...state,
        [stateKey]: idLabelObjects,
        [objectsKey]: entities,
        loadingStates: {
          ...state.loadingStates,
          [entityType]: {
            isLoading: false,
            progress: 100,
            loaded: entities.length,
            total: entities.length
          }
        }
      }))
    } catch (error) {
      console.error(`Error loading ${entityType}:`, error)

      set((state: State) => ({
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [entityType]: {
            isLoading: false,
            progress: 0,
            loaded: 0,
            total: 0
          }
        }
      }))

      throw error
    }
  }
}

const createEntityLoaderById = <T extends BaseEntity>(
  entityType: string,
  objectsKey: keyof State,
  stateKey?: keyof State,
  options?: {
    customLabelFn?: (entity: T) => string
  }
) => {
  return async (id: number, gamebaseId: UUID, set: any, get: any): Promise<T | null> => {
    try {
      const filter = { id: [id] }

      const entities: T[] = await window.electron.getAll(entityType, filter, gamebaseId, false)

      if (entities.length === 0) {
        console.warn(`${entityType} with id ${id} not found`)
        return null
      }

      const entity = entities[0]

      set((state: State) => {
        const currentObjects = state[objectsKey] as unknown as T[]
        const existingIndex = currentObjects.findIndex((obj) => obj.id === id)

        let updatedObjects: T[]
        if (existingIndex !== -1) {
          updatedObjects = [...currentObjects]
          updatedObjects[existingIndex] = entity
        } else {
          updatedObjects = [...currentObjects, entity]
        }

        if (stateKey && entity.name) {
          const currentIdLabels = state[stateKey] as IdLabelObject[]
          const existingLabelIndex = currentIdLabels.findIndex((item) => item.id === id)

          const label = options?.customLabelFn ? options.customLabelFn(entity) : entity.name

          let updatedIdLabels: IdLabelObject[]
          if (existingLabelIndex !== -1) {
            updatedIdLabels = [...currentIdLabels]
            updatedIdLabels[existingLabelIndex] = { id: entity.id!, label }
          } else {
            updatedIdLabels = [...currentIdLabels, { id: entity.id!, label }]
            updatedIdLabels.sort((a, b) => a.label.localeCompare(b.label))
          }

          return {
            ...state,
            [objectsKey]: updatedObjects,
            [stateKey]: updatedIdLabels
          }
        }

        return {
          ...state,
          [objectsKey]: updatedObjects
        }
      })

      return entity
    } catch (error) {
      console.error(`Error loading ${entityType} by id ${id}:`, error)
      throw error
    }
  }
}

const useEntityStore = create<State>((set, get) => ({
  ...initialState,

  loadPublishers: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<PublisherDTO>(
      'Publisher',
      'publishers',
      'publisherObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadDevelopers: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<DeveloperDTO>(
      'Developer',
      'developers',
      'developerObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadProgrammers: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<ProgrammerDTO>(
      'Programmer',
      'programmers',
      'programmerObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadMusicians: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<MusicianDTO>(
      'Musician',
      'musicians',
      'musicianObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadArtists: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<ArtistDTO>('Artist', 'artists', 'artistObjects', {
      useBatching
    })
    await loader(gamebaseId, set)
  },

  loadCrackers: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<CrackerDTO>(
      'Cracker',
      'crackers',
      'crackerObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadLanguages: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<LanguageDTO>(
      'Language',
      'languages',
      'languageObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadRarities: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<RarityDTO>(
      'Rarity',
      'rarities',
      'rarityObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadLicenses: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<LicenseDTO>(
      'License',
      'licenses',
      'licenseObjects',
      { useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadDifficulty: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<DifficultyDTO>(
      'Difficulty',
      'difficulties',
      'difficultyObjects',
      { sortBy: 'id', useBatching }
    )
    await loader(gamebaseId, set)
  },

  loadExtras: async (gamebaseId: UUID, useBatching = true) => {
    try {
      set((state: State) => ({
        ...state,
        loadingStates: {
          ...state.loadingStates,
          Extra: { isLoading: true, progress: 0, loaded: 0, total: 0 }
        }
      }))

      const removeListener = window.electron.onLoadProgress((progressData) => {
        if (progressData.tableName === 'Extra') {
          set((state: State) => ({
            ...state,
            loadingStates: {
              ...state.loadingStates,
              Extra: {
                isLoading: true,
                progress: progressData.percentage,
                loaded: progressData.loaded,
                total: progressData.total
              }
            }
          }))
        }
      })

      const extras = await window.electron.getAll('Extra', {}, gamebaseId, useBatching)

      removeListener()

      set((state) => ({
        ...state,
        extraObjects: extras,
        loadingStates: {
          ...state.loadingStates,
          Extra: {
            isLoading: false,
            progress: 100,
            loaded: extras.length,
            total: extras.length
          }
        }
      }))
    } catch (error) {
      console.error('Error loading extras:', error)
      set((state: State) => ({
        ...state,
        loadingStates: {
          ...state.loadingStates,
          Extra: { isLoading: false, progress: 0, loaded: 0, total: 0 }
        }
      }))
      throw error
    }
  },

  loadMusics: async (gamebaseId: UUID, useBatching = true) => {
    const loader = createEntityLoaderWithBatching<MusicDTO>('Music', 'music', 'musicObjects', {
      useBatching
    })
    await loader(gamebaseId, set)
  },

  loadGames: async (gamebaseId: UUID) => {
    try {
      set((state: State) => ({
        ...state,
        loadingStates: {
          ...state.loadingStates,
          Game: { isLoading: true, progress: 0, loaded: 0, total: 0 }
        }
      }))

      const removeListener = window.electron.onLoadProgress((progressData) => {
        if (progressData.tableName === 'Game') {
          set((state: State) => ({
            ...state,
            loadingStates: {
              ...state.loadingStates,
              Game: {
                isLoading: true,
                progress: progressData.percentage,
                loaded: progressData.loaded,
                total: progressData.total
              }
            }
          }))
        }
      })

      const games: GameDTO[] = await window.electron.getSlim('Game', gamebaseId)

      removeListener()

      const idLabelObjects: IdLabelObject[] = games.map((game: GameDTO) => ({
        id: game.id!,
        label: game.name
      }))
      idLabelObjects.sort((a, b) => a.label.localeCompare(b.label))

      set((state) => ({
        ...state,
        games: idLabelObjects,
        gameObjects: games,
        loadingStates: {
          ...state.loadingStates,
          Game: {
            isLoading: false,
            progress: 100,
            loaded: games.length,
            total: games.length
          }
        }
      }))
    } catch (error) {
      console.error('Error loading games (slim):', error)
      set((state: State) => ({
        ...state,
        loadingStates: {
          ...state.loadingStates,
          Game: { isLoading: false, progress: 0, loaded: 0, total: 0 }
        }
      }))
      throw error
    }
  },

  loadGenres: async (gamebaseId: UUID, useBatching = true) => {
    const getFullLabel = (genre: GenreDTO): string => {
      if (!genre.parent) {
        return genre.name!
      }
      const parentLabel = getFullLabel(genre.parent)
      return parentLabel ? parentLabel + ' - ' + genre.name : genre.name!
    }

    const loader = createEntityLoaderWithBatching<GenreDTO>('Genre', 'genres', 'genreObjects', {
      customLabelFn: getFullLabel,
      useBatching
    })
    await loader(gamebaseId, set)
  },

  loadPublisherById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<PublisherDTO>(
      'Publisher',
      'publisherObjects',
      'publishers'
    )
    return await loader(id, gamebaseId, set, get)
  },

  loadDeveloperById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<DeveloperDTO>(
      'Developer',
      'developerObjects',
      'developers'
    )
    return await loader(id, gamebaseId, set, get)
  },

  loadProgrammerById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<ProgrammerDTO>(
      'Programmer',
      'programmerObjects',
      'programmers'
    )
    return await loader(id, gamebaseId, set, get)
  },

  loadMusicById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<MusicDTO>('Music', 'musicObjects', 'music')
    return await loader(id, gamebaseId, set, get)
  },

  loadMusicianById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<MusicianDTO>('Musician', 'musicianObjects', 'musicians')
    return await loader(id, gamebaseId, set, get)
  },

  loadArtistById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<ArtistDTO>('Artist', 'artistObjects', 'artists')
    return await loader(id, gamebaseId, set, get)
  },

  loadCrackerById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<CrackerDTO>('Cracker', 'crackerObjects', 'crackers')
    return await loader(id, gamebaseId, set, get)
  },

  loadGameById: async (id: number, gamebaseId: UUID) => {
    const cachedGame = get().gameObjects.find((g) => g.id === id)

    const isFullyLoaded =
      cachedGame && cachedGame.publisher && typeof cachedGame.publisher === 'object'

    if (isFullyLoaded) {
      return cachedGame
    }
    const loader = createEntityLoaderById<GameDTO>('Game', 'gameObjects', 'games')
    return await loader(id, gamebaseId, set, get)
  },

  loadExtraById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<ExtraDTO>('Extra', 'extraObjects')
    return await loader(id, gamebaseId, set, get)
  },

  loadGenreById: async (id: number, gamebaseId: UUID) => {
    const getFullLabel = (genre: GenreDTO): string => {
      if (!genre.parent) {
        return genre.name || ''
      }
      const parentLabel = getFullLabel(genre.parent)
      return parentLabel ? parentLabel + ' - ' + genre.name : genre.name || ''
    }

    const loader = createEntityLoaderById<GenreDTO>('Genre', 'genreObjects', 'genres', {
      customLabelFn: getFullLabel
    })
    return await loader(id, gamebaseId, set, get)
  },

  loadLanguageById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<LanguageDTO>('Language', 'languageObjects', 'languages')
    return await loader(id, gamebaseId, set, get)
  },

  loadRarityById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<RarityDTO>('Rarity', 'rarityObjects', 'rarities')
    return await loader(id, gamebaseId, set, get)
  },

  loadLicenseById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<LicenseDTO>('License', 'licenseObjects', 'licenses')
    return await loader(id, gamebaseId, set, get)
  },

  loadDifficultyById: async (id: number, gamebaseId: UUID) => {
    const loader = createEntityLoaderById<DifficultyDTO>(
      'Difficulty',
      'difficultyObjects',
      'difficulties'
    )
    return await loader(id, gamebaseId, set, get)
  },

  upsertEntity: async <T extends BaseEntity>(
    entityType: EntityType,
    id: number | undefined | null,
    updatedData: Partial<T>,
    gamebaseId: UUID
  ) => {
    try {
      console.log('Updating with entity ', updatedData)
      const updatedEntity = await window.electron.upsertEntity(updatedData, entityType, gamebaseId)
      console.log('Received ', updatedEntity[0])

      const objectsKey = stateKeyMapper[entityType].objectKey
      const stateKey = stateKeyMapper[entityType].labelKey

      set((state) => {
        console.log('State before ', state[objectsKey])
        const updatedObjects = (state[objectsKey] as unknown[] as T[]).map((obj) =>
          obj.id === id ? updatedEntity[0] : obj
        )

        const updatedIdLabelObjects = (state[stateKey] as IdLabelObject[]).map((item) =>
          item.id === id && updatedData.name ? { ...item, label: updatedData.name } : item
        )

        if (!id) {
          updatedObjects.push(updatedEntity[0])
          updatedIdLabelObjects.push({
            id: updatedEntity.id,
            label: updatedEntity.name
          })
        }

        console.log('State after ', updatedObjects)
        if (updatedData.name) {
          updatedIdLabelObjects.sort((a, b) => a.label?.localeCompare(b.label))
        }

        toast.success(t('translation:forms.messages.save_success'))

        return {
          ...state,
          [stateKey]: updatedIdLabelObjects,
          [objectsKey]: updatedObjects
        }
      })
    } catch (error) {
      toast.success(t('translation:forms.messages.save_error'))

      console.error(`Error upserting ${entityType}:`, error)
      throw error
    }
  },

  deleteEntity: async (entityType: EntityType, id: number, gamebaseId: UUID) => {
    try {
      console.log('Deleting entity', entityType, 'with id', id)

      await window.electron.deleteEntity(id, entityType, gamebaseId)

      const objectsKey = stateKeyMapper[entityType].objectKey
      const stateKey = stateKeyMapper[entityType].labelKey

      set((state) => {
        console.log('State before deletion', state[objectsKey])

        const updatedObjects = (state[objectsKey] as unknown[] as BaseEntity[]).filter(
          (obj) => obj.id !== id
        )

        const updatedIdLabelObjects = (state[stateKey] as IdLabelObject[]).filter(
          (item) => item.id !== id
        )

        console.log('State after deletion', updatedObjects)

        toast.success(t('common.delete_success'))

        return {
          ...state,
          [stateKey]: updatedIdLabelObjects,
          [objectsKey]: updatedObjects
        }
      })
    } catch (error) {
      toast.error(t('common.delete_success'))
      console.error(`Error deleting ${entityType}:`, error)
      throw error
    }
  },

  clearStore: () => set(initialState)
}))

export default useEntityStore
