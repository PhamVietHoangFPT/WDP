import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
import {
  Facility,
  FacilityDocument,
} from 'src/modules/facility/schemas/facility.schema'
import { IDashboardRepository } from './interfaces/idashboard.repository'
@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
    @InjectModel(Facility.name)
    private readonly facilityModel: Model<FacilityDocument>,
  ) {}

  async getDashboardData(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' | 'quarter',
    facilityId?: string,
  ): Promise<any> {
    // --- GIAI ĐOẠN 1: XÂY DỰNG PIPELINE ---

    // Khởi tạo pipeline với bộ lọc theo khoảng thời gian
    const startDateISO = new Date(startDate)
    const endDateISO = new Date(endDate)
    // Các giai đoạn cơ bản
    const pipeline: any[] = [
      {
        $match: {
          created_at: { $gte: startDateISO, $lte: endDateISO },
        },
      },
    ]

    // Thêm các giai đoạn lọc theo cơ sở nếu facilityId được cung cấp
    if (facilityId) {
      pipeline.push(
        // Join với collection 'casemembers'
        {
          $lookup: {
            from: 'casemembers',
            localField: 'caseMember',
            foreignField: '_id',
            as: 'caseMemberDetails',
          },
        },
        // Bung mảng kết quả join, hoạt động như INNER JOIN
        { $unwind: '$caseMemberDetails' },
        // Join với collection 'samplingkitinventories'
        {
          $lookup: {
            from: 'samplingkitinventories',
            // ✅ SỬA LẠI TÊN TRƯỜNG Ở ĐÂY
            localField: 'caseMemberDetails.samplingKitInventory',
            foreignField: '_id',
            as: 'inventoryDetails',
          },
        },
        // Bung mảng kết quả join
        { $unwind: '$inventoryDetails' },
        // Lọc các hồ sơ theo cơ sở được chọn
        {
          $match: {
            'inventoryDetails.facility': new Types.ObjectId(facilityId),
          },
        },
      )
    }
    // --- GIAI ĐOẠN 2: CHUẨN BỊ DỮ LIỆU CHUNG CHO TẤT CẢ TÍNH TOÁN ---

    // Join với 'casemembers' và bung mảng 'testTaker'
    // Bước này chuẩn bị dữ liệu để có thể đếm bệnh nhân
    pipeline.push(
      {
        $lookup: {
          from: 'casemembers',
          localField: 'caseMember',
          foreignField: '_id',
          as: 'caseMemberDetails',
        },
      },
      {
        $unwind: {
          path: '$caseMemberDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$caseMemberDetails.testTaker',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Join với 'payments' để lấy thông tin thanh toán
      {
        $lookup: {
          from: 'payments',
          localField: 'payment',
          foreignField: '_id',
          as: 'paymentDetails',
        },
      },
      // Dùng unwind an toàn để không làm mất các hồ sơ chưa có thanh toán
      {
        $unwind: { path: '$paymentDetails', preserveNullAndEmptyArrays: true },
      },
    )

    let dateFormat: string
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-%V' // Năm-SốTuần (ISO)
        break
      case 'month':
        dateFormat = '%Y-%m' // Năm-Tháng
        break
      case 'quarter':
        // %Y-Q%q -> %q là toán tử mới trong MongoDB 5.0+
        // Nếu dùng bản cũ hơn, ta sẽ tính theo tháng rồi xử lý ở service
        dateFormat = '%Y-%m'
        break
      default:
        dateFormat = '%Y-%m-%d' // Mặc định theo ngày
    }

    // --- GIAI ĐOẠN 3: TÍNH TOÁN SONG SONG VỚI $facet ---
    // $facet cho phép chạy nhiều luồng tổng hợp con trên cùng một bộ dữ liệu đã lọc
    pipeline.push({
      $facet: {
        // Nhánh 1: Tính các chỉ số chính
        mainStats: [
          {
            $group: {
              _id: null,
              // Tính tổng doanh thu (totalFee + shippingFee) chỉ cho các giao dịch thành công
              totalRevenue: {
                $sum: {
                  $cond: {
                    if: { $eq: ['$paymentDetails.responseCode', '00'] },
                    then: {
                      // ✅ Cộng totalFee và shippingFee với nhau
                      $add: [
                        { $ifNull: ['$totalFee', 0] }, // Dùng ifNull để tránh lỗi nếu trường bị thiếu
                        { $ifNull: ['$shippingFee', 0] },
                      ],
                    },
                    else: 0,
                  },
                },
              },
              totalExtraFee: {
                $sum: {
                  $cond: [
                    { $eq: ['$paymentDetails.responseCode', '00'] },
                    '$shippingFee',
                    0,
                  ],
                },
              },
              // Đếm số bệnh nhân duy nhất từ các giao dịch thành công
              uniquePatients: {
                $addToSet: {
                  $cond: [
                    { $eq: ['$paymentDetails.responseCode', '00'] },
                    '$caseMemberDetails.testTaker', // Giờ đây là ID của một testTaker
                    null, // Không thêm gì nếu thanh toán thất bại
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalRevenue: 1,
              totalExtraFee: 1,
              // Đếm số lượng bệnh nhân sau khi đã lọc bỏ các giá trị null
              totalPatients: {
                $size: {
                  $filter: {
                    input: '$uniquePatients',
                    as: 'patient',
                    cond: { $ne: ['$$patient', null] },
                  },
                },
              },
            },
          },
        ],
        // Nhánh 2: Đếm tổng số hồ sơ dịch vụ
        totalServiceCases: [{ $count: 'count' }],
        // Nhánh 3: Thống kê doanh thu theo ngày để vẽ biểu đồ
        revenueByDate: [
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: '$created_at' },
              },
              totalRevenueByDate: {
                $sum: {
                  $cond: {
                    if: { $eq: ['$paymentDetails.responseCode', '00'] },
                    then: {
                      // ✅ Cộng totalFee và shippingFee với nhau
                      $add: [
                        { $ifNull: ['$totalFee', 0] }, // Dùng ifNull để tránh lỗi nếu trường bị thiếu
                        { $ifNull: ['$shippingFee', 0] },
                      ],
                    },
                    else: 0,
                  },
                },
              },
              totalExtraFeeByDate: {
                $sum: {
                  $cond: [
                    { $eq: ['$paymentDetails.responseCode', '00'] },
                    '$shippingFee',
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: '$_id',
              totalRevenueByDate: 1,
              totalExtraFeeByDate: 1,
            },
          },
        ],
        // Nhánh 4: Thống kê số lượng hồ sơ theo ngày để vẽ biểu đồ
        serviceCasesByDate: [
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: '$created_at' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ],
        // Nhánh 5: Thống kê số lượng thanh toán thành công và thất bại
        paymentStats: [
          {
            $group: {
              _id: null,
              // Đếm nếu responseCode là '00'
              successfulPayments: {
                $sum: {
                  $cond: [
                    { $eq: ['$paymentDetails.responseCode', '00'] },
                    1,
                    0,
                  ],
                },
              },
              // Đếm nếu responseCode tồn tại và KHÁC '00'
              failedPayments: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$paymentDetails.responseCode', null] },
                        { $ne: ['$paymentDetails.responseCode', '00'] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              successfulPayments: 1,
              failedPayments: 1,
            },
          },
        ],
        // Nhánh 6: Đếm số lượng bệnh nhân quay lại
        returningPatients: [
          // Bước 1: Chỉ lọc các giao dịch thành công
          {
            $match: {
              'paymentDetails.responseCode': '00',
            },
          },
          // Bước 3: Gom nhóm theo ID của testTaker và đếm số lần xuất hiện
          {
            $group: {
              _id: '$caseMemberDetails.testTaker',
              count: { $sum: 1 },
            },
          },
          // Bước 4: Lọc ra những người có số lần xuất hiện > 1
          {
            $match: {
              count: { $gt: 1 },
            },
          },
          // Bước 5: Đếm tổng số người quay lại
          {
            $count: 'count',
          },
        ],
      },
    })

    // --- GIAI ĐOẠN 4: THỰC THI QUERY VÀ TRẢ VỀ KẾT QUẢ ---
    const [dashboardResult, totalFacilities] = await Promise.all([
      this.serviceCaseModel.aggregate(pipeline),
      this.facilityModel.countDocuments(), // Lấy tổng số cơ sở trong toàn hệ thống
    ])

    const rawData = dashboardResult[0]

    const stats = rawData.mainStats[0] || {}
    const totalCases = rawData.totalServiceCases[0]?.count || 0
    const paymentStats = rawData.paymentStats[0] || {
      successfulPayments: 0,
      failedPayments: 0,
    }
    const returningPatientsCount = rawData.returningPatients[0]?.count || 0
    const finalResponse = {
      totalRevenue: stats.totalRevenue || 0,
      totalExtraFee: stats.totalExtraFee || 0,
      totalServiceCases: totalCases,
      totalPatients: stats.totalPatients || 0,
      returningPatients: returningPatientsCount,
      totalFacilities: totalFacilities,
      revenueByDate: rawData.revenueByDate || [],
      serviceCasesByDate: rawData.serviceCasesByDate || [],
      successfulPayments: paymentStats.successfulPayments,
      failedPayments: paymentStats.failedPayments,
    }

    return finalResponse
  }
}
