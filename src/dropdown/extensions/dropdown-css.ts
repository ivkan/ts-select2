import { IDropdown } from '../../types/dropdown';
import { Utils } from '../../utils/utils';

export const DropdownCss = (target: IDropdown) =>
{
    return class DropdownCss extends target
    {
        render(): HTMLSpanElement
        {
            const dropdown: HTMLSpanElement = super.render();

            let dropdownCssClass = this.options.get('dropdownCssClass') || '';

            if (dropdownCssClass.indexOf(':all:') !== -1)
            {
                dropdownCssClass = dropdownCssClass.replace(':all:', '');

                Utils.copyNonInternalCssClasses(dropdown, this.core.element);
            }

            dropdown.classList.add(dropdownCssClass);

            return dropdown;
        }
    }
};
