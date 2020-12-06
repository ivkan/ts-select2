import { ArrayAdapter } from './adapters/array';
import { MaximumInputLength } from './adapters/extensions/maximum-input-length';
import { MaximumSelectionLength } from './adapters/extensions/maximum-selection-length';
import { MinimumInputLength } from './adapters/extensions/minimum-input-length';
import { Tags } from './adapters/extensions/tags';
import { Tokenizer } from './adapters/extensions/tokenizer';
import { SelectAdapter } from './adapters/select';
import { DIACRITICS } from './diacritics';
import { Dropdown } from './dropdown/dropdown';
import { AttachBody } from './dropdown/extensions/attach-body';
import { CloseOnSelect } from './dropdown/extensions/close-on-select';
import { DropdownCss } from './dropdown/extensions/dropdown-css';
import { HidePlaceholder } from './dropdown/extensions/hide-placeholder';
import { InfiniteScroll } from './dropdown/extensions/infinite-scroll';
import { MinimumResultsForSearch } from './dropdown/extensions/minimum-results-for-search';
import { DropdownSearch } from './dropdown/extensions/search';
import { SelectOnClose } from './dropdown/extensions/select-on-close';
import { EnTranslations } from './i18n/en';
import { RuTranslations } from './i18n/ru';
import { Results } from './results';
import { AllowClear } from './selection/extensions/allow-clear';
import { EventRelay } from './selection/extensions/event-relay';
import { Placeholder } from './selection/extensions/placeholder';
import { SelectionSearch } from './selection/extensions/search';
import { SelectionCss } from './selection/extensions/selection-css';
import { MultipleSelection } from './selection/multiple';
import { SingleSelection } from './selection/single';
import { Translation } from './translation';
import { ITranslation, SelectOptions } from './types/types';
import { Utils } from './utils/utils';
import { extend } from './utils/extend';
import { isNil } from './utils/is-nil';
import { escapeHTML } from './utils/escape-html';
import { camelCase } from './utils/camel-case';

export class Defaults
{
    defaults: any;

    constructor()
    {
        this.reset();
    }

    apply(options: SelectOptions): any
    {
        options = extend(true, {}, this.defaults, options);

        if (isNil(options.dataAdapter))
        {
            if (!isNil(options.data))
            {
                options.dataAdapter = ArrayAdapter;
            }
            else
            {
                options.dataAdapter = SelectAdapter;
            }

            if (options.minimumInputLength > 0)
            {
                options.dataAdapter = MinimumInputLength(options.dataAdapter);
            }

            if (options.maximumInputLength > 0)
            {
                options.dataAdapter = MaximumInputLength(options.dataAdapter);
            }

            if (options.maximumSelectionLength > 0)
            {
                options.dataAdapter = MaximumSelectionLength(options.dataAdapter);
            }

            if (options.tags)
            {
                options.dataAdapter = Tags(options.dataAdapter);
            }

            if (options.tokenSeparators != null || options.tokenizer != null)
            {
                options.dataAdapter = Tokenizer(options.dataAdapter);
            }
        }

        if (isNil(options.resultsAdapter))
        {
            options.resultsAdapter = Results;

            if (!isNil(options.infiniteScroll))
            {
                options.resultsAdapter = InfiniteScroll(options.resultsAdapter);
            }

            if (!isNil(options.placeholder))
            {
                options.resultsAdapter = HidePlaceholder(options.resultsAdapter);
            }

            if (options.selectOnClose)
            {
                options.resultsAdapter = SelectOnClose(options.resultsAdapter);
            }
        }

        if (isNil(options.dropdownAdapter))
        {
            options.dropdownAdapter = Dropdown;

            if (!options.multiple)
            {
                options.dropdownAdapter = DropdownSearch(options.dropdownAdapter);
            }

            if (options.minimumResultsForSearch !== 0)
            {
                options.dropdownAdapter = MinimumResultsForSearch(options.dropdownAdapter);
            }

            if (options.closeOnSelect)
            {
                options.dropdownAdapter = CloseOnSelect(options.dropdownAdapter);
            }

            if (!isNil(options.dropdownCssClass))
            {
                options.dropdownAdapter = DropdownCss(options.dropdownAdapter);
            }

            options.dropdownAdapter = AttachBody(options.dropdownAdapter);
        }

        if (isNil(options.selectionAdapter))
        {
            if (options.multiple)
            {
                options.selectionAdapter = MultipleSelection;
            }
            else
            {
                options.selectionAdapter = SingleSelection;
            }

            // Add the placeholder mixin if a placeholder was specified
            if (!isNil(options.placeholder))
            {
                options.selectionAdapter = Placeholder(options.selectionAdapter);
            }

            if (options.allowClear)
            {
                options.selectionAdapter = AllowClear(options.selectionAdapter);
            }

            if (options.multiple)
            {
                options.selectionAdapter = SelectionSearch(options.selectionAdapter);
            }

            if (!isNil(options.selectionCssClass))
            {
                options.selectionAdapter = SelectionCss(options.selectionAdapter);
            }

            options.selectionAdapter = EventRelay(options.selectionAdapter);
        }

        // If the defaults were not previously applied from an element, it is
        // possible for the language option to have not been resolved
        options.language     = this._resolveLanguage(options.language, options.debug);
        options.translations = this._processTranslations(options.language);

        return options;
    }

