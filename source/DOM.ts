import { HTMLField } from './DOM-type';
import { parseJSON } from './data';

const sandbox = document.createElement('template'),
    fragment = document.createDocumentFragment();

export function parseDOM(HTML: string) {
    sandbox.innerHTML = HTML;

    return [...sandbox.content.childNodes].map(node => {
        node.remove();
        return node;
    });
}

export function* walkDOM(root: Node): Generator<Node> {
    const children = [...root.childNodes];

    yield root;

    for (const node of children) yield* walkDOM(node);
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

    const selection = self.getSelection();

    if (!selection) return;

    const range = selection.getRangeAt(0);

    range.deleteContents();
    range.insertNode(fragment);
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

export interface FormJSON {
    [key: string]: string | number | (string | boolean)[];
}

export function formToJSON(
    form: HTMLFormElement | HTMLFieldSetElement
): FormJSON {
    const data = {};

    for (const field of form.elements) {
        let {
            tagName,
            type,
            name,
            value: v,
            checked,
            defaultValue,
            selectedOptions
        } = field as HTMLField;

        if (!name) continue;

        tagName = tagName.toLowerCase();

        const box = tagName !== 'fieldset' && field.closest('fieldset');

        if (box && box !== form) continue;

        if (['radio', 'checkbox'].includes(type))
            if (checked) v = defaultValue || 'true';
            else continue;

        let value: any = parseJSON(v);

        switch (tagName) {
            case 'select':
                value = Array.from(selectedOptions, ({ value }) =>
                    parseJSON(value)
                );
                break;
            case 'fieldset':
                value = formToJSON(field as HTMLFieldSetElement);
        }

        if (name in data) data[name] = [].concat(data[name], value);
        else data[name] = value;
    }

    return data;
}
