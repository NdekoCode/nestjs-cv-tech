import { TimestampEntity } from 'generics/entities/timestamp.entity';
import { CvEntity } from 'src/cv/entities/cv.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EUserRoles } from '../../../types/enums/user-role.enum';

@Entity('users')
export class UserEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 180,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
  })
  @Column({
    type: 'varchar',
    default: 10,
  })
  salt: number;

  @Column({
    enum: EUserRoles,
    type: 'enum',
    default: EUserRoles.USER,
  })
  role: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  password: string;

  @OneToMany((type) => CvEntity, (cv) => cv.user, {
    nullable: true,
  })
  cvs: CvEntity[];
}
