import { TsSelect2 } from '../core';
import { Observable } from '../helper/observable';
import { Utils } from '../utils/utils';

export class BaseAdapter extends Observable
{
    constructor()
    {
        super();
    }

    current(callback): void
    {
        throw new Error('The `current` method must be defined in child classes.');
    }

    query(...args: any): void
    {
        throw new Error('The `query` method must be defined in child classes.');
    }

    binding(...args: any): void
    {
        // Can be implemented in subclasses
    }

    destroy(): void
    {
        // Can be implemented in subclasses
    }

    generateResultId(container: TsSelect2, data): string
    {
        let id = container.id + '-result-';

        id += Utils.generateChars(4);

        if (data.id != null)
        {
            id += '-' + data.id.toString();
        }
        else
        {
            id += '-' + Utils.generateChars(4);
        }
        return id;
    }
}
