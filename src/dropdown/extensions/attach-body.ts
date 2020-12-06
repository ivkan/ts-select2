import { TsSelect2 } from '../../core';
import { IDropdown } from '../../types/dropdown';
import { Utils } from '../../utils/utils';
import { IListener } from '../../utils/event-listener/types';
import { createListener, destroyListener } from '../../utils/event-listener/listener';
import { setStyles } from '../../utils/set-styles';
import { elementFromString } from '../../utils/element-from-string';
import { getElementOuterHeight, getElementOuterWidth } from '../../utils/get-element-size';
import { getElementOffset } from '../../utils/get-element-offset';
import { isNil } from '../../utils/is-nil';

export const AttachBody = (target: IDropdown) =>
{
    return class AttachBody extends target
    {
        dropdownParent: HTMLElement;
        dropdownContainer: HTMLElement;
        container: HTMLElement;
        containerResultsHandlersBound: boolean;
        positioningListeners: IListener[] = [];

        constructor(...constructorArgs: any[])
        {
            super(...constructorArgs);

            this.dropdownParent = this.options.get('dropdownParent') || document.body;
        }

        binding(select: TsSelect2, container: HTMLSpanElement): void
        {
            super.binding(select, container);

            select.on('open', () =>
            {
                this._showDropdown();
                this._attachPositioningHandler(select);

                // Must bind after the results handlers to ensure correct sizing
                this._bindContainerResultHandlers(select);
            });

            select.on('close', () =>
            {
                this._hideDropdown();
                this._detachPositioningHandler(select);
            });

            createListener({
                elements : this.dropdownContainer,
                events   : 'mousedown',
                listeners: this.core.listeners,
                callback : event =>
                {
                    event.stopPropagation();
                }
            });
        }

        destroy(): void
        {
            destroyListener(this.positioningListeners);
            super.destroy();
            this.dropdownContainer.remove();
        }

        position(dropdown: HTMLSpanElement, container: HTMLElement): void
        {
            // Clone all of the container classes
            dropdown.classList.value = container.classList.value;

            dropdown.classList.remove('select2');
            dropdown.classList.add('select2-container--open');

            setStyles(dropdown, {
                position: 'absolute',
                top     : -999999
            });

            this.container = container;
        }

        render(): HTMLSpanElement
        {
            this.dropdownContainer = elementFromString<HTMLSpanElement>('<span></span>');
            const dropdown         = super.render();

            this.dropdownContainer.append(dropdown);
            return this.dropdownContainer;
        }

        _hideDropdown()
        {
            Utils.detach(this.dropdownContainer);
        }

        _bindContainerResultHandlers(select: TsSelect2): void
        {

            // These should only be bound once
            if (this.containerResultsHandlersBound)
            {
                return;
            }

            select.on('results:all', () =>
            {
                this._positionDropdown();
                this._resizeDropdown();
            });

            select.on('results:append', () =>
            {
                this._positionDropdown();
                this._resizeDropdown();
            });

            select.on('results:message', () =>
            {
                this._positionDropdown();
                this._resizeDropdown();
            });

            select.on('select', () =>
            {
                this._positionDropdown();
                this._resizeDropdown();
            });

            select.on('unselect', () =>
            {
                this._positionDropdown();
                this._resizeDropdown();
            });

            this.containerResultsHandlersBound = true;
        }

        _attachPositioningHandler(select: TsSelect2): void
        {
            const scrollEvent      = 'scroll'; // 'scroll.select2.' + select.id;
            const resizeEvent      = 'resize'; // 'resize.select2.' + select.id;
            const orientationEvent = 'orientationchange.select2.' + select.id;

            const watchers = Utils.geElementParents(this.container).filter(Utils.hasScroll);

            watchers.forEach((el: HTMLElement) =>
            {
                Utils.StoreData(el, 'select2-scroll-position', {
                    x: el.scrollLeft,
                    y: el.scrollTop
                });

                createListener({
                    elements : el,
                    events   : scrollEvent,
                    listeners: this.positioningListeners,
                    callback : () =>
                    {
                        const position = Utils.GetData(el, 'select2-scroll-position');
                        el.scrollTop   = position.y;
                    }
                });
            });

            createListener({
                elements : window,
                events   : [scrollEvent, resizeEvent, orientationEvent].join(' '),
                listeners: this.positioningListeners,
                callback : () =>
                {
                    this._positionDropdown();
                    this._resizeDropdown();
                }
            });
        }

        _detachPositioningHandler(select: TsSelect2): void
        {
            destroyListener(this.positioningListeners);
        }

        _positionDropdown(): void
        {
            const isCurrentlyAbove = this.dropdown.classList.contains('select2-dropdown--above');
            const isCurrentlyBelow = this.dropdown.classList.contains('select2-dropdown--below');

            let newDirection = null;

            const offset  = getElementOffset(this.container);
            offset.bottom = offset.top + getElementOuterHeight(this.container);

            const container: any = {
                height: getElementOuterHeight(this.container)
            };

            container.top    = offset.top;
            container.bottom = offset.top + container.height;

            const dropdown = {
                height: getElementOuterHeight(this.dropdown)
            };

            const viewport = {
                top   : window.scrollY,
                bottom: window.scrollY + window.innerHeight
            };

            const enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
            const enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

            const css = {
                left: offset.left,
                top : container.bottom
            };

            // Determine what the parent element is to use for calculating the offset
            let offsetParent = this.dropdownParent;

            // For statically positioned elements, we need to get the element
            // that is determining the offset
            if (offsetParent.style.position === 'static')
            {
                offsetParent = offsetParent.offsetParent as HTMLElement;
            }

            let parentOffset = {
                top : 0,
                left: 0
            };

            if (document.body.contains(offsetParent) || offsetParent.isConnected)
            {
                parentOffset = getElementOffset(offsetParent);
            }

            css.top -= parentOffset.top;
            css.left -= parentOffset.left;

            if (!isCurrentlyAbove && !isCurrentlyBelow)
            {
                newDirection = 'below';
            }

            if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove)
            {
                newDirection = 'above';
            }
            else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove)
            {
                newDirection = 'below';
            }

            if (newDirection === 'above' ||
                (isCurrentlyAbove && newDirection !== 'below'))
            {
                css.top = container.top - parentOffset.top - dropdown.height;
            }

            if (!isNil(newDirection))
            {
                this.dropdown.classList.remove('select2-dropdown--below');
                this.dropdown.classList.remove('select2-dropdown--above');
                this.dropdown.classList.add('select2-dropdown--' + newDirection);

                this.container.classList.remove('select2-container--below');
                this.container.classList.remove('select2-container--above');
                this.container.classList.add('select2-container--' + newDirection);
            }

            setStyles(this.dropdownContainer, css);
        }

        _resizeDropdown(): void
        {
            const css: any = {
                width: getElementOuterWidth(this.container) + 'px'
            };

            if (this.options.get('dropdownAutoWidth'))
            {
                css.minWidth = css.width;
                css.position = 'relative';
                css.width    = 'auto';
            }

            setStyles(this.dropdown, css);
        }

        _showDropdown(): void
        {
            this.dropdownParent.append(this.dropdownContainer);

            this._positionDropdown();
            this._resizeDropdown();
        }
    };
};

