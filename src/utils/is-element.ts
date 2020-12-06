export function isElement(node: any): node is HTMLElement
{
    return node && node.nodeType === 1;
}
