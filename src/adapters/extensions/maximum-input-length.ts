import { IAdapter } from '../../types/adapter';

export const MaximumInputLength = (target: IAdapter) =>
{
    return class MaximumInputLength extends target
    {
        maximumInputLength: number;

        query(params, callback): void
        {
            this.maximumInputLength = this.options.get('maximumInputLength');
            params.term             = params.term || '';

            if (this.maximumInputLength > 0 && params.term.length > this.maximumInputLength)
            {
                this.trigger('results:message', {
                    message: 'inputTooLong',
                    args   : {
                        maximum: this.maximumInputLength,
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
