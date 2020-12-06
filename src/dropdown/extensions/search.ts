import { TsSelect2 } from '../../core';
import { IDropdown } from '../../types/dropdown';
import { elementFromString } from '../../utils/element-from-string';
import { createListener, destroyListener } from '../../utils/event-listener/listener';
import { eventTrigger } from '../../utils/event-trigger';

export const DropdownSearch = (target: IDropdown) =>
{
    return class DropdownSearch extends target
    {
        search: HTMLInputElement;
        searchContainer: HTMLSpanElement;
        _keyUpPrevented: boolean;

        render(): HTMLSpanElement
        {
            const rendered = super.render();

            const search = elementFromString<HTMLSpanElement>(
                '<span class="select2-search select2-search--dropdown">' +
                '<input class="select2-search__field" type="search" tabindex="-1"' +
                ' autocorrect="off" autocapitalize="none"' +
                ' spellcheck="false" role="searchbox" aria-autocomplete="list" />' +
                '</span>'
            );

            this.searchContainer     = search;
            this.search              = search.querySelector<HTMLInputElement>('input');
            this.search.autocomplete = this.options.get('autocomplete');

            rendered.prepend(search);

            return rendered;
        }

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            const resultsId = select.id + '-results';

            super.binding(select, container);

            createListener({
                elements : this.search,
                events   : 'keydown',
                listeners: this.core.listeners,
                callback : (event: KeyboardEvent) =>
                {
                    this.trigger('keypress', event);
                    this._keyUpPrevented = event.defaultPrevented;
                }
            });

            const keyupListener = createListener({
                elements : this.search,
                events   : 'keyup',
                listeners: this.core.listeners,
                callback : (event, eventName) =>
                {
                    this.handleSearch(event);
                }
            });

            // Workaround for browsers which do not support the `input` event
            // This will prevent double-triggering of events for browsers which support
            // both the `keyup` and `input` events.
            createListener({
                elements : this.search,
                events   : 'input',
                listeners: this.core.listeners,
                callback : event =>
                {
                    destroyListener(keyupListener);
                    this.handleSearch(event);
                }
            });

            select.on('open', () =>
            {
                this.search.setAttribute('tabindex', '0');
                this.search.setAttribute('aria-controls', resultsId);

                setTimeout(() => eventTrigger(this.search, 'focus'));
            });

            select.on('close', () =>
            {
                this.search.setAttribute('tabindex', '-1');
                this.search.removeAttribute('aria-controls');
                this.search.removeAttribute('aria-activedescendant');

                this.search.value = '';
                eventTrigger(this.search, 'blur');
            });

            select.on('focus', event =>
            {
                if (!select.isOpen())
                {
                    eventTrigger(this.search, 'focus');
                }
            });

            select.on('results:all', params =>
            {
                if (params.query.term == null || params.query.term === '')
                {
                    const showSearch = this.showSearch(params);

                    if (showSearch)
                    {
                        this.searchContainer.classList.remove('select2-search--hide');
                    }
                    else
                    {
                        this.searchContainer.classList.add('select2-search--hide');
                    }
                }
            });

            select.on('results:focus', params =>
            {
                if (params.data._resultId)
                {
                    this.search.setAttribute('aria-activedescendant', params.data._resultId);
                }
                else
                {
                    this.search.removeAttribute('aria-activedescendant');
                }
            });
        }

        handleSearch(evt): void
        {
            if (!this._keyUpPrevented)
            {
                const input = this.search.value;

                this.trigger('query', {
                    term: input
                });
            }

            this._keyUpPrevented = false;
        }

        showSearch(params): boolean
        {
            return true;
        }
    }
};

