import { ISelection } from '../../types/selection';
import { Utils } from '../../utils/utils';

export const SelectionCss = (target: ISelection) =>
{
    return class SelectionCss extends target
    {
        render(): HTMLSpanElement
        {
            const selection       = super.render();
            let selectionCssClass = this.options.get<string>('selectionCssClass') || '';

            if (selectionCssClass.indexOf(':all:') !== -1)
            {
                selectionCssClass = selectionCssClass.replace(':all:', '');

                Utils.copyNonInternalCssClasses(selection, this.core.element);
            }

            selection.classList.add(selectionCssClass);

            return selection;
        }
    }
};
