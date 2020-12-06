import { ITranslation } from './types/types';
import { extend } from './utils/extend';

export class Translation
{
    dict: ITranslation;

    constructor(dict?)
    {
        this.dict = dict || {};
    }

    all(): ITranslation
    {
        return this.dict;
    }

    get(key: string)
    {
        return this.dict[key];
    }

    extend(translation: Translation): void
    {
        this.dict = extend({}, translation.all(), this.dict);
    }
}
