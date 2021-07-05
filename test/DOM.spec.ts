import './polyfill';
import {
    walkDOM,
    getVisibleText,
    watchScroll,
    formToJSON
} from '../source/DOM';

describe('DOM', () => {
    it('should walk through a DOM tree with(out) a Type filter', () => {
        document.body.innerHTML = '<a><b>test</b></a>';

        expect(
            Array.from(walkDOM(document.body), ({ nodeName }) => nodeName)
        ).toStrictEqual(['BODY', 'A', 'B', '#text']);

        expect(
            Array.from(
                walkDOM<Text>(document.body, Node.TEXT_NODE),
                ({ nodeValue }) => nodeValue
            ) + ''
        ).toBe('test');
    });

    it('should get all the text of Visible elements', () => {
        document.body.innerHTML = `
            <a>
                <i class="icon" aria-hidden="true"></i>
                test  example
                <span style="display: none">current</span>
            </a>`;

        const { firstElementChild: link } = document.body;

        link.getBoundingClientRect = () =>
            ({ width: 48, height: 16 } as DOMRect);

        expect(getVisibleText(link)).toBe('test example');
    });

    it('should find all depth-matched Heading Elements in a container', () => {
        document.body.innerHTML = `
            <h1 id="h1">Level 1</h1>
            <section>
                <h2 id="h2.1">Level 2</h2>
                <p>test</p>
                <h3 id="h3.1">Level 3</h3>
                <p>example</p>
            </section>
            <section>
                <h2 id="h2.2">Level 2</h2>
                <p>test</p>
                <h3 id="h3.2">Level 3</h3>
                <p>example</p>
            </section>
        `;

        expect(watchScroll(document.body, () => {})).toEqual([
            { level: 1, id: 'h1', text: 'Level 1' },
            { level: 2, id: 'h2.1', text: 'Level 2' },
            { level: 3, id: 'h3.1', text: 'Level 3' },
            { level: 2, id: 'h2.2', text: 'Level 2' },
            { level: 3, id: 'h3.2', text: 'Level 3' }
        ]);

        expect(watchScroll(document.body, () => {}, 2)).toEqual([
            { level: 1, id: 'h1', text: 'Level 1' },
            { level: 2, id: 'h2.1', text: 'Level 2' },
            { level: 2, id: 'h2.2', text: 'Level 2' }
        ]);
    });

    it('should convert a Form to JSON', () => {
        document.body.innerHTML = `
        <form>
            <input type="checkbox" name="switch" checked>

            <input type="checkbox" name="list" value="1" checked>
            <input type="checkbox" name="list" value="2">
            <input type="checkbox" name="list" value="3" checked>

            <select name="array" multiple>
                <option>1</option>
                <option selected>2</option>
                <option selected>3</option>
            </select>

            <fieldset name="test">
                <input type="text" name="example" value="sample" />

                <select name="other" size="3">
                    <option>1</option>
                    <option selected>2</option>
                    <option>3</option>
                </select>
            </fieldset>

            <input type="file" name="files" />
        </form>`;

        const data = formToJSON(document.forms[0]);

        expect(data).toEqual(
            expect.objectContaining({
                switch: true,
                list: [1, 3],
                array: [2, 3],
                test: { example: 'sample', other: 2 },
                files: undefined
            })
        );
    });
});
