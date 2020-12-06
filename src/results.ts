import { TsSelect2 } from './core';
import { Observable } from './helper/observable';
import { Options } from './options';
import { Translation } from './translation';
import { IAdapter } from './types/adapter';
import { Utils } from './utils/utils';
import { createListener, destroyListener, Listener } from './utils/event-listener/listener';
import { elementFromString } from './utils/element-from-string';
import { eventTrigger } from './utils/event-trigger';
import { setAttributes } from './utils/set-attributes';
import { getElementOffset } from './utils/get-element-offset';
import { getElementOuterHeight } from './utils/get-element-size';

export class Results extends Observable
{
    core: TsSelect2;
    data: IAdapter;
    options: Options;
    results: HTMLUListElement;
    mouseenterListeners: Listener[] = [];

    constructor(element: TsSelect2, options: Options, dataAdapter: IAdapter)
    {
        super();
        this.core    = element;
        this.data    = dataAdapter;
        this.options = options;
    }

    render(): HTMLElement
    {
        const results = elementFromString<HTMLUListElement>(
            '<ul class="select2-results__options" role="listbox"></ul>'
        );

        if (this.options.get('multiple'))
        {
            results.setAttribute('aria-multiselectable', 'true');
        }

        this.results = results;
        return results;
    }

    clear(): void
    {
        Utils.elementEmpty(this.results);
    }

    displayMessage(params): void
    {
        const escapeMarkup = this.options.get<Function>('escapeMarkup');

        this.clear();
        this.hideLoading();

        const messageElement = elementFromString(
            '<li role="alert" aria-live="assertive" class="select2-results__option"></li>'
        );

        const message = this.options.get<Translation>('translations').get(params.message);

        messageElement.append(
            escapeMarkup(
                message(params.args)
            )
        );

        messageElement.className += ' select2-results__message';

        this.results.append(messageElement);
    }

    hideMessages(): void
    {
        const message = this.results.querySelector('.select2-results__message');
        if (message)
        {
            message.remove();
        }
    }

    append(data): void
    {
        this.hideLoading();

        const options = [];

        if (data.results == null || data.results.length === 0)
        {
            if (this.results.children.length === 0)
            {
                this.trigger('results:message', {
                    message: 'noResults'
                });
            }

            return;
        }

        data.results = this.sort(data.results);

        for (let d = 0; d < data.results.length; d++)
        {
            const item   = data.results[d];
            const option = this.option(item);
            options.push(option);
        }

        options.forEach(option =>
        {
            this.results.appendChild(option);
        });
    }

    position(results: HTMLElement, dropdown: HTMLElement): void
    {
        const resultsContainer = dropdown.querySelector('.select2-results');
        resultsContainer.append(results);
    }

    sort(data): any
    {
        const sorter = this.options.get<Function>('sorter');
        return sorter(data);
    }

    highlightFirstItem(): void
    {
        const options  = this.results.querySelectorAll('.select2-results__option--selectable');
        const selected = Array.from(options).filter(opt =>
        {
            return opt.classList.contains('select2-results__option--selected');
        });

        // Check if there are any selected options
        if (selected.length > 0)
        {
            // If there are selected options, highlight the first
            eventTrigger(selected[0] as HTMLElement, 'mouseenter');
        }
        else
        {
            // If there are no selected options, highlight the first option
            // in the dropdown
            eventTrigger(options[0] as HTMLElement, 'mouseenter');
        }

        this.ensureHighlightVisible();
    }

    setClasses(): void
    {
        this.data.current((selected) =>
        {
            const selectedIds = selected.map(s => s.id.toString());
            const options     = this.results.querySelectorAll(
                '.select2-results__option--selectable'
            );

            options.forEach((option: HTMLElement) =>
            {
                const item = Utils.GetData(option, 'data');

                // id needs to be converted to a string when comparing
                const id = '' + item.id;

                if ((item.element != null && item.element.selected) ||
                    (item.element == null && selectedIds.indexOf(id) > -1))
                {
                    option.classList.add('select2-results__option--selected');
                    option.setAttribute('aria-selected', 'true');
                }
                else
                {
                    option.classList.remove('select2-results__option--selected');
                    option.setAttribute('aria-selected', 'false');
                }
            });
        });
    }

    showLoading(params): void
    {
        this.hideLoading();

        const loadingMore    = this.options.get<Translation>('translations').get('searching');
        const loading        = {
            disabled: true,
            loading : true,
            text    : loadingMore(params)
        };
        const loadingElement = this.option(loading);
        loadingElement.className += ' loading-results';

        this.results.prepend(loadingElement);
    }

    hideLoading(): void
    {
        const loading = this.results.querySelector('.loading-results');
        if (loading)
        {
            loading.remove();
        }
    }

