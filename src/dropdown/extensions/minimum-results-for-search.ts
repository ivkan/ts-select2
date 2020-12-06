import { IDropdown } from '../../types/dropdown';

export const MinimumResultsForSearch = (target: IDropdown) =>
{
    return class MinimumResultsForSearch extends target
    {
        minimumResultsForSearch: number;

        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);
            this.minimumResultsForSearch = this.options.get('minimumResultsForSearch');

            if (this.minimumResultsForSearch < 0)
            {
                this.minimumResultsForSearch = Infinity;
            }
        }

        showSearch(params): boolean
        {
            if (countResults(params.data.results) < this.minimumResultsForSearch)
            {
                return false;
            }

            // TODO: Maybe call super?
            return false;
        }
    }
};

function countResults(data): number
{
    let count = 0;

    for (let d = 0; d < data.length; d++)
    {
        const item = data[d];

        if (item.children)
        {
            count += countResults(item.children);
        }
        else
        {
            count++;
        }
    }

    return count;
}

