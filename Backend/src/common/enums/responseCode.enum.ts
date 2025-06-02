/* eslint-disable @typescript-eslint/ban-ts-comment */
export enum responseCodeEnum {
  /**
   * Giao dịch thành công
   * English: Transaction successful
   */
  '00' = 'Giao dịch thành công',

  /**
   * Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).
   * English: Successful debit. Transaction suspected of fraud (related to scams, unusual transactions).
   */
  '07' = 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',

  /**
   * Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.
   * English: Transaction failed: Card/Account not registered for Internet Banking service at the bank.
   */
  '09' = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',

  /**
   * Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần
   * English: Transaction failed: Customer entered incorrect card/account verification information more than 3 times.
   */
  // @ts-ignore
  '10' = 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',

  /**
   * Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.
   * English: Transaction failed: Payment session expired. Please try the transaction again.
   */
  // @ts-ignore
  '11' = 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',

  /**
   * Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.
   * English: Transaction failed: Customer\'s card/account is locked.
   */
  // @ts-ignore
  '12' = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',

  /**
   * Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.
   * English: Transaction failed: You entered the incorrect transaction authentication password (OTP). Please try the transaction again.
   */
  // @ts-ignore
  '13' = 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',

  /**
   * Giao dịch không thành công do: Khách hàng hủy giao dịch
   * English: Transaction failed: Customer cancelled the transaction.
   */
  // @ts-ignore
  '24' = 'Giao dịch không thành công do: Khách hàng hủy giao dịch',

  /**
   * Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.
   * English: Transaction failed: Your account has insufficient funds to complete the transaction.
   */
  // @ts-ignore
  '51' = 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',

  /**
   * Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.
   * English: Transaction failed: Your account has exceeded the daily transaction limit.
   */ // @ts-ignore
  '65' = 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',

  /**
   * Ngân hàng thanh toán đang bảo trì.
   * English: The payment bank is under maintenance.
   */ // @ts-ignore
  '75' = 'Ngân hàng thanh toán đang bảo trì.',

  /**
   * Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch
   * English: Transaction failed: Customer entered incorrect payment password too many times. Please try the transaction again.
   */ // @ts-ignore
  '79' = 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',

  /**
   * Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)
   * English: Other errors (remaining errors, not in the listed error codes).
   */ // @ts-ignore
  '99' = 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
}
