import { Selector } from './dom-variables/types';
import { isNumber } from './is-number';
import { safeElements } from './safe-element';

function stylePropCamelCase(str: string): string
{
    return str.replace(/-([a-z])/g, function (g)
    {
        return g[1].toUpperCase();
    });
}

export function setStyles(selector: Selector, styles): void
{
    Object.keys(styles).forEach(prop =>
    {
        let unit = '';
        // add unit if the value is numeric and is one of the following
        if (
            ['width', 'height', 'top', 'right', 'bottom', 'left', 'min-width', 'max-width', 'max-height', 'min-height']
                .indexOf(prop) !== -1 && isNumber(styles[prop])
        )
        {
            unit = 'px';
        }
        safeElements(selector).forEach(element =>
        {
            element.style[stylePropCamelCase(prop)] = styles[prop] + unit;
        });
    });
}

export function removeStyles(selector: Selector, ...styles: string[]): void
{
    styles.forEach(prop =>
    {
        safeElements(selector).forEach(element =>
        {
            element.style[stylePropCamelCase(prop)] = null;
        });
    });
}