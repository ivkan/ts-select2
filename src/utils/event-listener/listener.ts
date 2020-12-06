import { ListenerItem } from './listener-item';
import { EventListenerParams, IListener } from './types';
import { getElements, getEvents } from './utils';
import { isFunction } from '../is-function';

export class Listener implements IListener
{
    events: string[];
    elements: EventTarget[];
    items: ListenerItem[];
    params: EventListenerParams;

    constructor(params: EventListenerParams)
    {
        this.events   = getEvents(params.events);
        this.elements = getElements(params.elements);
        this.params   = params;
        this.createItems();
        this.subscribe();

        if (Array.isArray(params.listeners))
        {
            params.listeners.push(this);
        }
    }

    unsubscribe(): void
    {
        for (let i = 0; i < this.items.length; i++)
        {
            this.items[i].unsubscribe();
        }
        this.items = [];
    }

    private subscribe(): void
    {
        this.items.forEach(item => item.subscribe());
    }

    private createItems(): void
    {
        this.items = [];

        for (const element of this.elements)
        {
            for (const event of this.events)
            {
                this.items.push(
                    new ListenerItem(
                        element,
                        this.params.callback,
                        event,
                        this.params.debounce,
                        this.params.filter,
                        this.params.once
                    )
                );
            }
        }
    }
}

export function isElementActive(selector: string): (event: any) => boolean
{
    return (event: any) => !!event.target.closest(selector);
}

export function createListener(params: EventListenerParams): IListener
{
    return new Listener(params);
}

export function destroyListener(...listeners: (IListener|IListener[])[]): void
{
    listeners.forEach((listener: IListener|IListener[]) =>
    {
        listener = Array.isArray(listener) ? listener : [listener];
        listener
            .filter(_listener => _listener && isFunction(_listener.unsubscribe))
            .forEach(_listener => _listener.unsubscribe());
    });
}

