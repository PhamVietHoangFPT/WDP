/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Slot, SlotDocument } from '../slot/schemas/slot.schema'
import { ISlotService } from '../slot/interfaces/islot.service'
import { ISlotTemplateRepository } from '../slotTemplate/interfaces/islotTemplate.repository'

@Injectable()
export class SlotGenerationService {
  private readonly logger = new Logger(SlotGenerationService.name)
  private readonly DEFAULT_HORIZON_DAYS = 30

  constructor(
    @Inject(ISlotTemplateRepository)
    private slotTemplateRepository: ISlotTemplateRepository,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    // @Inject(IFacilityService)
    // private readonly facilityService: IFacilityService,
    @Inject(ISlotService)
    private readonly slotService: ISlotService,
  ) {}

  // Cron job chạy hàng ngày
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'dailySlotGeneration',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleScheduledSlotGeneration() {
    this.logger.log(`[CRON] Bắt đầu tác vụ tự động tạo slot hàng ngày...`)
    const result = await this.triggerSlotGeneration(this.DEFAULT_HORIZON_DAYS)
    this.logger.log(
      `[CRON] Hoàn tất tác vụ. Slots đã tạo: ${result.createdCount}. Lỗi (nếu có): ${result.errors.length}.`,
    )
  }

  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'cleanupOverdueUnbookedSlotsHourly', // Đổi tên job một chút cho rõ ràng (tùy chọn)
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleHourlyOverdueSlotCleanup() {
    this.logger.log(`[CRON] Bắt đầu tác vụ dọn dẹp slot quá hạn hàng giờ...`)
    await this.handleOverdueSlotCleanup()
  }

  public async handleOverdueSlotCleanup() {
    this.logger.log(
      'Bắt đầu tác vụ XÓA các slot quá hạn chưa được đặt (chạy hàng giờ)...',
    )

    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    )
    console.log(startOfToday)
    // Phần 1: XÓA các slot của những ngày TRƯỚC ngày hiện tại
    try {
      const deleteResult = await this.slotModel
        .deleteMany({
          isBooked: false,
          slotDate: { $lt: startOfToday },
        })
        .exec()

      // Sử dụng "deletedCount" thay vì "modifiedCount"
      if (deleteResult.deletedCount > 0) {
        this.logger.log(
          // Cập nhật log để phản ánh đúng hành động
          `(Hàng giờ) Đã XÓA VĨNH VIỄN ${deleteResult.deletedCount} slot quá hạn (từ các ngày trước) chưa được đặt.`,
        )
      }
    } catch (error) {
      this.logger.error(
        '(Hàng giờ) Lỗi khi XÓA slot của các ngày trước:',
        error,
      )
    }
    const currentUTCDayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
    // Phần 2: XÓA các slot của NGÀY HÔM NAY đã qua thời gian kết thúc
    const todaysUnbookedSlots = await this.slotModel
      .find({
        isBooked: false,
        slotDate: currentUTCDayStart,
      })
      .exec()

    if (todaysUnbookedSlots.length === 0) {
      this.logger.log(
        '(Hàng giờ) Không có slot nào của ngày hôm nay (chưa XÓA) cần dọn dẹp thêm.',
      )
      this.logger.log('(Hàng giờ) Hoàn tất tác vụ dọn dẹp slot.')
      return
    }

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const slotIdsToSoftDeleteToday: string[] = []

