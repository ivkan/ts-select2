import { ITranslation } from '../types/types';

export const EnTranslations: ITranslation = {
    errorLoading   : function ()
    {
        return 'The results could not be loaded.';
    },
    inputTooLong   : function (args)
    {
        const overChars = args.input.length - args.maximum;

        let message = 'Please delete ' + overChars + ' character';

        if (overChars !== 1)
        {
            message += 's';
        }

        return message;
    },
    inputTooShort  : function (args)
    {
        const remainingChars = args.minimum - args.input.length;

        const message = 'Please enter ' + remainingChars + ' or more characters';

        return message;
    },
    loadingMore    : function ()
    {
        return 'Loading more results…';
    },
    maximumSelected: function (args)
    {
        let message = 'You can only select ' + args.maximum + ' item';

        if (args.maximum !== 1)
        {
            message += 's';
        }

        return message;
    },
    noResults      : function ()
    {
        return 'No results found';
    },
    searching      : function ()
    {
        return 'Searching…';
    },
    removeAllItems : function ()
    {
        return 'Remove all items';
    },
    removeItem     : function ()
    {
        return 'Remove item';
    }
};
