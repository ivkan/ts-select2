export function isPlainObject(x: any): boolean
{
    if (typeof x !== 'object' || x === null) return false;
    const proto = Object.getPrototypeOf(x);
    return proto === null || proto === Object.prototype;
}