    for (const slot of todaysUnbookedSlots) {
      if (slot.endTime) {
        try {
          const [endHour, endMinute] = slot.endTime.split(':').map(Number)
          if (
            currentHour > endHour ||
            (currentHour === endHour && currentMinute >= endMinute)
          ) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            slotIdsToSoftDeleteToday.push(slot._id.toString())
          }
        } catch (e) {
          this.logger.error(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            `(Hàng giờ) Lỗi khi xử lý endTime '${slot.endTime}' cho slot ${slot._id.toString()}: ${e.message}`,
          )
        }
      }
    }

    if (slotIdsToSoftDeleteToday.length > 0) {
      try {
        const resultToday = await this.slotModel
          .deleteMany({
            _id: { $in: slotIdsToSoftDeleteToday },
          })
          .exec()
        this.logger.log(
          `(Hàng giờ) Đã XÓA ${resultToday.deletedCount} slot quá hạn (trong ngày hôm nay) chưa được đặt.`,
        )
      } catch (error) {
        this.logger.error(
          '(Hàng giờ) Lỗi khi XÓA slot của ngày hôm nay:',
          error,
        )
      }
    } else {
      this.logger.log(
        '(Hàng giờ) Không có slot nào của ngày hôm nay (đã được kiểm tra và chưa XÓA) đã quá hạn và chưa được đặt.',
      )
    }
    this.logger.log('(Hàng giờ) Hoàn tất tác vụ dọn dẹp slot.')
  }

  // Phương thức public để có thể gọi từ controller (hoặc cron)
  public async triggerSlotGeneration(
    daysToGenerate?: number,
    forceStartDateStr?: string, // YYYY-MM-DD
  ): Promise<{
    message: string
    createdCount: number
    templatesProcessed: number
    daysScanned: number
    errors: string[]
  }> {
    const horizon =
      daysToGenerate && daysToGenerate > 0
        ? daysToGenerate
        : this.DEFAULT_HORIZON_DAYS
    let startDate: Date

    if (forceStartDateStr) {
      const parsedDate = new Date(forceStartDateStr)
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException(
          'Định dạng startDate không hợp lệ. Vui lòng dùng YYYY-MM-DD.',
        )
      }
      if (parsedDate < new Date()) {
        throw new BadRequestException(
          'Ngày bắt đầu không được nhỏ hơn ngày hiện tại.',
        )
      }
      startDate = new Date(
        Date.UTC(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth(),
          parsedDate.getUTCDate(),
        ),
      )
    } else {
      const today = new Date()
      startDate = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      )
    }

    this.logger.log(
      `[MANUAL/SCHEDULED] Bắt đầu tạo slot. Horizon: ${horizon} ngày. Từ ngày: ${startDate.toISOString().split('T')[0]}`,
    )

    const templates = await this.slotTemplateRepository.find({
      isActive: true,
      deleted_at: null,
    }) // Chỉ lấy các template chưa bị xóa mềm

    if (!templates || templates.length === 0) {
      const msg =
        'Không tìm thấy SlotTemplate nào (hoặc không có template active) để xử lý.'
      this.logger.log(`[MANUAL/SCHEDULED] ${msg}`)
      return {
        message: msg,
        createdCount: 0,
        templatesProcessed: 0,
        daysScanned: 0,
        errors: [],
      }
    }

    const allProvisionalSlotsToCreate: Omit<
      Slot,
      '_id' | 'isBooked' | 'createdAt' | 'updatedAt' | 'id'
    >[] = []
    let daysScanned = 0

    for (let i = 0; i < horizon; i++) {
      daysScanned++
      const targetDate = new Date(startDate)
      targetDate.setUTCDate(startDate.getUTCDate() + i)
      const dayOfWeekForTargetDate = targetDate.getUTCDay()

      for (const template of templates) {
        const activeDaysInTemplate = this.checkIsSunday(template.isSunday)
        if (!activeDaysInTemplate.includes(dayOfWeekForTargetDate)) {
          continue
        }

        const existingSlotsCount = await this.slotModel
          .countDocuments({
            slotTemplate: template._id,
            slotDate: targetDate,
          })
          .exec()

        if (existingSlotsCount > 0) {
          continue
        }

        const provisionalSlotsForDay =
          this.slotService.generateTimeSlotsForTemplateDay(
            {
              _id: template._id,
              workTimeStart: template.workTimeStart,
              workTimeEnd: template.workTimeEnd,
              slotDuration: template.slotDuration,
            },
            targetDate,
          )

        if (provisionalSlotsForDay.length > 0) {
          allProvisionalSlotsToCreate.push(...provisionalSlotsForDay)
        }
      }
    }

    let createdCount = 0
    const errors: string[] = []
    if (allProvisionalSlotsToCreate.length > 0) {
      try {
        const result = await this.slotModel.insertMany(
          allProvisionalSlotsToCreate,
          { ordered: false },
        )
        createdCount = result.length // Số lượng documents thực sự được insert
        this.logger.log(
          `[MANUAL/SCHEDULED] Đã tạo thành công ${createdCount} slots mới.`,
        )
      } catch (error) {
        this.logger.error(
          '[MANUAL/SCHEDULED] Lỗi khi insert nhiều slots:',
          error.message,
        )
        if (error.writeErrors) {
          error.writeErrors.forEach((err) =>
            errors.push(`Lỗi ghi slot: ${err.errmsg}`),
          )
        } else {
          errors.push(error.message)
        }
      }
    } else {
      this.logger.log('[MANUAL/SCHEDULED] Không có slot mới nào cần được tạo.')
    }

    const message = `Hoàn tất tạo slot. ${createdCount} slots đã được tạo. ${errors.length} lỗi.`
    this.logger.log(`[MANUAL/SCHEDULED] ${message}`)
    return {
      message,
      createdCount,
      templatesProcessed: templates.length,
      daysScanned,
      errors,
    }
  }

  private checkIsSunday(isSunday: boolean): number[] {
    if (typeof isSunday !== 'boolean') {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Input không hợp lệ cho checkIsSunday: ${isSunday}. Mong đợi kiểu boolean.`,
      )
      return []
    }

    return isSunday ? [null] : [1, 2, 3, 4, 5, 6] // Chủ Nhật là 0
  }
}
