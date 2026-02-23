import {
  Module,
} from '@nestjs/common';
import {
  AuthModule,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/auth.module';
import {
  TypeOrmSetupModule,
} from '@js-heap-inspector-gateway/common/infrastructure';
import {
  MetricsModule,
} from '@js-heap-inspector-gateway/modules/metrics/metrics.module';
import {
  AppService,
} from './app.service';

@Module({
  imports: [
    AuthModule,
    MetricsModule,
    TypeOrmSetupModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule {}
