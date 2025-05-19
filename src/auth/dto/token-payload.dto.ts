import { User } from '@/users/entities/user.entity';

export class TokenPayloadDto {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  user: User;
}
