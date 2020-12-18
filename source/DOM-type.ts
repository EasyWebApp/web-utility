export interface KeyboardEventHandlers {
    onKeyDown?: (event: KeyboardEvent) => any;
    onKeyPress?: (event: KeyboardEvent) => any;
    onKeyUp?: (event: KeyboardEvent) => any;
}

export interface MouseEventHandlers {
    onClick?: (event: MouseEvent) => any;
    onDblClick?: (event: MouseEvent) => any;
    onMouseDown?: (event: MouseEvent) => any;
    onMouseMove?: (event: MouseEvent) => any;
    onMouseUp?: (event: MouseEvent) => any;
    onMouseEnter?: (event: MouseEvent) => any;
    onMouseLeave?: (event: MouseEvent) => any;
    onMouseOver?: (event: MouseEvent) => any;
    onMouseOut?: (event: MouseEvent) => any;
    onWheel?: (event: WheelEvent) => any;
}

export interface TouchEventHandlers {
    onTouchStart?: (event: TouchEvent) => any;
    onTouchEnter?: (event: TouchEvent) => any;
    onTouchMove?: (event: TouchEvent) => any;
    onTouchLeave?: (event: TouchEvent) => any;
    onTouchEnd?: (event: TouchEvent) => any;
    onTouchCancel?: (event: TouchEvent) => any;
}

export interface UIEventHandlers {
    onScroll?: (event: UIEvent) => any;
    onResize?: (Event: UIEvent) => any;
}

export interface FormEventHandlers {
    onFocus?: (event: FocusEvent) => any;
    onFocusIn?: (event: FocusEvent) => any;
    onBlur?: (event: FocusEvent) => any;
    onFocusOut?: (event: FocusEvent) => any;
    onInput?: (event: InputEvent) => any;
    onChange?: (event: Event) => any;
}

export interface HTMLProps
    extends KeyboardEventHandlers,
        MouseEventHandlers,
        TouchEventHandlers,
        UIEventHandlers,
        Partial<
            Pick<
                HTMLElement,
                'id' | 'className' | 'title' | 'tabIndex' | 'innerHTML'
            >
        > {
    style?: Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule'>>;
    [key: string]: any;
}

export interface HTMLHyperLinkProps extends HTMLProps {
    href?: string | URL;
    target?: '_self' | '_parent' | '_top' | '_blank';
}

export type TableCellProps = Partial<
    Pick<HTMLTableCellElement, 'colSpan' | 'rowSpan'>
>;

type HTMLFieldProps = Partial<
    Pick<
        HTMLInputElement,
        | 'name'
        | 'defaultValue'
        | 'value'
        | 'required'
        | 'disabled'
        | 'placeholder'
        | 'autofocus'
    >
>;
export type BaseFieldProps = HTMLProps & HTMLFieldProps & FormEventHandlers;

export type HTMLField = HTMLInputElement &
    HTMLTextAreaElement &
    HTMLSelectElement &
    HTMLFieldSetElement;

/**
 * @see https://developers.google.com/web/fundamentals/web-components/customelements#reactions
 */
export interface CustomElement extends HTMLElement {
    /**
     * Called every time the element is inserted into the DOM
     */
    connectedCallback?(): void;
    /**
     * Called every time the element is removed from the DOM.
     */
    disconnectedCallback?(): void;
    /**
     * Called when an observed attribute has been added, removed, updated, or replaced.
     * Also called for initial values when an element is created by the parser, or upgraded.
     *
     * Note: only attributes listed in static `observedAttributes` property will receive this callback.
     */
    attributeChangedCallback?(
        name: string,
        oldValue: string,
        newValue: string
    ): void;
    /**
     * The custom element has been moved into a new document
     * (e.g. someone called `document.adoptNode(el)`).
     */
    adoptedCallback?(): void;
}

/**
 * @see https://web.dev/more-capable-form-controls/#lifecycle-callbacks
 */
export interface CustomFormElement
    extends CustomElement,
        Omit<HTMLFieldProps, 'autofocus'>,
        Pick<
            HTMLInputElement,
            | 'form'
            | 'validity'
            | 'validationMessage'
            | 'willValidate'
            | 'checkValidity'
            | 'reportValidity'
        > {
    /**
     * Called when the browser associates the element with a form element,
     * or disassociates the element from a form element.
     */
    formAssociatedCallback?(form: HTMLFormElement): void;
    /**
     * Called after the disabled state of the element changes,
     * either because the disabled attribute of this element was added or removed;
     * or because the disabled state changed on a `<fieldset>` that's an ancestor of this element.
     *
     * @param disabled This parameter represents the new disabled state of the element.
     */
    formDisabledCallback?(disabled: boolean): void;
    /**
     * Called after the form is reset.
     * The element should reset itself to some kind of default state.
     */
    formResetCallback?(): void;
    /**
     * Called in one of two circumstances:
     *   - When the browser restores the state of the element (for example, after a navigation, or when the browser restarts). The `mode` argument is `"restore"` in this case.
     *   - When the browser's input-assist features such as form autofilling sets a value. The `mode` argument is `"autocomplete"` in this case.
     *
     * @param state The type of this argument depends on how the `this.internals.setFormValue()` method was called.
     * @param mode
     */
    formStateRestoreCallback?(
        state: string | File | FormData,
        mode: 'restore' | 'autocomplete'
    ): void;
}
