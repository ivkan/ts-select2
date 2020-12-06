import { BaseAdapter } from '../adapters/base';
import { TsSelect2 } from '../core';
import { Options } from '../options';
import { IdTextPair } from './types';

export interface IAdapter extends BaseAdapter
{
    core: TsSelect2;
    options: Options;
    container: HTMLElement;

    new(...constructorArgs: any[]): IAdapter

    select(data): void;
    triggerChange(value?: any): void;
    unselect(data): void;
    addOptions(options: (HTMLOptionElement|HTMLOptGroupElement)[]): void;
    option(data): HTMLOptionElement|HTMLOptGroupElement;
    item(option: HTMLOptionElement): any;
    matches(params, data): boolean;
    normalizeItem(item): any;
    removeOldTags?(_?): void;
    createTag?(params?): IdTextPair;
}
