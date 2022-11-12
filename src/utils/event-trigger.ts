export function eventTrigger(el: HTMLElement|Element|Document, eventName: string, detail?: any): CustomEvent
{
    let event: CustomEvent;
    if (window['CustomEvent'] && typeof window['CustomEvent'] === 'function')
    {
        event = new CustomEvent(eventName, { detail: detail });
    }
    else
    {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, true, true, detail);
    }

    el.dispatchEvent(event);

    return event;
}
