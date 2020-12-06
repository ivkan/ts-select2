export class Observable
{
    _listeners = {};

    on(event: string, callback: (...params: any[]) => any): void
    {
        this._listeners = this._listeners || {};

        if (event in this._listeners)
        {
            this._listeners[event].push(callback);
        }
        else
        {
            this._listeners[event] = [callback];
        }
    }

    trigger(event: any, options?: any): void
    {
        const slice    = Array.prototype.slice;
        let params     = slice.call(arguments, 1);
        this._listeners = this._listeners || {};

        // Params should always come in as an array
        if (params == null)
        {
            params = [];
        }

        // If there are no arguments to the event, use a temporary object
        if (params.length === 0)
        {
            params.push({});
        }

        // Set the `_type` of the first object to the event
        params[0]._type = event;

        if (event in this._listeners)
        {
            this.invoke(this._listeners[event], slice.call(arguments, 1));
        }

        if ('*' in this._listeners)
        {
            this.invoke(this._listeners['*'], arguments);
        }
    }

    invoke(_listeners, params): void
    {
        for (let i = 0, len = _listeners.length; i < len; i++)
        {
            _listeners[i].apply(this, params);
        }
    }
}
