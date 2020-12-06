import { Selector } from './dom-variables/types';
import { safeElements } from './safe-element';

export function setAttributes(selector: Selector, attributes: any): void
{
    Object.keys(attributes).forEach(function (prop)
    {
        const value = attributes[prop];
        if (value !== false)
        {
            safeElements(selector).forEach(element =>
            {
                element.setAttribute(prop, attributes[prop]);
            });
        }
        else
        {
            safeElements(selector).forEach(element =>
            {
                element.removeAttribute(prop);
            });
        }
    });
}
