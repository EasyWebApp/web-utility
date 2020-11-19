export interface HTMLProps {
    id?: string;
    className?: string;
    style?: Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule'>>;
    title?: string;
    tabIndex?: number;
    innerHTML?: string;
    onClick?: (event: MouseEvent) => any;
    onDblClick?: (event: MouseEvent) => any;
    onMouseDown?: (event: MouseEvent) => any;
    onMouseMove?: (event: MouseEvent) => any;
    onMouseUp?: (event: MouseEvent) => any;
    onMouseEnter?: (event: MouseEvent) => any;
    onMouseLeave?: (event: MouseEvent) => any;
    onMouseOver?: (event: MouseEvent) => any;
    onMouseOut?: (event: MouseEvent) => any;
    onKeyDown?: (event: KeyboardEvent) => any;
    onKeyPress?: (event: KeyboardEvent) => any;
    onKeyUp?: (event: KeyboardEvent) => any;
    [key: string]: any;
}

export interface HTMLHyperLinkProps extends HTMLProps {
    href?: string | URL;
    target?: '_self' | '_parent' | '_top' | '_blank';
}

export interface TableCellProps {
    colSpan?: number;
    rowSpan?: number;
}

export interface BaseFieldProps extends HTMLProps {
    name?: string;
    defaultValue?: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    autofocus?: boolean;
    onFocus?: (event: FocusEvent) => any;
    onFocusIn?: (event: FocusEvent) => any;
    onBlur?: (event: FocusEvent) => any;
    onFocusOut?: (event: FocusEvent) => any;
    onInput?: (event: InputEvent) => any;
    onChange?: (event: Event) => any;
}

export type HTMLField = HTMLInputElement &
    HTMLTextAreaElement &
    HTMLSelectElement &
    HTMLFieldSetElement;
