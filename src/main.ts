import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database/database';
import * as passport from 'passport';

const dataSource = new DataSource(dataSourceOptions);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  await dataSource.initialize();

  app.use(passport.initialize());

  const config = new DocumentBuilder()
    .setTitle('Evently API')
    .setDescription('The Evently backend API description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yml',
  });

  await app.listen(8000);
}
bootstrap();
