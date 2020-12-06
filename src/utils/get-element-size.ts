function getSize(el, prop: string): number
{
    return parseFloat(getComputedStyle(el, null)[prop].replace('px', ''))
}

function outerSize(el, prop: string, includeMargin = false): number
{
    const isHeight = prop === 'height';
    let value      = isHeight ? el.offsetHeight : el.offsetWidth;

    if (!includeMargin)
    {
        return value;
    }

    const style = getComputedStyle(el);

    if (isHeight)
    {
        value += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
    }
    else
    {
        value += parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
    }

    return value;
}

export const getElementHeight      = (el): number => getSize(el, 'height');
export const getElementWidth       = (el): number => getSize(el, 'width');
export const getElementOuterHeight = (el, includeMargin = false): number => outerSize(el, 'height', includeMargin);
export const getElementOuterWidth  = (el, includeMargin = false): number => outerSize(el, 'width', includeMargin);