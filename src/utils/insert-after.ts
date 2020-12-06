export function insertAfter(node, preceding)
{
    const next   = preceding.nextSibling;
    const parent = preceding.parentNode;
    if (next)
    {
        parent.insertBefore(node, next);
    }
    else
    {
        parent.appendChild(node);
    }
    return node;
}