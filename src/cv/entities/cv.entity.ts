import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cv')
export class CvEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('varchar', { length: 100 })
  firstName: string;
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column('varchar', {
    unique: true,
  })
  email: string;

  @Column({
    type: 'int',
    update: false, // une colonne qui ne sera pas mise à jour
  })
  age: number;

  @Column('int')
  cin: number;

  @Column()
  job: string;

  @Column()
  path: string;
}
