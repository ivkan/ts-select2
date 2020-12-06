import { EventListenerCallback, IListenerItem } from './types';
import { debounce } from '../debounce';

export class ListenerItem implements IListenerItem
{
    element: EventTarget;
    eventName: string;
    debounceValue: number;
    filter: (event: any, eventName?: string) => boolean;
    originalCallback: EventListenerCallback;
    callback: EventListenerOrEventListenerObject;
    once: boolean;
    stopped: boolean;

    constructor(
        element: EventTarget,
        callback: EventListenerCallback,
        event: string,
        debounceValue: number,
        filter: (event: any, eventName?: string) => boolean,
        once: boolean
    )
    {
        this.element          = element;
        this.originalCallback = callback;
        this.eventName        = event;
        this.debounceValue    = debounceValue;
        this.filter           = filter;
        this.once             = once;
        this.callback         = this.createCallback();
    }

    subscribe(): void
    {
        this.stopped = false;
        this.element.addEventListener(this.eventName, this.callback);
    }

    unsubscribe(): void
    {
        this.element.removeEventListener(this.eventName, this.callback);
        this.stopped = true;
    }

    private createCallback(): EventListenerOrEventListenerObject
    {
        const listener = (event) =>
        {
            if (typeof this.filter === 'function' && !this.filter(event, this.eventName))
            {
                return;
            }
            this.originalCallback(event, this.eventName);

            if (this.once)
            {
                this.unsubscribe();
            }
        };

        return typeof this.debounceValue === 'number' ? debounce(listener, this.debounceValue) : listener;
    }
}
