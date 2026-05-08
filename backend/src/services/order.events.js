import { EventEmitter } from "events";

export const orderEvents = new EventEmitter();
orderEvents.setMaxListeners(20);
