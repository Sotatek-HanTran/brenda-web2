import {EventType} from './eventtype.enum';

export class AwsEvent {
  type: EventType;
  payload: any;

  constructor(type: EventType, payload: any) {
    if (!type) {
      throw new Error('AwsEvent constructor called with NULL type');
    }
    this.type = type;
    this.payload = payload;
  }
}
