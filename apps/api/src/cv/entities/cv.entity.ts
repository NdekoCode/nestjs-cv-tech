import { TimestampEntity } from 'generics/entities/timestamp.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({
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

  // Ici on dit que on a plusieurs CV pour un seul utilisateur
  @ManyToOne((type) => UserEntity, (user) => user.cvs, {
    cascade: ['remove', 'recover', 'insert'], // En supprimant un utilisateur ses cv aussi seront supprimer, en modifiant un utilisateur cela sera aussi visible sur les cv.
    /**
     * Donc:
     * -  Quand tu ajoutes un utilisateur avec des CVs inclus, les CVs seront aussi automatiquement insérés sans faire un save() séparé.
     * - 'remove' → Quand tu supprimes un utilisateur, ses CVs seront aussi supprimés.
     * - 'recover' → Si tu fais un soft-delete, tu pourras restaurer l’utilisateur avec ses CVs.
     */

    eager: true, // Si vous demander un CV, il viendra avec les donnees de l'utilisateur
    nullable: true,
  })
  user: UserEntity;
}
