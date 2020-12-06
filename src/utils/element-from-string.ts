import { createElement, div, table, tbody, tr } from './dom-variables/variables';
import { isString } from './is-string';

const fragmentRe = /^\s*<(\w+)[^>]*>/,
      singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

const containers = {
    '*'  : div,
    tr   : tbody,
    td   : tr,
    th   : tr,
    thead: table,
    tbody: table,
    tfoot: table
};

export function elementsFromString<T extends HTMLElement>(html: string): T[]
{
    if (!isString(html)) return [];
    html = html.trim();
    if (singleTagRe.test(html)) return [createElement(RegExp.$1)];

    const fragment  = fragmentRe.test(html) && RegExp.$1;
    const container = containers[fragment] || containers['*'];

    container.innerHTML = html;

    return container.childNodes;
}


export function elementFromString<T extends HTMLElement>(htmlString: string): T|null
{
    const elements = elementsFromString<T>(htmlString);
    return elements.length > 0 ? elements[0] : null;
}
