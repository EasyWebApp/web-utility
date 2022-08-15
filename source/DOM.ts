import { URLData } from './URL';
import { HTMLProps, HTMLField, CSSStyles, CSSObject } from './DOM-type';
import { Constructor, isEmpty, assertInheritance, toHyphenCase } from './data';
import { toJSValue } from './parser';

const templateMap: Record<string, Element> = {};

export function templateOf(tagName: string) {
    if (templateMap[tagName]) return templateMap[tagName];

    const spawn = document.createElement('template');

    spawn.innerHTML = `<${tagName} />`;

    return (templateMap[tagName] = spawn.content.firstElementChild!);
}

export function elementTypeOf(tagName: string) {
    const node = templateOf(tagName);

    return node instanceof HTMLElement && !(node instanceof HTMLUnknownElement)
        ? 'html'
        : 'xml';
}

export function isHTMLElementClass<T extends Constructor<HTMLElement>>(
    Class: any
): Class is T {
    return assertInheritance(Class, HTMLElement);
}

const nameMap = new WeakMap<Constructor<HTMLElement>, string>();

export function tagNameOf(Class: CustomElementConstructor) {
    const name = nameMap.get(Class);

    if (name) return name;

    var { tagName } = new Class();

    nameMap.set(Class, (tagName = tagName.toLowerCase()));

    return tagName;
}

export function isDOMReadOnly<T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    propertyName: keyof HTMLProps<HTMLElementTagNameMap[T]>
) {
    /**
     * fetch from https://html.spec.whatwg.org/
     */
    const ReadOnly_Properties: [Constructor<HTMLElement>, string[]][] = [
        [HTMLLinkElement, ['sizes']],
        [HTMLIFrameElement, ['sandbox']],
        [HTMLObjectElement, ['form']],
        [HTMLInputElement, ['form', 'list']],
        [HTMLButtonElement, ['form']],
        [HTMLSelectElement, ['form']],
        [HTMLTextAreaElement, ['form']],
        [HTMLOutputElement, ['form']],
        [HTMLFieldSetElement, ['form']]
    ];
    const template = templateOf(tagName);

    for (const [Class, keys] of ReadOnly_Properties)
        if (template instanceof Class && keys.includes(propertyName as string))
            return true;
    return false;
}

export function parseDOM(HTML: string) {
    const spawn = document.createElement('template');

    spawn.innerHTML = HTML;

    return [...spawn.content.childNodes].map(node => {
        node.remove();
        return node;
    });
}

export function stringifyDOM(node: Node) {
    return new XMLSerializer()
        .serializeToString(node)
        .replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '');
}

export function* walkDOM<T extends Node = Node>(
    root: Node,
    type?: Node['nodeType']
): Generator<T> {
    const children = [...root.childNodes];

    if (isEmpty(type) || type === root.nodeType) yield root as T;

    for (const node of children) yield* walkDOM(node, type);
}

export function getVisibleText(root: Element) {
    var text = '';

    for (const { nodeType, parentElement, nodeValue } of walkDOM(root))
        if (
            nodeType === Node.TEXT_NODE &&
            parentElement.getAttribute('aria-hidden') !== 'true'
        ) {
            const { width, height } = parentElement.getBoundingClientRect();

            if (width && height) text += nodeValue.trim().replace(/\s+/g, ' ');
        }

    return text;
}

/**
 * Split a DOM tree into Pages like PDF files
 *
 * @param pageHeight the default value is A4 paper's height
 * @param pageWidth the default value is A4 paper's width
 */
export function splitPages(
    { offsetWidth, children }: HTMLElement,
    pageHeight = 841.89,
    pageWidth = 595.28
) {
    const scrollHeight = (pageHeight / pageWidth) * offsetWidth;
    var offset = 0;

    return [...children].reduce((pages, node) => {
        var { offsetTop: top, offsetHeight: height } = node as HTMLElement;
        top += offset;
        var bottom = top + height;

        const bottomOffset = bottom / scrollHeight;
        const topIndex = ~~(top / scrollHeight),
            bottomIndex = ~~bottomOffset;

        if (topIndex !== bottomIndex) offset += height - bottomOffset;

        (pages[bottomIndex] ||= []).push(node);

        return pages;
    }, [] as Element[][]);
}

export interface CSSOptions
    extends Pick<
        HTMLLinkElement,
        'title' | 'media' | 'crossOrigin' | 'integrity'
    > {
    alternate?: boolean;
}

export function importCSS(
    URI: string,
    { alternate, ...options }: CSSOptions = {} as CSSOptions
) {
    const style = [...document.styleSheets].find(({ href }) => href === URI);

    if (style) return Promise.resolve(style);

    const link = document.createElement('link');

    return new Promise<CSSStyleSheet>((resolve, reject) => {
        link.onload = () => resolve(link.sheet);
        link.onerror = (_1, _2, _3, _4, error) => reject(error);

        Object.assign(link, options);

        link.rel = (alternate ? 'alternate ' : '') + 'stylesheet';
        link.href = URI;

        document.head.append(link);
    });
}

