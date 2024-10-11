import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { RequestWithUser } from './interfaces/request-with-user.interface';

import { EventService } from './event.service';

@Injectable()
export class EventOwnerGuard implements CanActivate {
  constructor(private readonly eventService: EventService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const eventId = req.params.id;

        if (!eventId) {
          const res = await this.eventService.findOne(req.params.eventId);
          resolve(res.ownerId.equals(req.user.id));
        }

        const event = await this.eventService.findOne(eventId);

        if (event.ownerId.equals(req.user.id)) {
          resolve(true);
        }

        resolve(false);
      } catch (e) {}
    });
  }
}
