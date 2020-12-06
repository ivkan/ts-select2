import { IAdapter } from '../../types/adapter';

export const MinimumInputLength = (target: IAdapter) =>
{
    return class MinimumInputLength extends target
    {
        minimumInputLength: number;

        query(params, callback): void
        {
            this.minimumInputLength = this.options.get('minimumInputLength');
            params.term             = params.term || '';

            if (params.term.length < this.minimumInputLength)
            {
                this.trigger('results:message', {
                    message: 'inputTooShort',
                    args   : {
                        minimum: this.minimumInputLength,
                        input  : params.term,
                        params : params
                    }
                });

                return;
            }

            super.query(params, callback);
        }
    };
};
