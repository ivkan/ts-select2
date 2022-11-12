export function each(obj, callback)
{
    // Check it's iterable
    if (typeof obj !== 'object') return;
    // Don't bother continuing without a callback
    if (!callback) return;
    if (Array.isArray(obj))
    {
        // Array
        for (let i = 0; i < obj.length; i += 1)
        {
            if (callback(i, obj[i]) === false)
            {
                return;
            }
        }
    }
    else
    {
        // Object
        for (let prop in obj)
        {
            if (obj.hasOwnProperty(prop))
            {
                if (callback(prop, obj[prop]) === false)
                {
                    return;
                }
            }
        }
    }
}
