import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import {
  Metric,
} from './metric.entity';

/**
 * TypeORM entity for MetricValue.
 */
@Entity()
export class MetricValue {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column()
    metricId: string;

  @Column('longblob')
    value: Buffer;

  @Column()
    size: number;

  @CreateDateColumn()
    creationDate: Date;

  @ManyToOne(() => Metric, {onDelete: 'CASCADE'})
    metric: Metric;
}
