export type Ele = Window|Document|HTMLElement|Element|Node;
export type EleLoose = HTMLElement&Element&Node;
export type Selector = string | HTMLCollection | NodeList | Ele | Ele[] | ArrayLike<Ele>;
export type Context = Document | HTMLElement | Element;

