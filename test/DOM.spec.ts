import { formToJSON } from '../source/DOM';

describe('DOM', () => {
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
            </fieldset>
        </form>`;

        const data = formToJSON(document.forms[0]);

        expect(data).toEqual(
            expect.objectContaining({
                switch: true,
                list: [1, 3],
                array: [2, 3],
                test: { example: 'sample' }
            })
        );
    });
});
