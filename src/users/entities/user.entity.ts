import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { UserRole } from '../../utils/enums';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN })
  userType!: UserRole;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  /**
   * Incremented on every password-reset to invalidate all previously issued
   * access- and refresh-tokens without needing a token revocation store.
   */
  @Column({ type: 'int', default: 0 })
  tokenVersion!: number;

  @Column({ type: 'varchar', nullable: true })
  profileImage!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updated_at!: Date;
}
