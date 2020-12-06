import { TsSelect2 } from '../../core';
import { KEYS } from '../../keys';
import { ISelection } from '../../types/selection';
import { Utils } from '../../utils/utils';
import { elementFromString } from '../../utils/element-from-string';
import { createListener } from '../../utils/event-listener/listener';

export const SelectionSearch = (target: ISelection) =>
{
    return class SelectionSearch extends target
    {
        searchContainer: HTMLElement;
        search: HTMLInputElement;
        _keyUpPrevented: boolean;

        render(): HTMLSpanElement
        {
            const search = elementFromString(
                '<li class="select2-search select2-search--inline">' +
                '<input class="select2-search__field" type="search" tabindex="-1"' +
                ' autocorrect="off" autocapitalize="none"' +
                ' spellcheck="false" role="searchbox" aria-autocomplete="list" />' +
                '</li>'
            );

            this.searchContainer = search;
            this.search          = search.querySelector('input');

            this.search.autocomplete = this.options.get('autocomplete');

            const selectionId = this.core.id + '-container';
            this.search.setAttribute('aria-describedby', selectionId);

            const rendered = super.render();

            this._transferTabIndex();
            // rendered.append(this.searchContainer);

            return rendered;
        }

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            const resultsId = select.id + '-results';

            super.binding(select, container);

            select.on('open', () =>
            {
                this.search.setAttribute('aria-controls', resultsId);
                this.search.focus();
            });

            select.on('close', () =>
            {
                this.search.value = '';
                this.resizeSearch();
                this.search.removeAttribute('aria-controls');
                this.search.removeAttribute('aria-activedescendant');
                this.search.focus();
            });

            select.on('enable', () =>
            {
                this.search.disabled = false;
                this._transferTabIndex();
            });

            select.on('disable', () =>
            {
                this.search.disabled = true;
            });

            select.on('focus', () =>
            {
                this.search.focus();
            });

            select.on('results:focus', (params: any) =>
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

            createListener({
                elements : this.searchContainer,
                events   : 'focusin',
                listeners: this.core.listeners,
                callback : (evt: any) =>
                {
                    this.search.focus();
                }
            });

            createListener({
                elements : this.searchContainer,
                events   : 'focusout',
                listeners: this.core.listeners,
                callback : (evt: any) =>
                {
                    this._handleBlur(evt);
                }
            });

            createListener({
                elements : this.searchContainer,
                events   : 'keydown',
                listeners: this.core.listeners,
                callback : (evt: any) =>
                {
                    evt.stopPropagation();

                    this.trigger('keypress', evt);

                    this._keyUpPrevented = evt.defaultPrevented;

                    const key = evt.which;

                    if (key === KEYS.BACKSPACE && this.search.value === '')
                    {
                        const previousChoice = Utils.getLastElement(this.selection, '.select2-selection__choice');

                        if (!!previousChoice)
                        {
                            const item = Utils.GetData(previousChoice as HTMLElement, 'data');

                            this.searchRemoveChoice(item);

                            evt.preventDefault();
                        }
                    }
                }
            });

            createListener({
                elements : this.searchContainer,
                events   : 'click',
                listeners: this.core.listeners,
                callback : (evt: any) =>
                {
                    if (this.search.value)
                    {
                        evt.stopPropagation();
                    }
                }
            });

            // Try to detect the IE version should the `documentMode` property that
            // is stored on the document. This is only implemented in IE and is
            // slightly cleaner than doing a user agent check.
            // This property is not available in Edge, but Edge also doesn't have
            // this bug.
            const msie               = document['documentMode'];
            const disableInputEvents = msie && msie <= 11;

            createListener({
                elements : this.search,
                events   : 'input keyup',
                listeners: this.core.listeners,
                callback : (event, eventName) =>
                {
                    // IE will trigger the `input` event when a placeholder is used on a
                    // search box. To get around this issue, we are forced to ignore all
                    // `input` events in IE and keep using `keyup`.
                    if (disableInputEvents && eventName === 'input')
                    {
                        return;
                    }

                    const key = event.which;

                    // We can freely ignore events from modifier keys
                    if (key === KEYS.SHIFT || key === KEYS.CTRL || key === KEYS.ALT)
                    {
                        return;
                    }

                    // Tabbing will be handled during the `keydown` phase
                    if (key === KEYS.TAB)
                    {
                        return;
                    }

                    this.handleSearch();
                }
            });
        }

        _transferTabIndex(): void
        {
            this.search.setAttribute('tabindex', this.selection.getAttribute('tabindex'));
            this.selection.setAttribute('tabindex', '-1');
        }

        createPlaceholder(placeholder): void
        {
            this.search.setAttribute('placeholder', placeholder.text);
        }

        update(data): void
        {
            const searchHadFocus = this.search === document.activeElement;

            this.search.setAttribute('placeholder', '');

            super.update(data);

            this.selection
                .querySelector('.select2-selection__rendered')
                .append(this.searchContainer);

            this.resizeSearch();
            if (searchHadFocus)
            {
                this.search.focus();
            }
        }

        handleSearch(): void
        {
            this.resizeSearch();

            if (!this._keyUpPrevented)
            {
                const input = this.search.value;

                this.trigger('query', {
                    term: input
                });
            }

            this._keyUpPrevented = false;
        }

        searchRemoveChoice(item): void
        {
            this.trigger('unselect', {
                data: item
            });

            this.search.value = item.text;
            this.handleSearch();
        }

        resizeSearch(): void
        {
            this.search.style.width = '25px';

            let width = '100%';

            if (this.search.getAttribute('placeholder') === '')
            {
                const minimumWidth = this.search.value.length + 1;

                width = (minimumWidth * 0.75) + 'em';
            }

            this.search.style.width = width;
        }
    }
};

