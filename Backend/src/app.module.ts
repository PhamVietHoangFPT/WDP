import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { databaseConfig } from './config/database.config'
import { AccountModule } from './modules/account/account.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { SlotTemplateModule } from './modules/slotTemplate/slotTemplate.module'
import { SlotModule } from './modules/slot/slot.module'
import { SlotGenerationModule } from './modules/slotGenerator/slotGenerator.module'
import { ScheduleModule } from '@nestjs/schedule'
import { TestTakerModule } from './modules/testTaker/testTaker.module'
import { TestTakerRelationshipModule } from './modules/testTakerRelationship/testTakerRelationship.module'
@Module({
  imports: [
    databaseConfig,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AccountModule,
    AuthModule,
    SlotTemplateModule,
    SlotModule,
    SlotGenerationModule,
    TestTakerModule,
    TestTakerRelationshipModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
