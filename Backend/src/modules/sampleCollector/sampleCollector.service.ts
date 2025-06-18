import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { IRoleRepository } from '../role/interfaces/irole.repository'
import { Account, AccountDocument } from '../account/schemas/account.schema'
import { Facility } from '../facility/schemas/facility.schema'
import {
  CaseMember,
  CaseMemberDocument,
} from '../caseMember/schemas/caseMember.schema'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
import { Booking, BookingDocument } from '../booking/schemas/booking.schema'

@Injectable()
export class SampleCollectorService {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseRepository: Model<ServiceCaseDocument>,
    @InjectModel(CaseMember.name)
    private readonly caseMemberModel: Model<CaseMemberDocument>,
    @InjectModel(Booking.name)
    private readonly bookingRepository: Model<BookingDocument>,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Facility.name) private facilityModel: Model<Facility>,
    @InjectModel(TestRequestStatus.name)
    private testRequestStatusModel: Model<TestRequestStatusDocument>,
  ) {}

  async assignJob() {
    // Lay tai khoan cua nhung nguoi thu mau
    const roleId = await this.roleRepository.getRoleIdByName('Sample Collector')
    const accounts = await this.accountModel
      .find({ role: roleId })
      .select('_id facility')
      .exec()
    const accountIds = accounts.map((account) => {
      return { id: account._id, facility: account.facility }
    })
    // Lay danh sach nhung ho so thu mau tai nha
    const caseMembersAtHome = await this.caseMemberModel
      .find({ isAtHome: true })
      .select('_id booking')
      .exec()
    const caseMemberIds = caseMembersAtHome.map((caseMember) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        id: caseMember._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        booking: caseMember.booking.toString(),
      }
    })
    // Lay cac test request status cua nhung ho so thu mau tai nha la da thanh toan
    const testRequestStatusId = await this.testRequestStatusModel
      .findOne({
        testRequestStatus:
          'Đã thanh toán. Chờ đến lịch hẹn đến cơ sở để check-in (nếu quý khách chọn lấy mẫu tại nhà, không cần đến cơ sở để check-in)',
      })
      .select('_id')
      .exec()
    // Lay cac service case cua nhung ho so thu mau tai nha la da thanh toan
    const serviceCases = await this.serviceCaseRepository.find({
      caseMember: { $in: caseMemberIds },
      testRequestStatus: testRequestStatusId._id,
    })

    const bookingDate = this.bookingRepository.find({
      _id: caseMemberIds.map((caseMember) => caseMember.booking),
    })
  }
}
