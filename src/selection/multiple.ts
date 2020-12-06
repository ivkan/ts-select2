import { TsSelect2 } from '../core';
import { Options } from '../options';
import { Translation } from '../translation';
import { Utils } from '../utils/utils';
import { BaseSelection } from './base';
import { createListener, isElementActive } from '../utils/event-listener/listener';
import { elementFromString } from '../utils/element-from-string';

export class MultipleSelection extends BaseSelection
{
    constructor(element: TsSelect2, options: Options)
    {
        super(element, options);
    }

    render(): HTMLSpanElement
    {
        const selection = super.render();

        selection.classList.add('select2-selection--multiple');
        selection.innerHTML = '<ul class="select2-selection__rendered"></ul>';

        return selection;
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        super.binding(select, container);

        const id = select.id + '-container';

        this.selection
            .querySelector('.select2-selection__rendered')
            .setAttribute('id', id);

        createListener({
            elements : this.selection,
            events   : 'click',
            listeners: this.core.listeners,
            callback : (evt: MouseEvent) =>
            {
                this.trigger('toggle', {
                    originalEvent: evt
                });
            }
        });

        createListener({
            elements : this.selection,
            filter   : isElementActive('.select2-selection__choice__remove'),
            events   : 'click',
            listeners: this.core.listeners,
            callback : (evt: MouseEvent) =>
            {
                // Ignore the event if it is disabled
                if (this.isDisabled())
                {
                    return;
                }

                const target    = (evt.target as HTMLElement).closest('.select2-selection__choice__remove');
                const selection = target.parentElement;
                const data      = Utils.GetData(selection, 'data');

                this.trigger('unselect', {
                    originalEvent: evt,
                    data         : data
                });
            }
        });

        createListener({
            elements : this.selection,
            filter   : isElementActive('.select2-selection__choice__remove'),
            events   : 'keydown',
            listeners: this.core.listeners,
            callback : (evt: MouseEvent) =>
            {
                if (this.isDisabled())
                {
                    return;
                }

                evt.stopPropagation();
            }
        });
    }

    clear(): void
    {
        const rendered = this.selection.querySelector<HTMLElement>(
            '.select2-selection__rendered'
        );
        Utils.elementEmpty(rendered);
        rendered.removeAttribute('title');
    }

    display(data, container): string
    {
        const template     = this.options.get<Function>('templateSelection');
        const escapeMarkup = this.options.get<Function>('escapeMarkup');

        return escapeMarkup(template(data, container));
    }

    selectionContainer(): HTMLLIElement
    {
        return elementFromString<HTMLLIElement>(
            '<li class="select2-selection__choice">' +
            '<button type="button" class="select2-selection__choice__remove" ' +
            'tabindex="-1">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '<span class="select2-selection__choice__display"></span>' +
            '</li>'
        );
    }

    update(data): void
    {
        this.clear();

        if (data.length === 0)
        {
            return;
        }

        const selections = [];

        const selectionIdPrefix = this.selection
            .querySelector('.select2-selection__rendered')
            .getAttribute('id') + '-choice-';

        for (let d = 0; d < data.length; d++)
        {
            const selection = data[d];

            const selectionContainer = this.selectionContainer();
            const formatted          = this.display(selection, selectionContainer);

            let selectionId = selectionIdPrefix + Utils.generateChars(4) + '-';

            if (selection.id)
            {
                selectionId += selection.id;
            }
            else
            {
                selectionId += Utils.generateChars(4);
            }

            selectionContainer
                .querySelectorAll('.select2-selection__choice__display')
                .forEach(el =>
                {
                    el.append(formatted);
                    el.setAttribute('id', selectionId);
                });

            const title = selectionContainer.title || selectionContainer['text'];

            if (title)
            {
                selectionContainer.setAttribute('title', title);
            }

            const removeItem = this.options.get<Translation>('translations').get('removeItem');

            selectionContainer
                .querySelectorAll('.select2-selection__choice__remove')
                .forEach(removeEl =>
                {
                    removeEl.setAttribute('title', removeItem());
                    removeEl.setAttribute('aria-label', removeItem());
                    removeEl.setAttribute('aria-describedby', selectionId);
                });

            Utils.StoreData(selectionContainer, 'data', selection);

            selections.push(selectionContainer);
        }

        const rendered = this.selection.querySelector('.select2-selection__rendered');

        selections.forEach(s => rendered.append(s));
    }
}

