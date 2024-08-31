import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mongodbConfig from '../configs/mongodb.config';
import { databaseConnectionProviders } from './database-connection.providers';
import { databaseModelsProviders } from './database-models.providers';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [ConfigModule.forFeature(mongodbConfig), MongooseModule.forRoot('mongodb://localhost/example')],
    providers: [...databaseConnectionProviders, ...databaseModelsProviders],
    exports: [...databaseConnectionProviders, ...databaseModelsProviders],
})
export class DatabaseModule { }
