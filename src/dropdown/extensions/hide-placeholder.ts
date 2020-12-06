import { IResults } from '../../types/results';
import { IdTextPair } from '../../types/types';

export const HidePlaceholder = (target: IResults) =>
{
    return class HidePlaceholder extends target
    {
        placeholder: IdTextPair;

        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);

            this.placeholder = this.normalizePlaceholder(this.options.get('placeholder'));
        }

        append(data): void
        {
            data.results = this.removePlaceholder(data.results);
            super.append(data);
        }

        normalizePlaceholder(placeholder: string|IdTextPair): IdTextPair
        {
            if (typeof placeholder === 'string')
            {
                placeholder = {
                    id  : '',
                    text: placeholder
                };
            }

            return placeholder;
        }

        removePlaceholder(data: any[]): any
        {
            const modifiedData = data.slice(0);

            for (let d = data.length - 1; d >= 0; d--)
            {
                const item = data[d];

                if (this.placeholder.id === item.id)
                {
                    modifiedData.splice(d, 1);
                }
            }

            return modifiedData;
        }
    }
};