export function stringifyCSS(
    data: CSSStyles | CSSObject,
    depth = 0,
    indent = '    '
): string {
    const padding = indent.repeat(depth);

    return Object.entries(data)
        .map(([key, value]) =>
            typeof value !== 'object'
                ? `${padding}${toHyphenCase(key)}: ${value};`
                : `${padding}${key} {
${stringifyCSS(value as CSSObject, depth + 1, indent)}
${padding}}`
        )
        .join('\n');
}

export function insertToCursor(...nodes: Node[]) {
    const fragment = document.createDocumentFragment();

    fragment.append(...nodes);

    for (const node of walkDOM(fragment))
        if (
            ![1, 3, 11].includes(node.nodeType) ||
            ['meta', 'title', 'link', 'script'].includes(
                node.nodeName.toLowerCase()
            )
        )
            (node as ChildNode).replaceWith(...node.childNodes);

    const selection = globalThis.getSelection();

    if (!selection) return;

    const range = selection.getRangeAt(0);

    range.deleteContents();
    range.insertNode(fragment);
}

export function scrollTo(
    selector: string,
    root?: Element,
    align?: ScrollLogicalPosition,
    justify?: ScrollLogicalPosition
) {
    const [_, ID] = /^#(.+)/.exec(selector) || [];

    if (ID === 'top') window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    else
        (root || document)
            .querySelector(ID ? `[id="${ID}"]` : selector)
            ?.scrollIntoView({
                behavior: 'smooth',
                block: align,
                inline: justify
            });
}

export interface ScrollEvent {
    target: HTMLHeadingElement;
    links: (HTMLAnchorElement | HTMLAreaElement)[];
}

export function watchScroll(
    box: HTMLElement,
    handler: (event: ScrollEvent) => any,
    depth = 6
) {
    return Array.from(
        box.querySelectorAll<HTMLHeadingElement>(
            Array.from(new Array(depth), (_, index) => `h${++index}`) + ''
        ),
        header => {
            new IntersectionObserver(([item]) => {
                if (!item.isIntersecting) return;

                const target = item.target as HTMLHeadingElement;

                handler({
                    target,
                    links: [
                        ...target.ownerDocument.querySelectorAll<
                            HTMLAnchorElement | HTMLAreaElement
                        >(`[href="#${target.id}"]`)
                    ]
                });
            }).observe(header);

            if (!header.id.trim())
                header.id = header.textContent.trim().replace(/\W+/g, '-');

            return {
                level: +header.tagName[1],
                id: header.id,
                text: header.textContent.trim()
            };
        }
    );
}

export function watchVisible(
    root: Element,
    handler: (visible: boolean) => any
) {
    var last = document.visibilityState === 'visible' ? 1 : 0;

    function change(state: number) {
        if (state === 3 || last === 3) handler(state === 3);

        last = state;
    }

    new IntersectionObserver(([{ isIntersecting }]) =>
        change(isIntersecting ? last | 2 : last & 1)
    ).observe(root);

    document.addEventListener('visibilitychange', () =>
        change(document.visibilityState === 'visible' ? last | 1 : last & 2)
    );
}

export function formToJSON<T = URLData<File>>(
    form: HTMLFormElement | HTMLFieldSetElement
) {
    const data = {} as T;

    for (const field of form.elements) {
        let {
            type,
            name,
            value,
            checked,
            defaultValue,
            selectedOptions,
            files
        } = field as HTMLField;

        if (!name || value === '') continue;

        const box = type !== 'fieldset' && field.closest('fieldset');

        if (box && box !== form) continue;

        let parsedValue: any = value;

        switch (type) {
            case 'radio':
            case 'checkbox':
                if (checked)
                    parsedValue = defaultValue ? toJSValue(defaultValue) : true;
                else continue;
                break;
            case 'select-multiple':
                parsedValue = Array.from(selectedOptions, ({ value }) =>
                    toJSValue(value)
                );
                break;
            case 'fieldset':
                parsedValue = formToJSON(field as HTMLFieldSetElement);
                break;
            case 'file':
                parsedValue = files && Array.from(files);
                break;
            case 'date':
            case 'datetime-local':
            case 'month':
            case 'hidden':
            case 'number':
            case 'range':
            case 'select-one':
                parsedValue = toJSValue(value);
        }

        if (name in data) data[name] = [].concat(data[name], parsedValue);
        else
            data[name] =
                !(parsedValue instanceof Array) || !isEmpty(parsedValue[1])
                    ? parsedValue
                    : parsedValue[0];
    }

    return data;
}
