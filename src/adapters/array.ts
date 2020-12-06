import { TsSelect2 } from '../core';
import { SelectAdapter } from './select';
import { extend } from '../utils/extend';

export class ArrayAdapter extends SelectAdapter
{
    _dataToConvert: any;

    constructor(element, options)
    {
        super(element, options);
        this._dataToConvert = options.get('data') || [];
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        super.binding(select, container);

        this.addOptions(this.convertToOptions(this._dataToConvert));
    }

    select(data): void
    {
        let option: HTMLOptionElement|HTMLOptGroupElement = Array
            .from(this.core.element.querySelectorAll('option'))
            .find((elm) => elm.value === data.id.toString());

        if (!option)
        {
            option = this.option(data);
            this.addOptions([option]);
        }

        super.select(data);
    }

    convertToOptions(data): HTMLOptionElement[]
    {
        const existing    = Array.from(this.core.element.querySelectorAll('option'));
        const existingIds = existing.map((option) => this.item(option).id);
        const options     = [];

        // Filter out all items except for the one passed in the argument
        const onlyItem = _item => (_selfItem) => _selfItem.value === _item.id;

        for (let d = 0; d < data.length; d++)
        {
            const item = this.normalizeItem(data[d]);

            // Skip items which were pre-loaded, only merge the data
            if (existingIds.indexOf(item.id) >= 0)
            {
                const existingOption = existing.find(onlyItem(item));

                const existingData = this.item(existingOption);
                const newData      = extend({}, item, existingData);
                const $newOption   = this.option(newData);

                existingOption.outerHTML = $newOption.outerHTML;

                continue;
            }

            const option = this.option(item);

            if (item.children)
            {
                const children = this.convertToOptions(item.children);

                option.append(...children);
            }

            options.push(option);
        }

        return options;
    }
}
