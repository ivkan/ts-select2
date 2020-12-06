import { TsSelect2 } from '../../core';
import { Translation } from '../../translation';
import { IResults } from '../../types/results';
import { createListener } from '../../utils/event-listener/listener';
import { getElementOffset } from '../../utils/get-element-offset';
import { extend } from '../../utils/extend';
import { elementFromString } from '../../utils/element-from-string';

export const InfiniteScroll = (target: IResults) =>
{
    return class InfiniteScroll extends target
    {
        loadingMore: HTMLElement;
        loading: boolean;
        lastParams = {};

        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);

            this.loadingMore = this.createLoadingMore();
            this.loading     = false;
        }

        append(data): void
        {
            this.loadingMore.remove();
            this.loading = false;

            super.append(data);

            if (this.showLoadingMore(data))
            {
                this.results.append(this.loadingMore);
                this.loadMoreIfNeeded();
            }
        }

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            select.on('query', (params) =>
            {
                this.lastParams = params;
                this.loading    = true;
            });

            select.on('query:append', (params) =>
            {
                this.lastParams = params;
                this.loading    = true;
            });

            createListener({
                elements : this.results,
                events   : 'scroll',
                listeners: this.core.listeners,
                callback : () =>
                {
                    this.loadMoreIfNeeded();
                }
            });
        }

        loadMoreIfNeeded(): void
        {
            const isLoadMoreVisible = document.documentElement.contains(
                this.loadingMore
            );

            if (this.loading || !isLoadMoreVisible)
            {
                return;
            }

            const currentOffset     = getElementOffset(this.results).top + this.results.offsetHeight;
            const loadingMoreOffset = getElementOffset(this.loadingMore).top + this.loadingMore.offsetHeight;

            if (currentOffset + 50 >= loadingMoreOffset)
            {
                this.loadMore();
            }
        }

        loadMore(): void
        {
            this.loading = true;
            const params = extend<any>({}, { page: 1 }, this.lastParams);

            params.page++;

            this.trigger('query:append', params);
        }

        showLoadingMore(data): boolean
        {
            return data.pagination && data.pagination.more;
        }

        createLoadingMore(): HTMLLIElement
        {
            const option = elementFromString<HTMLLIElement>(
                '<li ' +
                'class="select2-results__option select2-results__option--load-more"' +
                'role="option" aria-disabled="true"></li>'
            );

            const message    = this.options.get<Translation>('translations').get('loadingMore');
            option.innerHTML = message(this.lastParams);

            return option;
        }
    };
};

