import { TsSelect2 } from '../core';
import { Options } from '../options';
import { Utils } from '../utils/utils';
import { BaseSelection } from './base';
import { createListener } from '../utils/event-listener/listener';
import { eventTrigger } from '../utils/event-trigger';
import { elementFromString } from '../utils/element-from-string';

export class SingleSelection extends BaseSelection
{
    constructor(element: TsSelect2, options: Options)
    {
        super(element, options);
    }

    render(): HTMLSpanElement
    {
        const selection = super.render();

        selection.classList.add('select2-selection--single');

        selection.innerHTML = '<span class="select2-selection__rendered"></span>' +
            '<span class="select2-selection__arrow" role="presentation">' +
            '<b role="presentation"></b>' +
            '</span>';

        return selection;
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        super.binding(select, container);

        const id       = select.id + '-container';
        const rendered = this.selection.querySelector('.select2-selection__rendered');

        rendered.setAttribute('id', id);
        rendered.setAttribute('role', 'textbox');
        rendered.setAttribute('aria-readonly', 'true');
        this.selection.setAttribute('aria-labelledby', id);

        createListener({
            elements : this.selection,
            events   : 'mousedown',
            listeners: this.core.listeners,
            callback : (evt: MouseEvent) =>
            {
                // Only respond to left clicks
                if (evt.which !== 1)
                {
                    return;
                }

                this.trigger('toggle', {
                    originalEvent: evt
                });
            }
        });

        select.on('focus', () =>
        {
            if (!select.isOpen())
            {
                eventTrigger(this.selection, 'focus');
            }
        });
    }

    clear(): void
    {
        const rendered = this.selection.querySelector<HTMLElement>('.select2-selection__rendered');
        Utils.elementEmpty(rendered);
        rendered.removeAttribute('title'); // clear tooltip on empty
    }

    display(data, container): string
    {
        const template     = this.options.get<Function>('templateSelection');
        const escapeMarkup = this.options.get<Function>('escapeMarkup');

        return escapeMarkup(template(data, container));
    }

    selectionContainer(): HTMLSpanElement
    {
        return elementFromString<HTMLSpanElement>('<span></span>');
    }

    update(data: any[]): void
    {
        if (data.length === 0)
        {
            this.clear();
            return;
        }

        const selection = data[0];

        const rendered  = this.selection.querySelector<HTMLElement>('.select2-selection__rendered');
        const formatted = this.display(selection, rendered);

        Utils.elementEmpty(rendered).append(formatted);

        const title = selection.title || selection.text;

        if (title)
        {
            rendered.setAttribute('title', title);
        }
        else
        {
            rendered.removeAttribute('title');
        }
    }
}
