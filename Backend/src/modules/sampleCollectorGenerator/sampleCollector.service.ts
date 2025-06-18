/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Account, AccountDocument } from '../account/schemas/account.schema'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
import { Role } from '../role/schemas/role.schema'

@Injectable()
export class SampleCollectorService {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseRepository: Model<ServiceCaseDocument>,
    @InjectModel(Role.name)
    private readonly roleRepository: Model<Role>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(TestRequestStatus.name)
    private testRequestStatusModel: Model<TestRequestStatusDocument>,
  ) {}

  async assignJob() {
    // ---- GIAI ĐOẠN 1: Lấy tất cả dữ liệu cần thiết một cách song song ----

    const [paidStatus, sampleCollectorRole] = await Promise.all([
      this.testRequestStatusModel
        .findOne({
          testRequestStatus:
            'Đã thanh toán. Chờ đến lịch hẹn đến cơ sở để check-in (nếu quý khách chọn lấy mẫu tại nhà, không cần đến cơ sở để check-in)',
        })
        .select('_id')
        .lean()
        .exec(),
      this.roleRepository.findOne({ role: 'Sample Collector' }).select('_id'),
    ])

    if (!paidStatus) {
      console.log('Không tìm thấy trạng thái "Đã thanh toán".')
      return
    }

    if (!sampleCollectorRole) {
      console.log('Không tìm thấy vai trò "Sample Collector".')
      return
    }

    // ---- GIAI ĐOẠN 2: Lấy danh sách nhân viên thu mẫu và nhóm họ theo cơ sở (facility) ----

    const collectorsByFacility = await this.accountModel.aggregate([
      // Lọc các tài khoản là nhân viên thu mẫu
      { $match: { role: sampleCollectorRole._id } },
      // Nhóm các nhân viên theo cơ sở của họ
      {
        $group: {
          _id: '$facility', // Nhóm theo facility ID
          collectors: { $push: '$_id' }, // Đưa các ID nhân viên vào một mảng
        },
      },
    ])

    // Chuyển kết quả sang dạng Map để truy vấn nhanh hơn: { facilityId => [collectorId1, collectorId2] }
    const facilityCollectorMap = new Map<string, any[]>()
    for (const group of collectorsByFacility) {
      facilityCollectorMap.set(group._id.toString(), group.collectors)
    }

    if (facilityCollectorMap.size === 0) {
      throw new NotFoundException('Không có nhân viên thu mẫu nào.')
    }

    // ---- GIAI ĐOẠN 3: Lấy tất cả service case cần gán việc và thông tin cơ sở của chúng ----

    const casesToAssign = await this.serviceCaseRepository.aggregate([
      // Chỉ lấy những case chưa được gán nhân viên và đã thanh toán
      {
        $match: {
          testRequestStatus: paidStatus._id,
          sampleCollector: { $exists: false },
        },
      },
      // Kết nối (JOIN) với bảng CaseMember
      {
        $lookup: {
          from: 'casemembers',
          localField: 'caseMember',
          foreignField: '_id',
          as: 'caseMemberInfo',
        },
      },
      { $unwind: '$caseMemberInfo' },
      // Lọc các case là "thu mẫu tại nhà"
      { $match: { 'caseMemberInfo.isAtHome': true } },
      // Kết nối với bảng Booking
      {
        $lookup: {
          from: 'bookings',
          localField: 'caseMemberInfo.booking',
          foreignField: '_id',
          as: 'bookingInfo',
        },
      },
      { $unwind: '$bookingInfo' },
      // Kết nối với bảng Slot
      {
        $lookup: {
          from: 'slots',
          localField: 'bookingInfo.slot',
          foreignField: '_id',
          as: 'slotInfo',
        },
      },
      { $unwind: '$slotInfo' },
      // Kết nối với bảng SlotTemplate
      {
        $lookup: {
          from: 'slottemplates',
          localField: 'slotInfo.slotTemplate',
          foreignField: '_id', // <-- ĐÃ SỬA LỖI Ở ĐÂY (xóa dấu chấm thừa)
          as: 'slotTemplateInfo',
        },
      },
      { $unwind: '$slotTemplateInfo' },
      // Chọn ra các trường cần thiết
      {
        $project: {
          _id: 1,
          facilityId: '$slotTemplateInfo.facility',
        },
      },
    ])

    if (casesToAssign.length === 0) {
      throw new NotFoundException('Không có hồ sơ nào cần gán việc.')
    }

    // ---- GIAI ĐOẠN 4: Thực hiện logic gán việc và chuẩn bị cho việc cập nhật ----

    const bulkUpdateOperations = []
    const newBookingStatus = await this.testRequestStatusModel.findOne({
      testRequestStatus: 'Chờ xử lý',
    })

    // Để cân bằng tải, ta sẽ theo dõi index của nhân viên đã được gán cuối cùng cho mỗi cơ sở
    const roundRobinIndex = new Map<string, number>()

    for (const serviceCase of casesToAssign) {
      const facilityId = serviceCase.facilityId.toString()
      const availableCollectors = facilityCollectorMap.get(facilityId)

      // Nếu có nhân viên cho cơ sở này
      if (availableCollectors && availableCollectors.length > 0) {
        // Lấy index hiện tại cho cơ sở này, nếu chưa có thì là 0
        const currentIndex = roundRobinIndex.get(facilityId) || 0

        const assignedCollectorId = availableCollectors[currentIndex]

        // Chuẩn bị câu lệnh update cho service case này
        bulkUpdateOperations.push({
          updateOne: {
            filter: { _id: serviceCase._id },
            update: {
              $set: {
                sampleCollector: assignedCollectorId,
                bookingStatus: newBookingStatus._id, // Hoặc testRequestStatus
                updatedAt: new Date(),
              },
            },
          },
        })

        // Cập nhật index cho lần gán tiếp theo (quay vòng)
        roundRobinIndex.set(
          facilityId,
          (currentIndex + 1) % availableCollectors.length,
        )
      }
    }

    // ---- GIAI ĐOẠN 5: Thực thi cập nhật hàng loạt ----
    if (bulkUpdateOperations.length > 0) {
      await this.serviceCaseRepository.bulkWrite(bulkUpdateOperations)
      console.log(`Đã gán thành công ${bulkUpdateOperations.length} công việc.`)
    } else {
      console.log(
        'Không có công việc nào được gán (có thể do không tìm thấy nhân viên phù hợp).',
      )
    }
  }
}
