import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {AwsEvent} from './event.model';
import {Logger} from 'angular2-logger/core';
import {EventType} from './eventtype.enum';
import 'rxjs/add/operator/filter';

@Injectable()
export class EventService {
  private subject = new Subject<AwsEvent>();

  constructor(private logger: Logger) {
  }

  sendEvent(type: EventType, payload?: any) {
    this.logger.debug('sendEvent(...): ', type, payload);
    this.subject.next(new AwsEvent(type, payload));
  }

  getObservable(): Observable<AwsEvent> {
    return this.subject.asObservable();
  }
}
