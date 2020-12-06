import { Defaults } from './defaults';
import { SelectOptions } from './types/types';
import { Utils } from './utils/utils';
import { extend } from './utils/extend';
import { isPlainObject } from './utils/is-plain-object';
import { isNil } from './utils/is-nil';

export class Options
{
    options: SelectOptions;
    defaults: Defaults;

    constructor(options: SelectOptions, element?: HTMLSelectElement)
    {
        this.options  = options;
        this.defaults = new Defaults();

        if (!isNil(element))
        {
            this.fromElement(element);
            this.options = this.defaults.applyFromElement(this.options, element);
        }

        this.options  = this.defaults.apply({ ...options });
    }

    fromElement(element: HTMLSelectElement): Options
    {
        const excludedData = ['select2'];

        if (this.options.multiple == null)
        {
            this.options.multiple = element.multiple;
        }

        if (this.options.disabled == null)
        {
            this.options.disabled = element.disabled;
        }

        if (this.options.autocomplete == null && element.autocomplete)
        {
            this.options.autocomplete = element.autocomplete;
        }

        if (this.options.dir == null)
        {
            if (element.dir)
            {
                this.options.dir = element.dir as ('ltr'|'rtl');
            }
            else if (!!element.closest('[dir]'))
            {
                this.options.dir = element.closest('[dir]')['dir'];
            }
            else
            {
                this.options.dir = 'ltr';
            }
        }

        element.disabled = this.options.disabled;
        element.multiple = this.options.multiple;

        if (Utils.GetData(element, 'select2Tags'))
        {
            if (this.options.debug && window.console && console.warn)
            {
                console.warn(
                    'Select2: The `data-select2-tags` attribute has been changed to ' +
                    'use the `data-data` and `data-tags="true"` attributes and will be ' +
                    'removed in future versions of Select2.'
                );
            }

            Utils.StoreData(element, 'data', Utils.GetData(element, 'select2Tags'));
            Utils.StoreData(element, 'tags', true);
        }

        let dataset: any = {};

        function upperCaseLetter(_, letter)
        {
            return letter.toUpperCase();
        }

        // Pre-load all of the attributes which are prefixed with `data-`
        for (let attr = 0; attr < element.attributes.length; attr++)
        {
            const attributeName = element.attributes[attr].name;
            const prefix        = 'data-';

            if (attributeName.substr(0, prefix.length) === prefix)
            {
                // Get the contents of the attribute after `data-`
                const dataName = attributeName.substring(prefix.length);

                // Get the data contents from the consistent source
                // This is more than likely the jQuery data helper
                const dataValue = Utils.GetData(element, dataName);

                // camelCase the attribute name to match the spec
                const camelDataName = dataName.replace(/-([a-z])/g, upperCaseLetter);

                // Store the data attribute contents into the dataset since
                dataset[camelDataName] = dataValue;
            }
        }

        if (element.dataset)
        {
            dataset = extend(true, {}, element.dataset, dataset);
        }

        // Prefer our internal data cache if it exists
        let data: any = extend(true, {}, Utils.GetData(element), dataset);

        data = Utils._convertData(data);

        for (const key in data)
        {
            if (excludedData.indexOf(key) > -1)
            {
                continue;
            }

            if (isPlainObject(this.options[key]))
            {
                extend(this.options[key], data[key]);
            }
            else
            {
                this.options[key] = data[key];
            }
        }

        return this;
    }

    get<T>(key: string): T
    {
        return this.options[key];
    }

    set(key: string, val: any): void
    {
        this.options[key] = val;
    }
}
