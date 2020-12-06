export function getElementOffset(element, round = true): ClientRect
{
    const elBcr          = element.getBoundingClientRect();
    const viewportOffset = {
        top : window.pageYOffset - document.documentElement.clientTop,
        left: window.pageXOffset - document.documentElement.clientLeft
    };

    const elOffset = {
        height: elBcr.height || element.offsetHeight,
        width : elBcr.width || element.offsetWidth,
        top   : elBcr.top + viewportOffset.top,
        bottom: elBcr.bottom + viewportOffset.top,
        left  : elBcr.left + viewportOffset.left,
        right : elBcr.right + viewportOffset.left
    };

    if (round)
    {
        elOffset.height = Math.round(elOffset.height);
        elOffset.width  = Math.round(elOffset.width);
        elOffset.top    = Math.round(elOffset.top);
        elOffset.bottom = Math.round(elOffset.bottom);
        elOffset.left   = Math.round(elOffset.left);
        elOffset.right  = Math.round(elOffset.right);
    }

    return elOffset;
}
