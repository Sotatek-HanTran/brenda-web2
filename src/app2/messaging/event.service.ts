import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AwsEvent } from './event.model';

@Injectable()
export class EventService {
  private subject = new Subject<any>();

  sendEvent(event: AwsEvent) {
    this.subject.next({ event: AwsEvent });
  }

  getObservable(): Observable<AwsEvent> {
    return this.subject.asObservable();
  }
}
