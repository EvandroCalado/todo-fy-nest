import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  REQUEST_TOKEN_PAYLOAD_KEY,
  ROUTE_POLICY_KEY,
} from '../constants/auth.constant';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { RoutePolicies } from '../enum/route-policies.enum';

@Injectable()
export class AdminPolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const routePolicyRequired = this.reflector.getAllAndOverride<
      RoutePolicies | undefined
    >(ROUTE_POLICY_KEY, [context.getHandler(), context.getClass()]);

    if (!routePolicyRequired) return true;

    const request: Request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;

    if (!tokenPayload) throw new UnauthorizedException('Token not found');

    const { user } = tokenPayload;

    if (user.role !== routePolicyRequired) {
      throw new UnauthorizedException(
        'User not authorized to access this route.',
      );
    }

    return true;
  }
}
