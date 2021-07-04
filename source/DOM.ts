import { URLData } from './URL';
import { HTMLField } from './DOM-type';
import { isEmpty, parseJSON } from './data';

const sandbox = document.createElement('template'),
    fragment = document.createDocumentFragment();

export function parseDOM(HTML: string) {
    sandbox.innerHTML = HTML;

    return [...sandbox.content.childNodes].map(node => {
        node.remove();
        return node;
    });
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

            if (width && height) text += nodeValue.trim();
        }

    return text;
}

interface CSSOptions
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

export function insertToCursor(...nodes: Node[]) {
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

export function scrollTo(selector: string, root?: Element) {
    const [_, ID] = /^#(.+)/.exec(selector) || [];

    if (ID === 'top') window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    else
        (root || document)
            .querySelector(ID ? `[id="${ID}"]` : selector)
            ?.scrollIntoView({ behavior: 'smooth' });
}

interface ScrollEvent {
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
            value: v,
            checked,
            defaultValue,
            selectedOptions,
            files
        } = field as HTMLField;

        if (!name) continue;

        const box = type !== 'fieldset' && field.closest('fieldset');

        if (box && box !== form) continue;

        if (['radio', 'checkbox'].includes(type))
            if (checked) v = defaultValue || 'true';
            else continue;

        let value: any = parseJSON(v);

        switch (type) {
            case 'select-multiple':
                value = Array.from(selectedOptions, ({ value }) =>
                    parseJSON(value)
                );
                break;
            case 'fieldset':
                value = formToJSON(field as HTMLFieldSetElement);
                break;
            case 'file':
                value = files && [...files];
                break;
            case 'datetime-local':
                value = new Date(value).toISOString();
        }

        if (name in data) data[name] = [].concat(data[name], value);
        else
            data[name] =
                !(value instanceof Array) || !isEmpty(value[1])
                    ? value
                    : value[0];
    }

    return data;
}
