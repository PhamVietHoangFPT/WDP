export interface IEmailService {
  sendUserWelcomeEmail(email: string, name: string): Promise<void>
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>
  testEmail(email: string): Promise<void>
}

export const IEmailService = Symbol('IEmailService')
