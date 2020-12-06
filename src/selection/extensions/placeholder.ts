import { ISelection } from '../../types/selection';
import { IdTextPair } from '../../types/types';

export const Placeholder = (target: ISelection) =>
{
    return class Placeholder extends target
    {
        placeholder: IdTextPair;

        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);

            this.placeholder = this.normalizePlaceholder(this.options.get('placeholder'));
        }

        normalizePlaceholder(placeholder): IdTextPair
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

        createPlaceholder(placeholder?): HTMLElement
        {
            const placeholderContainer = this.selectionContainer();

            placeholderContainer.innerHTML = this.display(placeholder);
            placeholderContainer.classList.add('select2-selection__placeholder');
            placeholderContainer.classList.remove('select2-selection__choice');

            return placeholderContainer;
        }

        update(data): void
        {
            const singlePlaceholder  = (
                data.length === 1 && data[0].id !== this.placeholder.id
            );
            const multipleSelections = data.length > 1;

            if (multipleSelections || singlePlaceholder)
            {
                return super.update(data);
            }

            this.clear();

            const placeholderContainer = this.createPlaceholder(this.placeholder);

            this.selection
                .querySelector('.select2-selection__rendered')
                .append(placeholderContainer);
        }
    }
};
