import { Translation } from '../translation';

export interface OptGroupData
{
    children: OptionData[];
    disabled: boolean;
    element: HTMLOptGroupElement;
    selected: boolean;
    text: string;
    title: string;

    loading?: undefined;
}

export interface OptionData
{
    disabled: boolean;
    element: HTMLOptionElement;
    id: string;
    selected: boolean;
    text: string;
    title: string;

    loading?: undefined;
    children?: undefined;
}

export interface IdTextPair
{
    id: string;
    text: string;

    loading?: undefined;
    element?: undefined;
}

export interface DataFormat
{
    id: number|string;
    text: string;
    selected?: boolean;
    disabled?: boolean;
}

export interface GroupedDataFormat
{
    text: string;
    children?: DataFormat[];

    id?: undefined;
}

export interface ISelect2
{
    container: any;
    dropdown: any;
    id: string;
    options: {options: SelectOptions};
    results: any;
    selection: any;
}

export interface QueryOptions
{
    term?: string;
    page?: number;
}

export interface SearchOptions
{
    term: string;
}

export interface LoadingData
{
    loading: boolean;
    text: string;

    id?: undefined;
    element?: undefined;
}

export type Sub<O extends string, D extends string> =
    { [K in O]: (Record<D, never>&Record<string, K>)[K] }[O];

/**
 * Same as jQuery v3 `JQuery.PlainObject`.
 */
export interface PlainObject<T = any>
{
    [key: string]: T;
}

export interface ProcessedResult<Result = DataFormat|GroupedDataFormat>
{
    results: Result[];
    pagination?: {more: boolean};
}

export interface TranslationArg {
    input: string;
    minimum: number;
    maximum: number;
}

export interface ITranslation {
    errorLoading?: () => string;
    inputTooLong?: (arg: TranslationArg) => string;
    inputTooShort?: (arg: TranslationArg) => string;
    loadingMore?: () => string;
    maximumSelected?: (arg: TranslationArg) => string;
    noResults?: () => string;
    searching?: () => string;
    removeAllItems?: () => string;
    removeItem?: () => string;
}

export interface IAjaxOptions
{
    url        : string,
    method     : string,
    data       : boolean,
    async      : boolean,
    cache      : boolean,
    user       : string,
    password   : string,
    headers    : any,
    xhrFields  : any,
    statusCode : any,
    processData: boolean,
    dataType   : string,
    contentType: string,
    timeout    : number,
}

export interface SelectOptions<Result = DataFormat|GroupedDataFormat>
{
    allowClear?: boolean;
    amdLanguageBase?: string;
    closeOnSelect?: boolean;
    containerCss?: any;
    containerCssClass?: string;
    data?: DataFormat[]|GroupedDataFormat[];
    ajax?: IAjaxOptions;
    dataAdapter?: any;
    debug?: boolean;
    dir?: 'ltr'|'rtl';
    disabled?: boolean;
    dropdownAdapter?: any;
    dropdownAutoWidth?: boolean;
    dropdownCss?: any;
    dropdownCssClass?: string;
    dropdownParent?: any;
    escapeMarkup?: (markup: string) => string;
    initSelection?: (element: any, callback: (data: any) => void) => void;
    language?: ITranslation|string;
    translations?: Translation;
    matcher?: (params: SearchOptions, data: OptGroupData|OptionData) => OptGroupData|OptionData|null;
    maximumInputLength?: number;
    maximumSelectionLength?: number;
    minimumInputLength?: number;
    minimumResultsForSearch?: number;
    multiple?: boolean;
    selectionCssClass?: string;
    placeholder?: string|IdTextPair;
    resultsAdapter?: any;
    selectionAdapter?: any;
    selectOnClose?: boolean;
    sorter?: (data: Array<OptGroupData|OptionData|IdTextPair>) => Array<OptGroupData|OptionData|IdTextPair>;
    tags?: boolean;
    templateResult?: (result: LoadingData|Result) => string|HTMLElement|null;
    templateSelection?: (selection: IdTextPair|LoadingData|Result) => string|HTMLElement;
    theme?: string;
    tokenizer?: (input: string, selection: any[], selectCallback: () => void, options: SelectOptions) => string;
    tokenSeparators?: string[];
    width?: string;
    autocomplete?: string;
    createTag?: (params: SearchOptions) => IdTextPair|null;
    insertTag?: (data: Array<OptionData|IdTextPair>, tag: IdTextPair) => void;
    infiniteScroll?: boolean;
}
