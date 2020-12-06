// Russian
import { ITranslation } from '../types/types';

function ending(count, one, couple, more)
{
    if (count % 10 < 5 && count % 10 > 0 &&
        count % 100 < 5 || count % 100 > 20)
    {
        if (count % 10 > 1)
        {
            return couple;
        }
    }
    else
    {
        return more;
    }

    return one;
}

export const RuTranslations: ITranslation = {
    errorLoading   : function ()
    {
        return 'Невозможно загрузить результаты';
    },
    inputTooLong   : function (args)
    {
        const overChars = args.input.length - args.maximum;

        let message = 'Пожалуйста, введите на ' + overChars + ' символ';

        message += ending(overChars, '', 'a', 'ов');

        message += ' меньше';

        return message;
    },
    inputTooShort  : function (args)
    {
        const remainingChars = args.minimum - args.input.length;

        let message = 'Пожалуйста, введите ещё хотя бы ' + remainingChars +
            ' символ';

        message += ending(remainingChars, '', 'a', 'ов');

        return message;
    },
    loadingMore    : function ()
    {
        return 'Загрузка данных…';
    },
    maximumSelected: function (args)
    {
        let message = 'Вы можете выбрать не более ' + args.maximum + ' элемент';

        message += ending(args.maximum, '', 'a', 'ов');

        return message;
    },
    noResults      : function ()
    {
        return 'Совпадений не найдено';
    },
    searching      : function ()
    {
        return 'Поиск…';
    },
    removeAllItems : function ()
    {
        return 'Удалить все элементы';
    },
    removeItem     : function ()
    {
        return 'Удалить элемент';
    }
};
