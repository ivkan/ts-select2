import { TsSelect2 } from '../../core';
import { ISelection } from '../../types/selection';
import { eventTrigger } from '../../utils/event-trigger';

export const EventRelay = (target: ISelection) =>
{
    return class EventRelay extends target
    {
        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            const relayEvents = [
                'open', 'opening',
                'close', 'closing',
                'select', 'selecting',
                'unselect', 'unselecting',
                'clear', 'clearing'
            ];

            const preventableEvents = [
                'opening', 'closing', 'selecting', 'unselecting', 'clearing'
            ];

            select.on('*', (name, params) =>
            {
                // Ignore events that should not be relayed
                if (relayEvents.indexOf(name) === -1)
                {
                    return;
                }

                // The parameters should always be an object
                params = params || {};

                // Generate the custom event for the TsSelect2 event
                const evt = eventTrigger(this.core.element, 'select2:' + name, {
                    params: params
                });

                // Only handle preventable events if it was one
                if (preventableEvents.indexOf(name) === -1)
                {
                    return;
                }

                params.prevented = evt.defaultPrevented;
            });
        }
    }
};
