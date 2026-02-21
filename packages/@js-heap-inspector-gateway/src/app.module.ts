import {
  Module,
} from '@nestjs/common';
import {
  AppController,
} from './app.controller';
import {
  AppService,
} from './app.service';
import {
  AuthModule,
} from './modules/auth/auth.module';
import {
  TypeOrmSetupModule,
} from './common/infrastructure/database/typeorm.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmSetupModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
