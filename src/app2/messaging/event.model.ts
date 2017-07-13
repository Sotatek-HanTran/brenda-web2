import {EventType} from './eventtype.enum';

export class AwsEvent {
  type: EventType;
  message: string;
  payload: any;

  constructor(type: EventType, message: string, payload: any) {
    if (type == null || message == null) {
    }
    this.type = type;
    this.message = message;
    this.payload = payload;
  }
}
