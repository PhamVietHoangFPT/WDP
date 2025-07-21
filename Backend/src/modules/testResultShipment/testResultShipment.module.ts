import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TestResultShipment, TestResultShipmentSchema } from "./schemas/testResultShipment.schema";
import { AuthModule } from "../auth/auth.module";
import { TestResultShipmentController } from "./testResultShipment.controller";
import { ITestResultShipmentService } from "./interfaces/iTestResultShipment.service";
import { TestResultShipmentService } from "./testResultShipment.service";
import { ITestResultShipmentRepository } from "./interfaces/iTestResultShipment.repository";
import { TestResultShipmentRepository } from "./testResultShipment.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestResultShipment.name, schema: TestResultShipmentSchema },
    ]),
    AuthModule,
  ],
  controllers: [TestResultShipmentController],
  providers: [
    {
      provide: ITestResultShipmentService,
      useClass: TestResultShipmentService,
    },
    {
      provide: ITestResultShipmentRepository,
      useClass: TestResultShipmentRepository,
    },
  ],
  exports: [
    ITestResultShipmentRepository,
    ITestResultShipmentService,
    MongooseModule,
  ],
})
export class TestResultShipmentModule { }
