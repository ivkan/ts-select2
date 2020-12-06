import { Context, EleLoose, Selector } from './dom-variables/types';
import { htmlRe, idRe, win } from './dom-variables/variables';
import { elementsFromString } from './element-from-string';

export function safeElements(selector: Selector, context?: Context): EleLoose[]
{
    const array: EleLoose[] = [];

    if (!selector) return array;

    let eles: any = selector;

    if (typeof selector === 'string')
    {
        const ctx = context || document;

        eles = idRe.test(selector)
            ? (ctx as Document).getElementById(selector.slice(1))
            : htmlRe.test(selector)
                ? elementsFromString<EleLoose>(selector)
                : ctx.querySelector(selector);

        if (!eles) return array;
    }

    if (eles.nodeType || eles === win) eles = [eles];

    for (let i = 0, l = eles.length; i < l; i++)
    {
        array[i] = eles[i];
    }

    return array;
}