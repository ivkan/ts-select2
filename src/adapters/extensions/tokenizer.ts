import { TsSelect2 } from '../../core';
import { IAdapter } from '../../types/adapter';
import { isNil } from '../../utils/is-nil';
import { eventTrigger } from '../../utils/event-trigger';
import { extend } from '../../utils/extend';

export const Tokenizer = (target: IAdapter) =>
{
    return class Tokenizer extends target
    {
        search: HTMLInputElement;

        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);

            const tokenizer = this.options.get<any>('tokenizer');

            if (!isNil(tokenizer))
            {
                this.tokenizer = tokenizer;
            }
        }

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            this.search = select.dropdown['search']
                || select.selection['search']
                || select.element.querySelector('.select2-search__field');
        }

        query(params, callback): void
        {
            const select = (data) =>
            {
                this.trigger('select', { data: data });
            };

            const createAndSelect = (data) =>
            {
                // Normalize the data object so we can use it for checks
                const item = this.normalizeItem(data);

                // Check if the data object already exists as a tag
                // Select it if it doesn't
                const existingOptions = Array
                    .from<HTMLOptionElement>(this.core.element.querySelectorAll('option'))
                    .filter((op) => op.value === item.id);

                // If an existing option wasn't found for it, create the option
                if (!existingOptions.length)
                {
                    const option = this.option(item);
                    option.setAttribute('data-select2-tag', 'true');

                    this.removeOldTags();
                    this.addOptions([option]);
                }

                // Select the item, now that we know there is an option for it
                select(item);
            };

            params.term = params.term || '';

            const tokenData = this.tokenizer(params, this.options, createAndSelect);

            if (tokenData.term !== params.term)
            {
                // Replace the search term if we have the search box
                if (this.search)
                {
                    this.search.value = tokenData.term;
                    eventTrigger(this.search, 'focus');
                }

                params.term = tokenData.term;
            }

            super.query(params, callback);
        }

        tokenizer(_, params, options, callback?: (data?: any) => any): {term: string}
        {
            const separators = options.get('tokenSeparators') || [];
            let term         = params.term;
            let i            = 0;

            const createTag = this.createTag || function (_params)
            {
                return {
                    id  : _params.term,
                    text: _params.term
                };
            };

            while (i < term.length)
            {
                const termChar = term[i];

                if (separators.indexOf(termChar) === -1)
                {
                    i++;

                    continue;
                }

                const part       = term.substr(0, i);
                const partParams = extend({}, params, {
                    term: part
                });

                const data = createTag(partParams);

                if (data == null)
                {
                    i++;
                    continue;
                }

                callback(data);

                // Reset the term to not include the tokenized portion
                term = term.substr(i + 1) || '';
                i    = 0;
            }

            return { term };
        }
    };
};

