import {
  NestFactory,
} from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import {
  JwtSerializerMiddleware,
} from '@js-heap-inspector-gateway/common';
import {
  AppModule,
} from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(JwtSerializerMiddleware);

  const config = new DocumentBuilder()
    .setTitle('JS Heap Inspector')
    .setDescription('JS Heap Inspector API description')
    .setVersion('1.0')
    .addBearerAuth({type: 'http', scheme: 'bearer', bearerFormat: 'JWT'})
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
