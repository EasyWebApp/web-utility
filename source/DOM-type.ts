export interface HTMLProps {
    id?: string;
    className?: string;
    title?: string;
    tabIndex?: number;
    onClick?: (event: MouseEvent) => any;
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
    onBlur?: (event: FocusEvent) => any;
    onInput?: (event: InputEvent) => any;
    onChange?: (event: Event) => any;
    [key: string]: any;
}

export type HTMLField = HTMLInputElement &
    HTMLTextAreaElement &
    HTMLSelectElement &
    HTMLFieldSetElement;
