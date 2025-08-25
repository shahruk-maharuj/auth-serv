import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Config } from '../config';
import { User } from './User';

@Entity({ name: 'refreshTokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: Config.NODE_ENV === 'test' ? 'datetime' : 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => User)
  user: User;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
