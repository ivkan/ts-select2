import { TsSelect2 } from '../core';
import { Options } from '../options';
import { Utils } from '../utils/utils';
import { BaseAdapter } from './base';
import { isNil } from '../utils/is-nil';
import { eventTrigger } from '../utils/event-trigger';
import { extend } from '../utils/extend';

export class SelectAdapter extends BaseAdapter
{
    core: TsSelect2;
    options: Options;
    container: TsSelect2;

    constructor(core: TsSelect2, options: Options)
    {
        super();
        this.core   = core;
        this.options   = options;
    }

    current(callback: (_data: any) => any): void
    {
        const data = Array.prototype.map.call(
            this.core.element.querySelectorAll(':checked'),
            selectedElement => this.item(selectedElement)
        );

        callback(data);
    }

    select(data): void
    {
        data.selected = true;

        // If data.element is a DOM node, use it instead
        if (
            !isNil(data.element) && data.element.tagName.toLowerCase() === 'option'
        )
        {
            data.element.selected = true;
            this.triggerChange();
            return;
        }

        if (this.core.element.multiple)
        {
            this.current(currentData =>
            {
                const val = [];

                data = [data];
                data.push.apply(data, currentData);

                for (let d = 0; d < data.length; d++)
                {
                    const id = data[d].id;

                    if (val.indexOf(id) === -1)
                    {
                        val.push(id);
                    }
                }

                this.triggerChange(val);
            });
        }
        else
        {
            this.triggerChange(data.id);
        }
    }

    triggerChange(value?: any): void
    {
        if (value !== undefined)
        {
            this.core.val(value);
        }
        eventTrigger(this.core.element, 'input');
        eventTrigger(this.core.element, 'change');
    }

    unselect(data): void
    {
        if (!this.core.element.multiple)
        {
            return;
        }

        data.selected = false;

        if (
            data.element != null &&
            data.element.tagName.toLowerCase() === 'option'
        )
        {
            data.element.selected = false;
            this.triggerChange();
            return;
        }

        this.current(currentData =>
        {
            const val = [];

            for (let d = 0; d < currentData.length; d++)
            {
                const id = currentData[d].id;

                if (id !== data.id && val.indexOf(id) === -1)
                {
                    val.push(id);
                }
            }

            this.triggerChange(val);
        });
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        this.container = select;

        select.on('select', (params) =>
        {
            this.select(params.data);
        });

        select.on('unselect', (params) =>
        {
            this.unselect(params.data);
        });
    }

    destroy(): void
    {
        // Remove anything added to child elements
        Array.from<Element>(this.core.element.getElementsByTagName('*')).forEach(el =>
        {
            // Remove any custom data set by TsSelect2
            Utils.RemoveData(el);
        });
    }

    query(params, callback): void
    {
        const results = [];
        const options = Array.from<Element>(this.core.element.children);

        options.forEach((el) =>
        {
            if (el.tagName.toLowerCase() !== 'option' && el.tagName.toLowerCase() !== 'optgroup')
            {
                return;
            }

            const option  = this.item(el as HTMLOptionElement);
            const matches = this.matches(params, option);

            if (matches !== null)
            {
                results.push(matches);
            }
        });

        callback({ results });
    }

    addOptions(options: (HTMLOptionElement|HTMLOptGroupElement)[]): void
    {
        this.core.element.append(...options);
    }

    option(data): HTMLOptionElement|HTMLOptGroupElement
    {
        let option;

        if (data.children)
        {
            option       = document.createElement('optgroup');
            option.label = data.text;
        }
        else
        {
            option = document.createElement('option');

            if (option.textContent !== undefined)
            {
                option.textContent = data.text;
            }
            else
            {
                option.innerText = data.text;
            }
        }

        if (data.id !== undefined)
        {
            option.value = data.id;
        }

        if (data.disabled)
        {
            option.disabled = true;
        }

        if (data.selected)
        {
            option.selected = true;
        }

        if (data.title)
        {
            option.title = data.title;
        }

        const normalizedData   = this.normalizeItem(data);
        normalizedData.element = option;

        // Override the option's data with the combined data
        Utils.StoreData(option, 'data', normalizedData);

        return option;
    }

    item(option: HTMLOptionElement): any
    {
        let data: any = Utils.GetData(option, 'data');

        if (data != null)
        {
            return data;
        }

        if (option.tagName.toLowerCase() === 'option')
        {
            data = {
                id      : option.value,
                text    : option.innerText,
                disabled: option.disabled,
                selected: option.selected,
                title   : option.title
            };
        }
        else if (option.tagName.toLowerCase() === 'optgroup')
        {
            data = {
                text    : option.label,
                children: [],
                title   : option.title
            };

            const childrenElements = option.children;
            const children = [];

            for (let c = 0; c < childrenElements.length; c++)
            {
                const $child = (childrenElements[c] as HTMLOptionElement);

                if ($child.tagName.toLowerCase() !== 'option')
                {
                    continue;
                }

                const child  = this.item($child);

                children.push(child);
            }

            data.children = children;
        }

        data         = this.normalizeItem(data);
        data.element = option;

        Utils.StoreData(option, 'data', data);

        return data;
    }

    matches(params, data): boolean
    {
        const matcher = this.options.get<any>('matcher');
        return matcher(params, data);
    }

    normalizeItem(item): any
    {
        if (item !== Object(item))
        {
            item = {
                id  : item,
                text: item
            };
        }

        item = extend({}, { text: '' }, item);

        const defaults = {
            selected: false,
            disabled: false
        };

        if (item.id != null)
        {
            item.id = item.id.toString();
        }

        if (item.text != null)
        {
            item.text = item.text.toString();
        }

        if (item._resultId == null && item.id && this.container != null)
        {
            item._resultId = this.generateResultId(this.container, item);
        }

        return extend({}, defaults, item);
    }
}
