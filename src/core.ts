import { Observable } from './helper/observable';
import { KEYS } from './keys';
import { Options } from './options';
import { IAdapter } from './types/adapter';
import { IDropdown } from './types/dropdown';
import { IResults } from './types/results';
import { ISelection } from './types/selection';
import { ISelect2, SelectOptions } from './types/types';
import { Utils } from './utils/utils';
import { createListener, destroyListener, Listener } from './utils/event-listener/listener';
import { insertAfter } from './utils/insert-after';
import { setStyles } from './utils/set-styles';
import { getElementOuterWidth } from './utils/get-element-size';
import { eventTrigger } from './utils/event-trigger';
import { elementFromString } from './utils/element-from-string';

export class TsSelect2 extends Observable implements ISelect2
{
    element: HTMLSelectElement;
    id: string;
    options: Options;
    dataAdapter: IAdapter;
    selection: ISelection;
    selectionElement: HTMLElement;
    container: HTMLSpanElement;
    dropdownElement: HTMLElement;
    resultsElement: any;
    dropdown: IDropdown;
    results: IResults;
    listeners: Listener[] = [];

    _observer: MutationObserver;
    _syncA: any;
    _syncS: any;

    constructor(element: HTMLSelectElement, options: SelectOptions)
    {
        super();
        if (Utils.GetData(element, 'select2') != null)
        {
            Utils.GetData(element, 'select2').destroy();
        }

        this.element = element;
        this.id      = this._generateId(element);

        options      = options || {};
        this.options = new Options(options, element);

        // Set up the tabindex

        const tabindex = element.getAttribute('tabindex') || 0;
        Utils.StoreData(element, 'old-tabindex', tabindex);
        element.setAttribute('tabindex', '-1');

        // Set up containers and adapters

        const DataAdapter = this.options.get<IAdapter>('dataAdapter');
        this.dataAdapter  = new DataAdapter(this, this.options);

        const container = this.render();

        this._placeContainer(container);

        const SelectionAdapter = this.options.get<any>('selectionAdapter');
        this.selection         = new SelectionAdapter(this, this.options);
        this.selectionElement  = this.selection.render();

        this.selection.position(this.selectionElement, container);

        const DropdownAdapter = this.options.get<any>('dropdownAdapter');
        this.dropdown         = new DropdownAdapter(this, this.options);
        this.dropdownElement  = this.dropdown.render();

        this.dropdown.position(this.dropdownElement, container);

        const ResultsAdapter = this.options.get<any>('resultsAdapter');
        this.results         = new ResultsAdapter(this, this.options, this.dataAdapter);
        this.resultsElement  = this.results.render();

        this.results.position(this.resultsElement, this.dropdownElement);

        // Bind events

        // Bind the container to all of the adapters
        this._bindAdapters();

        // Register any DOM event handlers
        this._registerDomEvents();

        // Register any internal event handlers
        this._registerDataEvents();
        this._registerSelectionEvents();
        this._registerDropdownEvents();
        this._registerResultsEvents();
        this._registerEvents();

        // Set the initial state
        this.dataAdapter.current(initialData =>
        {
            this.trigger('selection:update', {
                data: initialData
            });
        });

        // Hide the original select
        element.classList.add('select2-hidden-accessible');
        element.setAttribute('aria-hidden', 'true');

        // Synchronize any monitored attributes
        this._syncAttributes();

        Utils.StoreData(element, 'select2', this);
    }

    _generateId($element: HTMLElement): string
    {
        let id = '';

        if ($element.getAttribute('id') != null)
        {
            id = $element.getAttribute('id');
        }
        else if ($element.getAttribute('name') != null)
        {
            id = $element.getAttribute('name') + '-' + Utils.generateChars(2);
        }
        else
        {
            id = Utils.generateChars(4);
        }

        id = id.replace(/(:|\.|\[|\]|,)/g, '');
        id = 'select2-' + id;

        return id;
    }

    _placeContainer($container: HTMLElement): void
    {
        insertAfter($container, this.element);

        const width = this._resolveWidth(this.element, this.options.get('width'));

        if (width != null)
        {
            setStyles($container, { width });
        }
    }

    _resolveWidth($element: HTMLElement, method: string): string
    {
        const WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;

        if (method === 'resolve')
        {
            const styleWidth = this._resolveWidth($element, 'style');

            if (styleWidth != null)
            {
                return styleWidth;
            }

            return this._resolveWidth($element, 'element');
        }

        if (method === 'element')
        {
            const elementWidth = getElementOuterWidth($element);

            if (elementWidth <= 0)
            {
                return 'auto';
            }

            return elementWidth + 'px';
        }

        if (method === 'style')
        {
            const style = $element.getAttribute('style');

            if (typeof (style) !== 'string')
            {
                return null;
            }

            const attrs = style.split(';');

            for (let i = 0, l = attrs.length; i < l; i = i + 1)
            {
                const attr    = attrs[i].replace(/\s/g, '');
                const matches = attr.match(WIDTH);

                if (matches !== null && matches.length >= 1)
                {
                    return matches[1];
                }
            }

            return null;
        }

        if (method === 'computedstyle')
        {
            const computedStyle = window.getComputedStyle($element);

            return computedStyle.width;
        }

        return method;
    }

