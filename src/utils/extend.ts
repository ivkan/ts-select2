import { isPlainObject } from './is-plain-object';

export function extend<T>(...sources: any[]): T
{
    const deep   = typeof sources[0] === 'boolean' ? sources.shift() : false,
          target = sources.shift(),
          length = sources.length;

    if (!target) return {} as T;

    if (!length) return extend(deep, {}, target);

    for (let i = 0; i < length; i++)
    {
        const source = sources[i];

        for (const key in source)
        {
            if (deep && (Array.isArray(source[key]) || isPlainObject(source[key])))
            {
                if (!target[key] || target[key].constructor !== source[key].constructor) target[key] = new source[key].constructor();

                extend(deep, target[key], source[key]);

            }
            else
            {
                target[key] = source[key];
            }
        }
    }

    return target;
}
