// entities/user/app-state.entity.ts
import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core'

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  DONE = 'done',
  FAILED = 'failed'
}

@Entity({ tableName: 'UserDbState' })
export class UserDbState {
  @PrimaryKey({ type: 'string' })
  key!: string

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.PENDING

  @Property({ type: 'datetime', nullable: true })
  completedAt?: Date

  @Property({ nullable: true, type: 'text' })
  errorMessage?: string
}
