export type EventListenerCallback = ((event: any, eventName?: string) => any)|Function;

export interface IListenerItem
{
    element: EventTarget;
    eventName: string;
    debounceValue: number;
    filter: (event: any, eventName?: string) => boolean;
    originalCallback: EventListenerCallback;
    callback: EventListenerOrEventListenerObject;
    subscribe(): void;
    unsubscribe(): void;
}

export interface IListener
{
    events: string[];
    elements: EventTarget[];
    items: IListenerItem[];
    params: EventListenerParams;
    unsubscribe(): void;
}

export interface EventListenerParams
{
    elements: EventTarget|NodeListOf<any>|EventTarget[];
    events: string;
    callback: EventListenerCallback;
    once?: boolean;
    debounce?: number;
    filter?: (event: any, eventName?: string) => boolean;
    listeners?: any[];
}
