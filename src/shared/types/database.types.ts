export type GetReferenceFunction = <T>(
  entityClass: new () => T,
  id: number | null | undefined
) => T | null

export type EntityType =
  | 'Game'
  | 'Artist'
  | 'Musician'
  | 'Programmer'
  | 'Developer'
  | 'Extra'
  | 'Music'
  | 'Publisher'
  | 'Cracker'
  | 'Genre'
  | 'Language'
  | 'Difficulty'
  | 'Rarity'
  | 'License'
