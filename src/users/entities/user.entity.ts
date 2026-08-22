import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { UserType } from '../../utils/enums';

@Entity({ name: 'users' })
@Unique(['email', 'userType'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 250 })
  email!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  username!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.NORMAL_USER })
  userType!: UserType;

  @Column({ default: false })
  isAccountVerified!: boolean;

  @Column({ default: null, nullable: true })
  profileImage!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updated_at!: Date;
}