import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {softDeletePlugin} from 'soft-delete-plugin-mongoose';
import {CompaniesModule} from './companies/companies.module';
import {JwtAuthGuard} from './auth/jwt-auth.guard';
import {APP_GUARD} from '@nestjs/core';
import {JobsModule} from './jobs/jobs.module';
import {FilesModule} from './files/files.module';
import {ResumesModule} from './resumes/resumes.module';
import {PermissionsModule} from './permissions/permissions.module';
import {RolesModule} from './roles/roles.module';
import {DatabasesModule} from './databases/databases.module';
import {SubscribersModule} from './subscribers/subscribers.module';
import {MailModule} from './mail/mail.module';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {HealthModule} from './health/health.module';
import {FavoriteJobsModule} from './favorite-jobs/favorite-jobs.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: connection => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    FilesModule,
    ResumesModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    SubscribersModule,
    MailModule,
    ScheduleModule.forRoot(),
    HealthModule,
    FavoriteJobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
