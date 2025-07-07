export interface IEmailService {
  sendUserWelcomeEmail(email: string, name: string): Promise<void>
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>
  testEmail(email: string): Promise<void>
  sendEmailForResult(
    customerId: string,
    adnPercentage: string,
    doctorId: string,
    conclusion: string,
  ): Promise<void>
  sendEmailNotificationForCheckIn(
    customerId: string,
    bookingId: string,
  ): Promise<void>
}

export const IEmailService = Symbol('IEmailService')
