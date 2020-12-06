import { TsSelect2 } from '../../core';
import { IDropdown } from '../../types/dropdown';

export const CloseOnSelect = (target: IDropdown) =>
{
    return class CloseOnSelect extends target
    {
        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            select.on('select', (evt) =>
            {
                this._selectTriggered(evt);
            });

            select.on('unselect', (evt) =>
            {
                this._selectTriggered(evt);
            });
        }

        _selectTriggered(evt): void
        {
            const originalEvent = evt.originalEvent;

            // Don't close if the control key is being held
            if (originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey))
            {
                return;
            }

            this.trigger('close', {
                originalEvent       : originalEvent,
                originalSelect2Event: evt
            });
        }
    }
};