    option(data): HTMLLIElement
    {
        const option = document.createElement('li');
        option.classList.add('select2-results__option');
        option.classList.add('select2-results__option--selectable');

        const attrs: any = {
            'role': 'option'
        };

        const matches = Element.prototype.matches ||
            Element.prototype['msMatchesSelector'] ||
            Element.prototype.webkitMatchesSelector;

        if ((data.element != null && matches.call(data.element, ':disabled')) ||
            (data.element == null && data.disabled))
        {
            attrs['aria-disabled'] = 'true';

            option.classList.remove('select2-results__option--selectable');
            option.classList.add('select2-results__option--disabled');
        }

        if (data.id == null)
        {
            option.classList.remove('select2-results__option--selectable');
        }

        if (data._resultId != null)
        {
            option.id = data._resultId;
        }

        if (data.title)
        {
            option.title = data.title;
        }

        if (data.children)
        {
            attrs.role          = 'group';
            attrs['aria-label'] = data.text;

            option.classList.remove('select2-results__option--selectable');
            option.classList.add('select2-results__option--group');
        }

        for (const attr in attrs)
        {
            if (attrs.hasOwnProperty(attr))
            {
                const val = attrs[attr];
                option.setAttribute(attr, val);
            }
        }

        if (data.children)
        {
            const label     = document.createElement('strong');
            label.className = 'select2-results__group';

            this.template(data, label);

            const children = [];

            for (let c = 0; c < data.children.length; c++)
            {
                const child  = data.children[c];
                const $child = this.option(child);

                children.push($child);
            }

            const childrenContainer = elementFromString('<ul></ul>');
            setAttributes(childrenContainer, {
                'class': 'select2-results__options select2-results__options--nested',
                'role' : 'none'
            });

            childrenContainer.append(...children);

            option.append(label);
            option.append(childrenContainer);
        }
        else
        {
            this.template(data, option);
        }

        Utils.StoreData(option, 'data', data);

        return option;
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        const id = select.id + '-results';

        this.results.setAttribute('id', id);

        select.on('results:all', (params) =>
        {
            this.clear();
            this.append(params.data);

            if (select.isOpen())
            {
                this.setClasses();
                this.highlightFirstItem();
            }
        });

        select.on('results:append', (params) =>
        {
            this.append(params.data);

            if (select.isOpen())
            {
                this.setClasses();
            }
        });

        select.on('query', (params) =>
        {
            this.hideMessages();
            this.showLoading(params);
        });

        select.on('select', () =>
        {
            if (!select.isOpen())
            {
                return;
            }

            this.setClasses();

            if (this.options.get('scrollAfterSelect'))
            {
                this.highlightFirstItem();
            }
        });

        select.on('unselect', () =>
        {
            if (!select.isOpen())
            {
                return;
            }

            this.setClasses();

            if (this.options.get('scrollAfterSelect'))
            {
                this.highlightFirstItem();
            }
        });

        select.on('open', () =>
        {
            // When the dropdown is open, aria-expended="true"
            this.results.setAttribute('aria-expanded', 'true');
            this.results.setAttribute('aria-hidden', 'false');

            this.setClasses();
            this.ensureHighlightVisible();
        });

        select.on('close', () =>
        {
            // When the dropdown is closed, aria-expended="false"
            this.results.setAttribute('aria-expanded', 'false');
            this.results.setAttribute('aria-hidden', 'true');
            this.results.removeAttribute('aria-activedescendant');
        });

        select.on('results:toggle', () =>
        {
            const highlighted = this.getHighlightedResults();

            if (highlighted.length === 0)
            {
                return;
            }

            highlighted.forEach(element => eventTrigger(element, 'mouseup'));
        });

        select.on('results:select', () =>
        {
            const highlighted = this.getHighlightedResults();

            if (highlighted.length === 0)
            {
                return;
            }

            const data = Utils.GetData(highlighted[0], 'data');

            if (highlighted[0].classList.contains('select2-results__option--selected'))
            {
                this.trigger('close', {});
            }
            else
            {
                this.trigger('select', {
                    data: data
                });
            }
        });

        select.on('results:previous', () =>
        {
            const highlighted = this.getHighlightedResults();

            const options      = this.results.querySelectorAll('.select2-results__option--selectable');
            const currentIndex = [].indexOf.call(options, highlighted);

            // If we are already at the top, don't move further
            // If no options, currentIndex will be -1
            if (currentIndex <= 0)
            {
                return;
            }

            let nextIndex = currentIndex - 1;

            // If none are highlighted, highlight the first
            if (!highlighted)
            {
                nextIndex = 0;
            }

            const $next = options[nextIndex];

            eventTrigger($next, 'mouseenter');

            const currentOffset = getElementOffset(this.results).top;
            const nextTop       = getElementOffset($next).top;
            const nextOffset    = this.results.scrollTop + (nextTop - currentOffset);

            if (nextIndex === 0)
            {
                this.results.scrollTop = 0;
            }
            else if (nextTop - currentOffset < 0)
            {
                this.results.scrollTop = nextOffset;
            }
        });

        select.on('results:next', () =>
        {
            const highlighted = this.getHighlightedResults();

            const options      = this.results.querySelectorAll('.select2-results__option--selectable');
            const currentIndex = [].indexOf.call(options, highlighted);

            const nextIndex = currentIndex + 1;

            // If we are at the last option, stay there
            if (nextIndex >= options.length)
            {
                return;
            }

            const $next = options[nextIndex];

            eventTrigger($next, 'mouseenter');

            const currentOffset = getElementOffset(this.results).top + getElementOuterHeight(this.results);
            const nextBottom    = getElementOffset($next).top + getElementOuterHeight($next);
            const nextOffset    = this.results.scrollTop + nextBottom - currentOffset;

            if (nextIndex === 0)
            {
                this.results.scrollTop = 0;
            }
            else if (nextBottom > currentOffset)
            {
                this.results.scrollTop = nextOffset;
            }
        });

        select.on('results:focus', (params) =>
        {
            params.element.classList.add('select2-results__option--highlighted');
            params.element.setAttribute('aria-selected', 'true');
        });

        select.on('results:message', (params) =>
        {
            this.displayMessage(params);
        });

        const getSelectables = (): NodeListOf<HTMLLIElement> =>
        {
            return this.results.querySelectorAll<HTMLLIElement>('.select2-results__option--selectable');
        };

        createListener({
            elements : this.results,
            events   : 'mouseup',
            listeners: this.core.listeners,
            callback : (originalEvent) =>
            {
                const element = (originalEvent.target as HTMLElement).closest(
                    '.select2-results__option--selectable'
                );
                if (!element)
                {
                    return;
                }
                const data = Utils.GetData(element as HTMLElement, 'data');
                if (element.classList.contains('select2-results__option--selected'))
                {
                    if (this.options.get('multiple'))
                    {
                        this.trigger('unselect', { originalEvent, data });
                    }
                    else
                    {
                        this.trigger('close', {});
                    }

                    return;
                }

                this.trigger('select', { originalEvent, data });
            }
        });

        createListener({
            elements : this.results,
            events   : 'mouseenter',
            listeners: this.core.listeners,
            callback : () =>
            {
                destroyListener(this.mouseenterListeners);

                createListener({
                    elements : getSelectables(),
                    events   : 'mouseenter',
                    listeners: this.mouseenterListeners,
                    callback : (originalEvent: MouseEvent) =>
                    {
                        const element = originalEvent.target as HTMLLIElement;

                        this.getHighlightedResults().forEach(element =>
                        {
                            element.classList.remove('select2-results__option--highlighted');
                            element.setAttribute('aria-selected', 'false');
                        });

                        const data = Utils.GetData(element, 'data');
                        this.trigger('results:focus', { data, element });
                    }
                });
            }
        });
    }

