import * as bcrypt from 'bcryptjs';

import { HashingContract } from '../contracts/hashing.contract';

export class BcryptAdapter implements HashingContract {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }
}
