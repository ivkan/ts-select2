import { TsSelect2 } from '../core';
import { Observable } from '../helper/observable';
import { Options } from '../options';
import { elementFromString } from '../utils/element-from-string';

export class Dropdown extends Observable
{
    core: TsSelect2;
    options: any;
    dropdown: HTMLElement;

    constructor(select: TsSelect2, options: Options)
    {
        super();
        this.core    = select;
        this.options = options;
    }

    render(): HTMLSpanElement
    {
        this.dropdown = elementFromString(
            '<span class="select2-dropdown"><span class="select2-results"></span></span>'
        );
        this.dropdown.setAttribute('dir', this.options.get('dir'));
        return this.dropdown;
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        // Should be implemented in subclasses
    }

    position(dropdown, container)
    {
        // Should be implemented in subclasses
    }

    destroy(): void
    {
        this.dropdown.remove();
    }
}