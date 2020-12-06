import { TsSelect2 } from '../../core';
import { KEYS } from '../../keys';
import { Translation } from '../../translation';
import { ISelection } from '../../types/selection';
import { Utils } from '../../utils/utils';
import { createListener } from '../../utils/event-listener/listener';
import { eventTrigger } from '../../utils/event-trigger';
import { elementFromString } from '../../utils/element-from-string';

export const AllowClear = (target: ISelection) =>
{
    return class AllowClear extends target
    {
        placeholder: any;

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            if (this.placeholder == null)
            {
                if (this.options.get('debug') && window.console && console.error)
                {
                    console.error(
                        'TsSelect2: The `allowClear` option should be used in combination ' +
                        'with the `placeholder` option.'
                    );
                }
            }

            createListener({
                elements : this.selection,
                events   : 'mousedown',
                listeners: this.core.listeners,
                filter   : (event: MouseEvent) =>
                {
                    const target   = event.target as HTMLElement;
                    const isClosed = (el: HTMLElement) => el.classList.contains('select2-selection__clear');

                    return isClosed(target) || isClosed(target.parentElement);

                },
                callback : evt =>
                {
                    this._handleClear(evt);
                }
            });

            select.on('keypress', evt =>
            {
                this._handleKeyboardClear(evt, select);
            });
        }

        _handleClear(evt): void
        {
            // Ignore the event if it is disabled
            if (this.isDisabled())
            {
                return;
            }

            const clears = this.selection.querySelectorAll<HTMLElement>(
                '.select2-selection__clear'
            );

            // Ignore the event if nothing has been selected
            if (clears.length === 0)
            {
                return;
            }

            evt.stopPropagation();

            const data = Utils.GetData(clears[0], 'data');

            const previousVal       = this.core.element.value;
            this.core.element.value = this.placeholder.id;

            let unselectData: any = {
                data: data
            };
            this.trigger('clear', unselectData);
            if (unselectData.prevented)
            {
                this.core.element.value = previousVal;
                return;
            }

            for (let d = 0; d < data.length; d++)
            {
                unselectData = {
                    data: data[d]
                };

                // Trigger the `unselect` event, so people can prevent it from being
                // cleared.
                this.trigger('unselect', unselectData);

                // If the event was prevented, don't clear it out.
                if (unselectData.prevented)
                {
                    this.core.element.value = previousVal;
                    return;
                }
            }

            eventTrigger(this.core.element, 'input');
            eventTrigger(this.core.element, 'change');

            this.trigger('toggle', {});
        }

        _handleKeyboardClear(evt, select: TsSelect2): void
        {
            if (select.isOpen())
            {
                return;
            }

            if (evt.which === KEYS.DELETE || evt.which === KEYS.BACKSPACE)
            {
                this._handleClear(evt);
            }
        }

        update(data): void
        {
            super.update(data);

            const clearEl = this.selection.querySelector('.select2-selection__clear');
            if (clearEl)
            {
                clearEl.remove();
            }

            if (this.selection.querySelectorAll('.select2-selection__placeholder').length > 0 || data.length === 0)
            {
                return;
            }

            const selectionId = this.selection
                .querySelector('.select2-selection__rendered')
                .getAttribute('id');

            const removeAll    = this.options.get<Translation>('translations').get('removeAllItems');
            const removeButton = elementFromString<HTMLButtonElement>(
                '<button type="button" class="select2-selection__clear" tabindex="-1">' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>'
            );
            removeButton.setAttribute('title', removeAll());
            removeButton.setAttribute('aria-label', removeAll());
            removeButton.setAttribute('aria-describedby', selectionId);
            Utils.StoreData(removeButton, 'data', data);

            this.selection.prepend(removeButton);
        }
    }
};

