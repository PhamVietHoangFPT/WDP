// src/@types/express-session/index.d.ts
import 'express-session' // Quan trọng: import để module augmentation hoạt động

// Giả sử bạn muốn lưu trữ bookingId (là string hoặc number)
// Nếu bạn muốn lưu toàn bộ PaymentBookingDto, hãy import kiểu đó
// import { PaymentBookingDto } from '../../path/to/your/dto/payment-booking.dto';

declare module 'express-session' {
  interface SessionData {
    currentBookingPayment?: string // Hoặc PaymentBookingDto nếu bạn lưu cả object
  }
}

// Nếu file này được coi là một module (ví dụ có các import/export khác),
// bạn có thể cần thêm dòng này để đảm bảo augmentation hoạt động đúng:
export {}
