import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';

@Injectable()
export class TestEnvironmentGuard implements CanActivate {
  canActivate(): boolean {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      return true;
    }
    throw new NotFoundException(
      'This route is only available in the test environment',
    );
  }
}
