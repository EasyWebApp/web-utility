import type { IAom } from 'element-internals-polyfill';

import type { DataKeys, PickData, Constructor } from './data';

export type SelfCloseTags =
    | 'area'
    | 'base'
    | 'br'
    | 'col'
    | 'embed'
    | 'hr'
    | 'img'
    | 'input'
    | 'link'
    | 'meta'
    | 'param'
    | 'source'
    | 'track'
    | 'wbr';

export type ShadowableTags =
    | 'article'
    | 'aside'
    | 'blockquote'
    | 'body'
    | 'div'
    | 'footer'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'header'
    | 'main'
    | 'nav'
    | 'p'
    | 'section'
    | 'span'
    | `${string}-${string}`;

/* -------------------- Event Handlers -------------------- */

export type EventTypes = {
    [K in keyof typeof globalThis]: K extends `${infer N}Event`
        ? N extends ''
            ? never
            : N
        : never;
}[keyof typeof globalThis];

export type UniqueEventNames = {
    [K in keyof HTMLElementEventMap]: K extends `${Lowercase<EventTypes>}${string}`
        ? never
        : K extends `${string}${Lowercase<EventTypes>}`
        ? never
        : K;
}[keyof HTMLElementEventMap];

export type ComplexUniqueEventNames = {
    [K in UniqueEventNames]: K extends `${infer L}${UniqueEventNames}`
        ? L extends ''
            ? never
            : K
        : never;
}[UniqueEventNames];

export type SimpleEventNames = Exclude<
    UniqueEventNames,
    ComplexUniqueEventNames
>;

export type EventHandlerNames<T extends Element> = {
    [K in keyof T]: K extends `on${infer N}`
        ? T[K] extends (event: Event) => any
            ? N
            : never
        : never;
}[keyof T];

export type CamelEventName<T extends string> = T extends SimpleEventNames
    ? Capitalize<T>
    : T extends `${infer L}${SimpleEventNames}`
    ? T extends `${L}${infer R}`
        ? `${Capitalize<L>}${Capitalize<R>}`
        : T
    : T extends `${Lowercase<EventTypes>}${infer R}`
    ? T extends `${infer L}${R}`
        ? `${Capitalize<L>}${Capitalize<R>}`
        : T
    : T extends `${infer L}${Lowercase<EventTypes>}`
    ? T extends `${L}${infer R}`
        ? `${Capitalize<L>}${Capitalize<R>}`
        : T
    : T;

export type EventHandlers<T extends Element> = {
    [K in EventHandlerNames<T> as `on${CamelEventName<K>}`]: (
        event: HTMLElementEventMap[K]
    ) => any;
};

export type ContainerEvents = 'focusin' | 'focusout';

export type ContainerEventHandlers<T extends keyof HTMLElementTagNameMap> =
    T extends SelfCloseTags
        ? {}
        : {
              [K in ContainerEvents as `on${CamelEventName<K>}`]: (
                  event: HTMLElementEventMap[K]
              ) => any;
          };

/* -------------------- DOM Props -------------------- */

export type HTMLOwnKeys<T extends HTMLElement = HTMLElement> = Exclude<
    keyof T,
    keyof Node | keyof EventTarget
>;
export type SVGOwnKeys<T extends SVGElement = SVGElement> = Exclude<
    keyof T,
    keyof Node | keyof EventTarget
>;

export type CSSStyles = Partial<
    Omit<PickData<CSSStyleDeclaration>, 'length' | 'parentRule'> &
        Record<string, any>
>;
export type CSSRule = Record<string, CSSStyles>;
export type CSSObject = CSSRule | Record<string, CSSRule>;

export type DOMProps_Read2Write<T extends Partial<Element>> = {
    [K in keyof T]: T[K] extends HTMLElement
        ? string
        : T[K] extends DOMTokenList
        ? string
        : T[K] extends Element
        ? string
        : T[K] extends CSSStyleDeclaration
        ? CSSStyles
        : T[K];
};
export type HTMLProps<T extends HTMLElement> = Partial<
    IAom &
        EventHandlers<T> &
        DOMProps_Read2Write<Pick<T, Extract<DataKeys<T>, HTMLOwnKeys<T>>>>
>;

export type SVGProps_Read2Write<T extends Partial<SVGElement>> = {
    [K in keyof T]: T[K] extends SVGAnimatedLength
        ? string
        : T[K] extends SVGAnimatedLengthList
        ? string
        : T[K] extends SVGAnimatedRect
        ? string
        : T[K] extends SVGAnimatedPreserveAspectRatio
        ? string
        : T[K];
};
export type SVGProps<T extends SVGElement> = Partial<
    EventHandlers<T> &
        SVGProps_Read2Write<
            DOMProps_Read2Write<Pick<T, Extract<DataKeys<T>, SVGOwnKeys<T>>>>
        >
>;

export interface HTMLHyperLinkProps
    extends HTMLProps<HTMLAnchorElement & HTMLAreaElement> {
    href?: string;
    target?: '_self' | '_parent' | '_top' | '_blank';
}

export type HTMLTableCellProps = HTMLProps<HTMLTableCellElement>;

export type BaseFieldProps = Partial<
    Pick<
        HTMLInputElement,
        'name' | 'defaultValue' | 'value' | 'required' | 'disabled'
    >
>;
export interface BaseInputProps
    extends Partial<Pick<HTMLInputElement, 'readOnly' | 'placeholder'>> {
    list?: string;
}
export type TextFieldProps = BaseInputProps &
    Partial<
        Pick<
            HTMLInputElement,
            | 'size'
            | 'minLength'
            | 'maxLength'
            | 'pattern'
            | 'autocomplete'
            | 'spellcheck'
        >
    >;
export type NumberFieldProps = BaseInputProps &
    Partial<Pick<HTMLInputElement, 'min' | 'max' | 'step'>>;

export type HTMLFieldInternals = Pick<
    HTMLInputElement,
    | 'form'
    | 'validity'
    | 'validationMessage'
    | 'willValidate'
    | 'checkValidity'
    | 'reportValidity'
>;

export type HTMLFieldProps<T extends HTMLElement = HTMLInputElement> =
    HTMLProps<T> & BaseFieldProps;

export interface HTMLButtonProps extends HTMLFieldProps<HTMLButtonElement> {
    type?: 'button' | 'image' | 'submit' | 'reset';
}

export interface HTMLInputProps
    extends HTMLFieldProps,
        Omit<BaseInputProps, 'list'> {
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
 * @see https://developers.google.com/web/fundamentals/web-components/customelements#attrchanges
 */
export interface CustomElementClass<T extends CustomElement = CustomElement> {
    new (...data: any[]): T;

    observedAttributes?: string[];
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

/**
 * @see https://web.dev/more-capable-form-controls/#defining-a-form-associated-custom-element
 */
export interface CustomFormElementClass
    extends CustomElementClass<CustomFormElement> {
    formAssociated?: boolean;
}
