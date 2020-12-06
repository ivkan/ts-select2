import { isFunction } from '../is-function';
import { isElement } from '../is-element';

const isWindow         = (x: any): x is Window => !!x && x === x.window;
const isDocument       = (x: any): x is Document => !!x && x.nodeType === 9;
export const getEvents = (events: string): string[] =>
{
    if (events.trim() === '*')
    {
        const types = [];
        for (const ev in window)
        {
            if (/^on/.test(ev))
            {
                types[types.length] = ev;
            }
        }
        return types;
    }
    return events.split(' ').map(event => event.trim());
};

function arrayFrom(arrayLike: ArrayLike<any>): any[]
{
    const l = arrayLike.length;
    const arr = [];
    for (let i = 0; i < l; i++)
    {
        arr.push(arrayLike[i]);
    }
    return arr;
}

export const getElements = (elements): EventTarget[] =>
{
    const _elements = !!(elements && isFunction(elements.addEventListener))
        ? [elements]
        : Array.isArray(elements) ? elements : arrayFrom(elements);

    return _elements.filter(element =>
    {
        return !(!isWindow(element) && !isElement(element) && !isDocument(element));
    });
};

