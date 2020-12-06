const unescapedHTMLExp    = /[&<>"']/g;
const hasUnescapedHTMLExp = RegExp(unescapedHTMLExp.source);
const htmlEscapes         = {
    '&' : '&amp;',
    '<' : '&lt;',
    '>' : '&gt;',
    '"' : '&quot;',
    '\'': '&#39;'
};

export function escapeHTML(string: string): string
{
    return (string && hasUnescapedHTMLExp.test(string)) ?
        string.replace(unescapedHTMLExp, chr => htmlEscapes[chr]) :
        string;
}
