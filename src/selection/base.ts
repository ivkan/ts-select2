import { TsSelect2 } from '../core';
import { Observable } from '../helper/observable';
import { KEYS } from '../keys';
import { Options } from '../options';
import { Utils } from '../utils/utils';
import { IListener } from '../utils/event-listener/types';
import { elementFromString } from '../utils/element-from-string';
import { createListener, destroyListener } from '../utils/event-listener/listener';
import { eventTrigger } from '../utils/event-trigger';


export class BaseSelection extends Observable
{
    closeListeners: IListener[];
    selection: HTMLElement;
    core: TsSelect2;
    options: Options;
    _tabindex: number;

    constructor(core: TsSelect2, options: Options)
    {
        super();
        this.core           = core;
        this.options        = options;
        this.closeListeners = [];
    }

    render(): HTMLSpanElement
    {
        this.selection = elementFromString<HTMLSpanElement>(
            '<span class="select2-selection" role="combobox" ' +
            ' aria-haspopup="true" aria-expanded="false">' +
            '</span>'
        );

        this._tabindex = 0;

        if (Utils.GetData(this.core.element, 'old-tabindex') != null)
        {
            this._tabindex = Utils.GetData(this.core.element, 'old-tabindex');
        }
        else if (this.core.element.getAttribute('tabindex') != null)
        {
            this._tabindex = parseFloat(this.core.element.getAttribute('tabindex'));
        }

        this.selection.setAttribute('title', this.core.element.getAttribute('title'));
        this.selection.setAttribute('tabindex', this._tabindex.toString());
        this.selection.setAttribute('aria-disabled', 'false');

        return this.selection;
    }

    binding(select: TsSelect2, container: HTMLSpanElement): void
    {
        const resultsId = select.id + '-results';

        createListener({
            elements : this.selection,
            events   : 'focus',
            listeners: this.core.listeners,
            callback : (evt) =>
            {
                this.trigger('focus', evt);
            }
        });

        createListener({
            elements : this.selection,
            events   : 'blur',
            listeners: this.core.listeners,
            callback : (evt) =>
            {
                this._handleBlur(evt);
            }
        });

        createListener({
            elements : this.selection,
            events   : 'keydown',
            listeners: this.core.listeners,
            callback : (evt) =>
            {
                this.trigger('keypress', evt);

                if (evt.which === KEYS.SPACE)
                {
                    evt.preventDefault();
                }
            }
        });

        select.on('results:focus', (params) =>
        {
            this.selection.setAttribute('aria-activedescendant', params.data._resultId);
        });

        select.on('selection:update', (params) =>
        {
            this.update(params.data);
        });

        select.on('open', () =>
        {
            // When the dropdown is open, aria-expanded="true"
            this.selection.setAttribute('aria-expanded', 'true');
            this.selection.setAttribute('aria-owns', resultsId);

            this._attachCloseHandler(select);
        });

        select.on('close', () =>
        {
            // When the dropdown is closed, aria-expanded="false"
            this.selection.setAttribute('aria-expanded', 'false');
            this.selection.removeAttribute('aria-activedescendant');
            this.selection.removeAttribute('aria-owns');

            eventTrigger(this.selection, 'focus');

            this._detachCloseHandler();
        });

        select.on('enable', () =>
        {
            this.selection.setAttribute('tabindex', this._tabindex.toString());
            this.selection.setAttribute('aria-disabled', 'false');
        });

        select.on('disable', () =>
        {
            this.selection.setAttribute('tabindex', '-1');
            this.selection.setAttribute('aria-disabled', 'true');
        });
    }

    _handleBlur(evt): void
    {
        // This needs to be delayed as the active element is the body when the tab
        // key is pressed, possibly along with others.
        window.setTimeout(() =>
        {
            // Don't trigger `blur` if the focus is still in the selection
            if (
                (document.activeElement === this.selection) || (document.activeElement.contains(this.selection))
            )
            {
                return;
            }

            this.trigger('blur', evt);
        }, 1);
    }

    _attachCloseHandler(container: TsSelect2): void
    {
        createListener({
            elements : document.body,
            events   : 'mousedown',
            listeners: this.closeListeners,
            filter   : (e: MouseEvent) => !(e.target as HTMLElement).closest('.select2-dropdown'),
            callback : (e: MouseEvent) =>
            {
                const select = (e.target as HTMLElement).closest('.select2');
                const all    = Array.from(
                    document.querySelectorAll<HTMLSelectElement>('.select2.select2-container--open')
                );

                for (const element of all)
                {
                    if (element === select)
                    {
                        return;
                    }

                    const select2 = Utils.GetData(element, 'element');

                    if (select2)
                    {
                        select2.close();
                    }
                }
            }
        });
    }

    _detachCloseHandler(): void
    {
        destroyListener(this.closeListeners);
    }

    position(selection, container): void
    {
        const selectionContainer = container.querySelector('.selection');
        selectionContainer.append(selection);
    }

    destroy(): void
    {
        this._detachCloseHandler();
    }

    update(data?: any): void
    {
        throw new Error('The `update` method must be defined in child classes.');
    }

    isEnabled(): boolean
    {
        return !this.isDisabled();
    }

    isDisabled(): boolean
    {
        return this.options.get('disabled');
    }
}
