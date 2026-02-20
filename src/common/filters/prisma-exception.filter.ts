import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  // ✅ Use 'protected' or nothing
  protected httpAdapterHost: HttpAdapterHost;

  constructor(httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
    this.httpAdapterHost = httpAdapterHost;
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let message = 'Database error';

    switch (exception.code) {
      case 'P2002':
        message = 'Unique constraint failed';
        break;
      default:
        message = exception.message;
    }

    httpAdapter.reply(
      response,
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: exception.meta || null,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
