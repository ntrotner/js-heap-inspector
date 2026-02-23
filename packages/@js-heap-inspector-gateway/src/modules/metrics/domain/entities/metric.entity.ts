import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  MetricName,
  MetricType,
} from '@js-heap-inspector-gateway/modules/metrics/domain';
import {
  User,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';

/**
 * Metric type enum.
 */
export enum MetricTypeEnum {
  MEMORY = 'MEMORY',
  CPU = 'CPU',
  DISK = 'DISK',
  NETWORK = 'NETWORK',
  CUSTOM = 'CUSTOM',
}

/**
 * Represents a metric in the system.
 */
@Entity()
export class Metric {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column(() => MetricName)
    name: MetricName;

  @Column(() => MetricType)
    type: MetricType;

  @ManyToOne(() => User)
    user: User;

  @CreateDateColumn()
    creationDate: Date;

  /**
   * Creates a new Metric instance.
   *
   * @param {Object} properties - Metric properties.
   */
  public static create(properties: {
    id: string;
    name: MetricName;
    type: MetricType;
    user: User;
    creationDate: Date;
  }): Metric {
    const metric = new Metric();
    metric.id = properties.id;
    metric.name = properties.name;
    metric.type = properties.type;
    metric.user = properties.user;
    metric.creationDate = properties.creationDate;

    return metric;
  }

  /**
   * Returns the user.
   *
   * @return {User} The user.
   */
  public getUser(): User {
    return this.user;
  }

  /**
   * Returns the metric name.
   *
   * @return {string} The metric name.
   */
  public getName(): string {
    return this.name.getValue();
  }

  /**
   * Returns the metric type.
   *
   * @return {string} The metric type.
   */
  public getType(): string {
    return this.type.getValue();
  }

  /**
   * Returns the creation date.
   *
   * @return {Date} The creation date.
   */
  public getCreationDate(): Date {
    return this.creationDate;
  }

  /**
   * Sets the metric name.
   *
   * @param {MetricName} name - The metric name value object.
   */
  public setName(name: MetricName): void {
    this.name = name;
  }

  /**
   * Sets the metric type.
   *
   * @param {MetricType} type - The metric type value object.
   */
  public setType(type: MetricType): void {
    this.type = type;
  }
}
