import { TimestampEntity } from 'generics/entities/timestamp.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cv')
export class CvEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('varchar', { length: 100 })
  firstName: string;
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column( {
    unique: true,
  })
  email: string;

  @Column({
    type: 'int',
    update: false,
  })
  age: number;

  @Column('int', {
    nullable: true,
  })
  cin: number;

  @Column()
  job: string;

  @Column({
    nullable: true,
  })
  path: string;
  @Column()
  description: string;
}
