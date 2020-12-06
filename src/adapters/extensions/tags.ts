import { IAdapter } from '../../types/adapter';
import { IdTextPair } from '../../types/types';
import { isNil } from '../../utils/is-nil';

export const Tags = (target: IAdapter) =>
{
    return class Tags extends target
    {
        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);

            const createTag = this.options.get<any>('createTag');
            if (!isNil(createTag))
            {
                this.createTag = createTag;
            }

            const insertTag = this.options.get<any>('insertTag');
            if (!isNil(insertTag))
            {
                this.insertTag = insertTag;
            }

            const tags = this.options.get('tags');
            if (Array.isArray(tags))
            {
                for (let t = 0; t < tags.length; t++)
                {
                    const tag    = tags[t];
                    const item   = this.normalizeItem(tag);
                    const option = this.option(item);

                    this.core.element.append(option);
                }
            }
        }

        query(params, callback): void
        {
            this.removeOldTags();

            if (isNil(params.term) || !isNil(params.page))
            {
                super.query(params, callback);
                return;
            }

            const wrapper = (obj, child) =>
            {
                const data = obj.results;

                for (let i = 0; i < data.length; i++)
                {
                    const option = data[i];

                    const checkChildren = (
                        option.children != null &&
                        !wrapper({ results: option.children }, true)
                    );

                    const optionText = (option.text || '').toUpperCase();
                    const paramsTerm = (params.term || '').toUpperCase();

                    const checkText = optionText === paramsTerm;

                    if (checkText || checkChildren)
                    {
                        if (child)
                        {
                            return false;
                        }

                        obj.data = data;
                        callback(obj);

                        return;
                    }
                }

                if (child)
                {
                    return true;
                }

                // TODO: Refactor this
                // const tag = this.createTag(params);
                //
                // if (!isNil(tag))
                // {
                //     const option = this.option(tag);
                //     option.setAttribute('data-select2-tag', 'true');
                //
                //     this.addOptions([option]);
                //
                //     this.insertTag(data, tag);
                // }

                obj.results = data;

                callback(obj);
            };

            super.query(params, wrapper);
        }

        createTag(params?): IdTextPair
        {
            if (params.term == null)
            {
                return null;
            }

            const term = params.term.trim();

            if (term === '')
            {
                return null;
            }

            return { id: term, text: term };
        }

        insertTag(data: any[], tag?): void
        {
            data.unshift(tag);
        }

        removeOldTags(_?): void
        {
            const options = Array.from<HTMLOptionElement>(
                this.core.element.querySelectorAll('option[data-select2-tag]')
            );

            options.forEach((option) =>
            {
                if (option.selected)
                {
                    return;
                }

                option.remove();
            });
        }
    };
};