    getHighlightedResults(): NodeListOf<HTMLElement>
    {
        return this.results.querySelectorAll<HTMLElement>('.select2-results__option--highlighted');
    }

    destroy(): void
    {
        this.results.remove();

        destroyListener(this.mouseenterListeners);
    }

    ensureHighlightVisible(): void
    {
        const highlighted = this.getHighlightedResults();

        if (highlighted.length === 0)
        {
            return;
        }

        const options      = this.results.querySelectorAll('.select2-results__option--selectable');
        const currentIndex = [].indexOf.call(options, highlighted);

        const currentOffset = getElementOffset(this.results).top;
        const nextTop       = getElementOffset(highlighted[0]).top;
        let nextOffset      = this.results.scrollTop + (nextTop - currentOffset);

        const offsetDelta = nextTop - currentOffset;
        nextOffset -= getElementOuterHeight(highlighted[0]) * 2;

        if (currentIndex <= 2)
        {
            this.results.scrollTop = 0;
        }
        else if (offsetDelta > getElementOuterHeight(this.results) || offsetDelta < 0)
        {
            this.results.scrollTop = nextOffset;
        }
    }

    template(result, container): void
    {
        const template     = this.options.get<Function>('templateResult');
        const escapeMarkup = this.options.get<Function>('escapeMarkup');

        const content = template(result, container);

        if (content == null)
        {
            container.style.display = 'none';
        }
        else if (typeof content === 'string')
        {
            container.innerHTML = escapeMarkup(content);
        }
        else
        {
            container.append(content);
        }
    }
}