    reset(): void
    {
        function stripDiacritics(text)
        {
            // Used 'uni range + named function' from http://jsperf.com/diacritics/18
            function match(a)
            {
                return DIACRITICS[a] || a;
            }

            return text.replace(/[^\u0000-\u007E]/g, match);
        }

        function matcher(params: any, data: any): any
        {
            // Always return the object if there is nothing to compare
            if (params.term == null || params.term.trim() === '')
            {
                return data;
            }

            // Do a recursive check for options with children
            if (data.children && data.children.length > 0)
            {
                // Clone the data object if there are children
                // This is required as we modify the object to remove any non-matches
                const match = extend<any>(true, {}, data);

                // Check each child of the option
                for (let c = data.children.length - 1; c >= 0; c--)
                {
                    const child = data.children[c];

                    const matches = matcher(params, child);

                    // If there wasn't a match, remove the object in the array
                    if (matches == null)
                    {
                        match.children.splice(c, 1);
                    }
                }

                // If any children matched, return the new object
                if (match.children.length > 0)
                {
                    return match;
                }

                // If there were no matching children, check just the plain object
                return matcher(params, match);
            }

            const original = stripDiacritics(data.text).toUpperCase();
            const term     = stripDiacritics(params.term).toUpperCase();

            // Check if the text contains the term
            if (original.indexOf(term) > -1)
            {
                return data;
            }

            // If it doesn't contain the term, don't return anything
            return null;
        }

        this.defaults = {
            amdLanguageBase        : './i18n/',
            autocomplete           : 'off',
            closeOnSelect          : true,
            debug                  : false,
            dropdownAutoWidth      : false,
            escapeMarkup           : escapeHTML,
            language               : {},
            matcher                : matcher,
            minimumInputLength     : 0,
            maximumInputLength     : 0,
            maximumSelectionLength : 0,
            minimumResultsForSearch: 0,
            selectOnClose          : false,
            scrollAfterSelect      : false,
            sorter                 : data => data,
            templateResult         : result => result.text,
            templateSelection      : selection => selection.text,
            theme                  : 'default',
            width                  : 'resolve'
        };
    }

    applyFromElement(options: SelectOptions, element: HTMLElement): SelectOptions
    {
        const optionLanguage  = options.language;
        const defaultLanguage = this.defaults.language;
        const elementLanguage = element.lang;
        const parentLanguage  = (element.closest('[lang]') as HTMLElement).lang;
        options.language      = parentLanguage || elementLanguage || defaultLanguage || optionLanguage;

        return options;
    }

    _resolveLanguage(language?: string|ITranslation, debug?: boolean): ITranslation
    {
        if (!language)
        {
            return EnTranslations;
        }

        switch (language)
        {
            case 'ru':
                return RuTranslations;

            case 'en':
                return EnTranslations;

            default:
                if (debug && window.console && console.warn)
                {
                    console.warn(
                        'TsSelect2: The language file for "' + language + '" could ' +
                        'not be automatically loaded. A fallback will be used instead.'
                    );
                }
                return EnTranslations;
        }
    }

    _processTranslations(language: ITranslation): Translation
    {
        const translations = new Translation();
        const languageData = new Translation(language);

        translations.extend(languageData);

        return translations;
    }

    set(key: string, value: any): void
    {
        const camelKey = camelCase(key);

        const data     = {};
        data[camelKey] = value;

        const convertedData = Utils._convertData(data);

        extend(true, this.defaults, convertedData);
    }
}
