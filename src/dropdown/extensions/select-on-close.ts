import { TsSelect2 } from '../../core';
import { IResults } from '../../types/results';
import { Utils } from '../../utils/utils';

export const SelectOnClose = (target: IResults) =>
{
    return class SelectOnClose extends target
    {
        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            select.on('close', event =>
            {
                this._handleSelectOnClose(event);
            });
        }

        _handleSelectOnClose(params): void
        {
            if (params && params.originalSelect2Event != null)
            {
                const event = params.originalSelect2Event;

                // Don't select an item if the close event was triggered from a select or
                // unselect event
                if (event._type === 'select' || event._type === 'unselect')
                {
                    return;
                }
            }

            const highlightedResults = this.getHighlightedResults();

            // Only select highlighted results
            if (highlightedResults.length === 0)
            {
                return;
            }

            const data = Utils.GetData(highlightedResults[0], 'data');

            // Don't re-select already selected resulte
            if (
                (data.element != null && data.element.selected) ||
                (data.element == null && data.selected)
            )
            {
                return;
            }

            this.trigger('select', {
                data: data
            });
        }
    }
};

