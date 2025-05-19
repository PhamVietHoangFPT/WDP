import * as bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return await bcrypt.hash(password, salt)
}
