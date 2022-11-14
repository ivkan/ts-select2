import { ArrayAdapter } from './array';
import { extend } from '../utils';
import request from '../utils/request';
import { isNil } from '../utils/is-nil';

export class AjaxAdapter extends ArrayAdapter
{
    ajaxOptions: any;
    processResults: (results: any, params?: any) => any;

    private _request: any;
    private _queryTimeout: any;

    constructor(element, options)
    {
        super(element, options);
        this.ajaxOptions = this._applyDefaults(options.get('ajax'));

        if (!isNil(this.ajaxOptions.processResults))
        {
            this.processResults = this.ajaxOptions.processResults;
        }
        else
        {
            this.processResults = results => results;
        }
    }

    select(data): void
    {
        data.selected = true;
        super.select(data);
    }

    query(params, callback): void
    {
        var self    = this;

        if (this._request != null)
        {
            // JSONP requests cannot always be aborted
            if (typeof this._request.abort === 'function')
            {
                this._request.abort();
            }

            this._request = null;
        }

        const options = extend({
            type: 'GET'
        }, this.ajaxOptions) as any;

        if (typeof options.url === 'function')
        {
            options.url = options.url.call(this.core.element, params);
        }

        if (typeof options.data === 'function')
        {
            options.data = options.data.call(this.core.element, params);
        }

        function request()
        {
            const $request = options.transport(options, function (data)
            {
                const results = self.processResults(data.data, params);

                if (self.options.get('debug') && window.console && console.error)
                {
                    // Check to make sure that the response included a `results` key.
                    if (!results || !results.results || !Array.isArray(results.results))
                    {
                        console.error(
                            'Select2: The AJAX results did not return an array in the ' +
                            '`results` key of the response.'
                        );
                    }
                }

                callback(results);
            }, function ()
            {
                // Attempt to detect if a request was aborted
                // Only works if the transport exposes a status property
                if ($request && 'status' in $request &&
                    ($request.status === 0 || $request.status === '0'))
                {
                    return;
                }

                self.trigger('results:message', {
                    message: 'errorLoading'
                });
            });

            self._request = $request;
        }

        if (this.ajaxOptions.delay && params.term != null)
        {
            if (this._queryTimeout)
            {
                window.clearTimeout(this._queryTimeout);
            }

            this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
        }
        else
        {
            request();
        }
    }

    private _applyDefaults(options): any
    {
        const defaults = {
            data     : function (params)
            {
                return extend({}, params, {
                    q: params.term
                });
            },
            transport: function (params, success, failure)
            {
                const $request = request(params);

                $request.then(success);
                $request.catch(failure);

                return $request;
            }
        };

        return extend({}, defaults, options, true);
    }
}