    _bindAdapters(): void
    {
        this.dataAdapter.binding(this, this.container);
        this.selection.binding(this, this.container);

        this.dropdown.binding(this, this.container);
        this.results.binding(this, this.container);
    }

    _registerDomEvents(): void
    {
        createListener({
            elements : this.element,
            events   : 'change',
            listeners: this.listeners,
            callback : () =>
            {
                this.dataAdapter.current((data) =>
                {
                    this.trigger('selection:update', {
                        data: data
                    });
                });
            }
        });

        createListener({
            elements : this.element,
            events   : 'focus',
            listeners: this.listeners,
            callback : (evt) =>
            {
                this.trigger('focus', evt);
            }
        });

        this._syncA = Utils.bind(this._syncAttributes, this);
        this._syncS = Utils.bind(this._syncSubtree, this);

        this._observer = new MutationObserver(mutations =>
        {
            this._syncA();
            this._syncS(mutations);
        });
        this._observer.observe(this.element, {
            attributes: true,
            childList : true,
            subtree   : false
        });
    }

    _registerDataEvents(): void
    {
        this.dataAdapter.on('*', (name, params) =>
        {
            this.trigger(name, params);
        });
    }

    _registerSelectionEvents(): void
    {
        const nonRelayEvents = ['toggle', 'focus'];

        this.selection.on('toggle', () =>
        {
            this.toggleDropdown();
        });

        this.selection.on('focus', params =>
        {
            this.focus(params);
        });

        this.selection.on('*', (name, params) =>
        {
            if (nonRelayEvents.indexOf(name) !== -1)
            {
                return;
            }

            this.trigger(name, params);
        });
    }

    _registerDropdownEvents(): void
    {
        this.dropdown.on('*', (name, params) =>
        {
            this.trigger(name, params);
        });
    }

    _registerResultsEvents(): void
    {
        this.results.on('*', (name, params) =>
        {
            this.trigger(name, params);
        });
    }

    _registerEvents(): void
    {
        this.on('open', () =>
        {
            this.container.classList.add('select2-container--open');
        });

        this.on('close', () =>
        {
            this.container.classList.remove('select2-container--open');
        });

        this.on('enable', () =>
        {
            this.container.classList.remove('select2-container--disabled');
        });

        this.on('disable', () =>
        {
            this.container.classList.add('select2-container--disabled');
        });

        this.on('blur', () =>
        {
            this.container.classList.remove('select2-container--focus');
        });

        this.on('query', (event) =>
        {
            if (!this.isOpen())
            {
                this.trigger('open', {});
            }

            this.dataAdapter.query(event, (data) =>
            {
                this.trigger('results:all', {
                    data : data,
                    query: event
                });
            });
        });

        this.on('query:append', (event) =>
        {
            this.dataAdapter.query(event, data =>
            {
                this.trigger('results:append', {
                    data : data,
                    query: event
                });
            });
        });

        this.on('keypress', (evt) =>
        {
            const key = evt.which;

            if (this.isOpen())
            {
                if (key === KEYS.ESC || key === KEYS.TAB ||
                    (key === KEYS.UP && evt.altKey))
                {
                    this.close(evt);

                    evt.preventDefault();
                }
                else if (key === KEYS.ENTER)
                {
                    this.trigger('results:select', {});

                    evt.preventDefault();
                }
                else if ((key === KEYS.SPACE && evt.ctrlKey))
                {
                    this.trigger('results:toggle', {});

                    evt.preventDefault();
                }
                else if (key === KEYS.UP)
                {
                    this.trigger('results:previous', {});

                    evt.preventDefault();
                }
                else if (key === KEYS.DOWN)
                {
                    this.trigger('results:next', {});

                    evt.preventDefault();
                }
            }
            else
            {
                if (key === KEYS.ENTER || key === KEYS.SPACE ||
                    (key === KEYS.DOWN && evt.altKey))
                {
                    this.open();

                    evt.preventDefault();
                }
            }
        });
    }

    _syncAttributes(): void
    {
        this.options.set('disabled', this.element.disabled);

        if (this.isDisabled())
        {
            if (this.isOpen())
            {
                this.close();
            }

            this.trigger('disable', {});
        }
        else
        {
            this.trigger('enable', {});
        }
    }

    _isChangeMutation(mutations): boolean
    {
        if (mutations.addedNodes && mutations.addedNodes.length > 0)
        {
            for (let n = 0; n < mutations.addedNodes.length; n++)
            {
                const node = mutations.addedNodes[n];

                if (node.selected)
                {
                    return true;
                }
            }
        }
        else if (mutations.removedNodes && mutations.removedNodes.length > 0)
        {
            return true;
        }
        else if (Array.isArray(mutations))
        {
            return mutations.some(mutation => this._isChangeMutation(mutation));
        }

        return false;
    }

    _syncSubtree(mutations): void
    {
        const changed = this._isChangeMutation(mutations);

        // Only re-pull the data if we think there is a change
        if (changed)
        {
            this.dataAdapter.current(currentData =>
            {
                this.trigger('selection:update', {
                    data: currentData
                });
            });
        }
    }

