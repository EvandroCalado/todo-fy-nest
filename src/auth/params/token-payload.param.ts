import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request } from 'express';

import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constant';

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request: Request & { [REQUEST_TOKEN_PAYLOAD_KEY]: string } =
      context.getRequest();

    return request[REQUEST_TOKEN_PAYLOAD_KEY];
  },
);
