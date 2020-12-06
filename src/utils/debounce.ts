export const debounce = (fn: Function, delay: number, immediate?: boolean) =>
{
    let timer: any = null;
    return (...params: any[]) =>
    {
        if (timer)
        {
            clearTimeout(timer);
        }
        if (immediate && !timer)
        {
            fn.call(null, ...params);
        }
        else
        {
            timer = setTimeout(() =>
            {
                timer = null;
                fn.call(null, ...params);
            }, delay);
        }
    };
};