    select2(name: string): void
    {
        switch (name)
        {
            case 'open':
                this.open();
                break;

            case 'close':
                this.close();
                break;

            case 'destroy':
                this.destroy();
                break;
        }
    }

    /**
     * Override the trigger method to automatically trigger pre-events when
     * there are events that can be prevented.
     */
    trigger(name: string, args: any): void
    {
        const actualTrigger = super.trigger;
        const preTriggerMap = {
            'open'    : 'opening',
            'close'   : 'closing',
            'select'  : 'selecting',
            'unselect': 'unselecting',
            'clear'   : 'clearing'
        };

        if (args === undefined)
        {
            args = {};
        }

        if (name in preTriggerMap)
        {
            const preTriggerName = preTriggerMap[name];
            const preTriggerArgs = {
                prevented: false,
                name     : name,
                args     : args
            };

            actualTrigger.call(this, preTriggerName, preTriggerArgs);

            if (preTriggerArgs.prevented)
            {
                args.prevented = true;
                return;
            }
        }

        actualTrigger.call(this, name, args);
    }

    toggleDropdown(): void
    {
        if (this.isDisabled())
        {
            return;
        }

        if (this.isOpen())
        {
            this.close();
        }
        else
        {
            this.open();
        }
    }

    open(): void
    {
        if (this.isOpen())
        {
            return;
        }

        if (this.isDisabled())
        {
            return;
        }

        this.trigger('query', {});
    }

    close(evt?): void
    {
        if (!this.isOpen())
        {
            return;
        }

        this.trigger('close', { originalEvent: evt });
    }

    /**
     * Helper method to abstract the "enabled" (not "disabled") state of this
     * object.
     */
    isEnabled(): boolean
    {
        return !this.isDisabled();
    }

    /**
     * Helper method to abstract the "disabled" state of this object.
     */
    isDisabled(): boolean
    {
        return this.options.get('disabled');
    }

    isOpen(): boolean
    {
        return this.container.classList.contains('select2-container--open');
    }

    hasFocus(): boolean
    {
        return this.container.classList.contains('select2-container--focus');
    }

    focus(data: any): void
    {
        // No need to re-trigger focus events if we are already focused
        if (this.hasFocus())
        {
            return;
        }

        this.container.classList.add('select2-container--focus');
        this.trigger('focus', {});
    }

    enable(args: any): void
    {
        if (this.options.get('debug') && window.console && console.warn)
        {
            console.warn(
                'TsSelect2: The `select2("enable")` method has been deprecated and will' +
                ' be removed in later TsSelect2 versions. Use element.prop("disabled")' +
                ' instead.'
            );
        }

        if (args == null || args.length === 0)
        {
            args = [true];
        }

        this.element.disabled = !args[0];
    }

    data(): any[]
    {
        if (this.options.get('debug') &&
            arguments.length > 0 && window.console && console.warn)
        {
            console.warn(
                'TsSelect2: Data can no longer be set using `select2("data")`. You ' +
                'should consider setting the value instead using `element.val()`.'
            );
        }

        let data = [];

        this.dataAdapter.current(currentData =>
        {
            data = currentData;
        });

        return data;
    }

    val(args): any
    {
        if (this.options.get('debug') && window.console && console.warn)
        {
            console.warn(
                'TsSelect2: The `select2("val")` method has been deprecated and will be' +
                ' removed in later TsSelect2 versions. Use element.val() instead.'
            );
        }

        if (args == null || args.length === 0)
        {
            return this.element.value;
        }

        let newVal = args[0];

        if (Array.isArray(newVal))
        {
            newVal = newVal.map(function (obj)
            {
                return obj.toString();
            });
        }

        eventTrigger(this.element, 'input', newVal);
        eventTrigger(this.element, 'change', newVal);
    }

    destroy(): void
    {
        this.container.remove();

        this._observer.disconnect();
        this._observer = null;

        this._syncA = null;
        this._syncS = null;

        destroyListener(this.listeners);

        this.element.setAttribute('tabindex', Utils.GetData(this.element, 'old-tabindex'));

        this.element.classList.remove('select2-hidden-accessible');
        this.element.setAttribute('aria-hidden', 'false');
        Utils.RemoveData(this.element);
        delete this.element.dataset['select2'];

        this.dataAdapter.destroy();
        this.selection.destroy();
        this.dropdown.destroy();
        this.results.destroy();

        this.dataAdapter = null;
        this.selection   = null;
        this.dropdown    = null;
        this.results     = null;
    }

    render(): HTMLSpanElement
    {
        const container = elementFromString<HTMLSpanElement>(
            '<span class="select2 select2-container">' +
            '<span class="selection"></span>' +
            '<span class="dropdown-wrapper" aria-hidden="true"></span>' +
            '</span>'
        );
        container.setAttribute('dir', this.options.get('dir'));

        this.container = container;
        this.container.classList.add('select2-container--' + this.options.get('theme'));
        Utils.StoreData(container, 'element', this);

        return container;
    }
}
