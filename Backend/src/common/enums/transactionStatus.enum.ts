export enum transactionStatusEnum {
  /**
   * Giao dịch thành công
   * English: Transaction successful
   */
  '00' = 'Giao dịch thành công',

  /**
   * Giao dịch chưa hoàn tất
   * English: Transaction not yet completed / Pending
   */
  '01' = 'Giao dịch chưa hoàn tất',

  /**
   * Giao dịch bị lỗi
   * English: Transaction failed / Error
   */
  '02' = 'Giao dịch bị lỗi',

  /**
   * Giao dịch đảo
   * (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)
   * English: Transaction reversed (Customer was debited by the bank, but VNPAY transaction was not successful)
   */
  '04' = 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',

  /**
   * VNPAY đang xử lý giao dịch này (GD hoàn tiền)
   * English: VNPAY is processing this transaction (Refund transaction)
   */
  '05' = 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',

  /**
   * VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)
   * English: VNPAY has sent a refund request to the bank (Refund transaction)
   */
  '06' = 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',

  /**
   * Giao dịch bị nghi ngờ gian lận
   * English: Transaction suspected of fraud
   */
  '07' = 'Giao dịch bị nghi ngờ gian lận',

  /**
   * GD Hoàn trả bị từ chối
   */
  '09' = 'GD Hoàn trả bị từ chối',
}
