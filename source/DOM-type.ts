import type { DataKeys } from './data';

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
    onMouseOver?: (event: MouseEvent) => any;
    onMouseOut?: (event: MouseEvent) => any;
    onWheel?: (event: WheelEvent) => any;
}

/**
 * Mouse Events with no bubble
 */
export interface HoverEventHandlers {
    onMouseEnter?: (event: MouseEvent) => any;
    onMouseLeave?: (event: MouseEvent) => any;
}

export interface TouchEventHandlers {
    onTouchStart?: (event: TouchEvent) => any;
    onTouchEnter?: (event: TouchEvent) => any;
    onTouchMove?: (event: TouchEvent) => any;
    onTouchLeave?: (event: TouchEvent) => any;
    onTouchEnd?: (event: TouchEvent) => any;
    onTouchCancel?: (event: TouchEvent) => any;
}

/**
 * UI Events with no bubble
 */
export interface UIEventHandlers {
    onScroll?: (event: UIEvent) => any;
    onResize?: (Event: UIEvent) => any;
}

export interface AnimationEventHandlers {
    onTransitionStart?(event: TransitionEvent): any;
    onTransitionEnd?(event: TransitionEvent): any;
    onTransitionCancel?(event: TransitionEvent): any;
    onAnimationStart?(event: AnimationEvent): any;
    onAnimationEnd?(event: AnimationEvent): any;
    onAnimationCancel?(event: AnimationEvent): any;
}

/**
 * Events of every HTML Element itself
 */
export type BaseEventHandlers = KeyboardEventHandlers &
    MouseEventHandlers &
    HoverEventHandlers &
    TouchEventHandlers &
    UIEventHandlers &
    AnimationEventHandlers;

/**
 * Field Events with no bubble
 */
export interface FieldEventHandlers {
    onFocus?: (event: FocusEvent) => any;
    onBlur?: (event: FocusEvent) => any;
}

export interface InputEventHandlers {
    onFocusIn?: (event: FocusEvent) => any;
    onFocusOut?: (event: FocusEvent) => any;
    onInput?: (event: InputEvent) => any;
    onChange?: (event: Event) => any;
}

export interface FormEventHandlers {
    onSubmit?(event: Event): any;
    onReset?(event: Event): any;
}

/**
 * Events of every Container HTML Element
 */
export type BubbleEventHandlers = KeyboardEventHandlers &
    MouseEventHandlers &
    TouchEventHandlers &
    AnimationEventHandlers &
    InputEventHandlers &
    FormEventHandlers;

export type HTMLOwnKeys<T extends HTMLElement = HTMLElement> = Exclude<
    keyof T,
    keyof Node | keyof EventTarget
>;
export type SVGOwnKeys<T extends SVGElement = SVGElement> = Exclude<
    keyof T,
    keyof Node | keyof EventTarget
>;
export type HTMLContentKeys =
    | 'innerHTML'
    | 'innerText'
    | 'textContent'
    | 'contentEditable';

export type BaseHTMLProps<T extends HTMLElement> = Partial<
    Pick<T, DataKeys<Pick<T, HTMLOwnKeys<T>>>>
>;
export type BaseSVGProps<T extends SVGElement> = Partial<
    Pick<T, DataKeys<Pick<T, SVGOwnKeys<T>>>>
>;

export type CSSStyles = Partial<
    Omit<CSSStyleDeclaration, 'length' | 'parentRule'>
>;

export interface HTMLProps
    extends BaseEventHandlers,
        Omit<BaseHTMLProps<HTMLElement>, 'style' | HTMLContentKeys> {
    style?: CSSStyles;
}
export interface SVGProps
    extends BaseEventHandlers,
        Omit<BaseSVGProps<SVGElement>, 'style'> {
    style?: CSSStyles;
}

export type HTMLContainerProps = BubbleEventHandlers &
    HTMLProps &
    Partial<Pick<HTMLElement, HTMLContentKeys>>;

export interface HTMLHyperLinkProps extends HTMLContainerProps {
    href?: string | URL;
    target?: '_self' | '_parent' | '_top' | '_blank';
}

export type HTMLTableCellProps = HTMLContainerProps &
    Partial<Pick<HTMLTableCellElement, 'colSpan' | 'rowSpan'>>;

export type BaseFieldProps = Partial<
    Pick<
        HTMLInputElement,
        'name' | 'defaultValue' | 'value' | 'required' | 'disabled'
    >
>;
export type TextFieldProps = Partial<
    Pick<HTMLInputElement, 'readOnly' | 'placeholder'>
>;

export type HTMLFieldInternals = Pick<
    HTMLInputElement,
    | 'form'
    | 'validity'
    | 'validationMessage'
    | 'willValidate'
    | 'checkValidity'
    | 'reportValidity'
>;

export interface HTMLFieldProps
    extends HTMLProps,
        BaseFieldProps,
        FieldEventHandlers,
        InputEventHandlers {
    autofocus?: HTMLInputElement['autofocus'];
}

export interface HTMLButtonProps extends HTMLFieldProps, HTMLContainerProps {
    type?: 'button' | 'image' | 'submit' | 'reset';
}

export interface HTMLInputProps extends HTMLFieldProps, TextFieldProps {
    type?:
        | 'checkbox'
        | 'color'
        | 'date'
        | 'datetime-local'
        | 'email'
        | 'file'
        | 'hidden'
        | 'month'
        | 'number'
        | 'password'
        | 'radio'
        | 'range'
        | 'search'
        | 'tel'
        | 'text'
        | 'time'
        | 'url'
        | 'week'
        | HTMLButtonProps['type'];
}

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
        BaseFieldProps,
        HTMLFieldInternals {
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
