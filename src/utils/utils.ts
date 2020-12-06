let id = 0;

export class Utils
{
    static __cache = {};

    static generateChars(length): string
    {
        let chars = '';

        for (let i = 0; i < length; i++)
        {
            const randomChar = Math.floor(Math.random() * 36);
            chars += randomChar.toString(36);
        }

        return chars;
    }

    static bind(func, context): any
    {
        return function ()
        {
            func.apply(context, arguments);
        };
    }

    static _convertData(data)
    {
        for (const originalKey in data)
        {
            if (data.hasOwnProperty(originalKey))
            {
                const keys    = originalKey.split('-');
                let dataLevel = data;

                if (keys.length === 1)
                {
                    continue;
                }

                for (let k = 0; k < keys.length; k++)
                {
                    let key = keys[k];

                    // Lowercase the first letter
                    // By default, dash-separated becomes camelCase
                    key = key.substring(0, 1).toLowerCase() + key.substring(1);

                    if (!(key in dataLevel))
                    {
                        dataLevel[key] = {};
                    }

                    if (k === keys.length - 1)
                    {
                        dataLevel[key] = data[originalKey];
                    }

                    dataLevel = dataLevel[key];
                }

                delete data[originalKey];
            }
        }

        return data;
    }

    static hasScroll(el: HTMLElement, index: number): boolean
    {
        const overflowX = el.style.overflowX;
        const overflowY = el.style.overflowY;

        // Check both x and y declarations
        if (overflowX === overflowY && (overflowY === 'hidden' || overflowY === 'visible'))
        {
            return false;
        }

        if (overflowX === 'scroll' || overflowY === 'scroll')
        {
            return true;
        }

        return (parseInt(window.getComputedStyle(el).height, 10) < el.scrollHeight ||
            parseInt(window.getComputedStyle(el).width, 10) < el.scrollWidth);
    }

    static GetUniqueElementId(element)
    {
        // Get a unique element Id. If element has no id,
        // creates a new unique number, stores it in the id
        // attribute and returns the new id with a prefix.
        // If an id already exists, it simply returns it with a prefix.

        let select2Id = element.getAttribute('data-select2-id');

        if (select2Id != null)
        {
            return select2Id;
        }

        // If element has id, use it.
        if (element.id)
        {
            select2Id = 'select2-data-' + element.id;
        }
        else
        {
            select2Id = 'select2-data-' + (++id).toString() + '-' + Utils.generateChars(4);
        }

        element.setAttribute('data-select2-id', select2Id);

        return select2Id;
    }

    static StoreData(element, name, value): void
    {
        // Stores an item in the cache for a specified element.
        // name is the cache key.
        const _id = Utils.GetUniqueElementId(element);
        if (!Utils.__cache[_id])
        {
            Utils.__cache[_id] = {};
        }

        Utils.__cache[_id][name] = value;
    }

    static GetData(element: HTMLElement, name?: string): any
    {
        // Retrieves a value from the cache by its key (name)
        // name is optional. If no name specified, return
        // all cache items for the specified element.
        // and for a specified element.
        const _id = Utils.GetUniqueElementId(element);
        if (name)
        {
            if (Utils.__cache[_id])
            {
                if (Utils.__cache[_id][name] != null)
                {
                    return Utils.__cache[_id][name];
                }
                return element.dataset[name]; // Fallback to HTML5 data attribs.
            }
            return element.dataset[name]; // Fallback to HTML5 data attribs.
        }
        else
        {
            return Utils.__cache[id];
        }
    }

    static RemoveData(element: HTMLElement|Element): void
    {
        // Removes all cached items for a specified element.
        const _id = Utils.GetUniqueElementId(element);
        if (Utils.__cache[_id] != null)
        {
            delete Utils.__cache[_id];
        }

        element.removeAttribute('data-select2-id');
    }

    static copyNonInternalCssClasses(dest, src): void
    {
        let destinationClasses = dest.getAttribute('class').trim().split(/\s+/);
        destinationClasses     = destinationClasses.filter(function (clazz)
        {
            // Save all TsSelect2 classes
            return clazz.indexOf('select2-') === 0;
        });

        let sourceClasses = src.getAttribute('class').trim().split(/\s+/);
        sourceClasses     = sourceClasses.filter(function (clazz)
        {
            // Only copy non-TsSelect2 classes
            return clazz.indexOf('select2-') !== 0;
        });

        const replacements = destinationClasses.concat(sourceClasses);

        dest.setAttribute('class', replacements.join(' '));
    }

    static geElementParents(e: HTMLElement): HTMLElement[]
    {
        const result = [];
        for (let p = e && e.parentElement; p; p = p.parentElement)
        {
            result.push(p);
        }
        return result;
    }

    static detach(node)
    {
        if (node && node.parentElement)
        {
            return node.parentElement.removeChild(node);
        }
        return null;
    }

    static elementEmpty(el: HTMLElement): HTMLElement
    {
        while (el.firstChild)
        {
            el.removeChild(el.firstChild);
        }
        return el;
    }

    static getLastElement<T extends Element>(container: HTMLElement, selector: string): T
    {
        return Array.from(container.querySelectorAll(selector)).pop() as T;
    }
}
