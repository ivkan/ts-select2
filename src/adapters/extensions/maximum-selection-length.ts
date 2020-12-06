import { TsSelect2 } from '../../core';
import { IAdapter } from '../../types/adapter';

export const MaximumSelectionLength = (target: IAdapter) =>
{
    return class MaximumSelectionLength extends target
    {
        maximumSelectionLength: number;

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            select.on('select', () =>
            {
                this._checkIfMaximumSelected();
            });
        }

        query(params, callback): void
        {
            this._checkIfMaximumSelected(() =>
            {
                super.query(params, callback);
            });
        }

        _checkIfMaximumSelected(_?: () => any, successCallback?: () => any)
        {
            this.maximumSelectionLength = this.options.get('maximumSelectionLength');

            this.current((currentData) =>
            {
                const count = currentData != null ? currentData.length : 0;

                if (this.maximumSelectionLength > 0 && count >= this.maximumSelectionLength)
                {
                    this.trigger('results:message', {
                        message: 'maximumSelected',
                        args   : {
                            maximum: this.maximumSelectionLength
                        }
                    });
                    return;
                }

                if (successCallback)
                {
                    successCallback();
                }
            });
        }
    };
};

