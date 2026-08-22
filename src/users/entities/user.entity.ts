import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { UserType } from '../../utils/enums';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 250 })
  email!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  username!: string | null;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.NORMAL_USER })
  userType!: UserType;

  @Column({ type: 'boolean', default: false })
  isAccountVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  profileImage!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updated_at!: Date;
}