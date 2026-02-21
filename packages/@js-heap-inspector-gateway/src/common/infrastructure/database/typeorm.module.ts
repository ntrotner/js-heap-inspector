import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import {
  type DynamicModule,
} from '@nestjs/common';

export class TypeOrmSetupModule {
  public static forRoot(): DynamicModule {
    return TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'js-heap-inspector',
      entities: [],
      synchronize: true,
    });
  }
}
