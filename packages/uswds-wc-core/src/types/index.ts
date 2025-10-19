// Common types for USWDS Web Components

/**
 * Base interface for all USWDS web component properties
 * @template T - Additional component-specific properties
 */
export interface USWDSComponentProps {
  /** Additional CSS classes to apply to the component */
  class?: string;
  /** Unique identifier for the component */
  id?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export type USWDSComponentPropsWithExtensions<T = object> = USWDSComponentProps & T;

/**
 * Comprehensive accessibility properties with strict typing
 */
export interface AccessibilityProps {
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA labelledby reference */
  'aria-labelledby'?: string;
  /** ARIA describedby reference */
  'aria-describedby'?: string;
  /** ARIA expanded state */
  'aria-expanded'?: 'true' | 'false' | boolean;
  /** ARIA controls reference */
  'aria-controls'?: string;
  /** ARIA pressed state */
  'aria-pressed'?: 'true' | 'false' | 'mixed' | boolean;
  /** ARIA selected state */
  'aria-selected'?: 'true' | 'false' | boolean;
  /** ARIA hidden state */
  'aria-hidden'?: 'true' | 'false' | boolean;
  /** ARIA live region politeness */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** ARIA atomic update */
  'aria-atomic'?: 'true' | 'false' | boolean;
  /** ARIA relevant changes */
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all' | string;
  /** ARIA invalid state */
  'aria-invalid'?: 'true' | 'false' | 'grammar' | 'spelling' | boolean;
  /** ARIA required state */
  'aria-required'?: 'true' | 'false' | boolean;
  /** ARIA disabled state */
  'aria-disabled'?: 'true' | 'false' | boolean;
  /** Component role */
  role?: ARIARole;
}

/**
 * Form element properties with enhanced type safety
 */
export interface FormElementProps {
  /** Form element name */
  name?: string;
  /** Form element value */
  value?: string | number | boolean;
  /** Default value */
  defaultValue?: string | number | boolean;
  /** Whether the form element is required */
  required?: boolean;
  /** Whether the form element is readonly */
  readonly?: boolean;
  /** Form element placeholder text */
  placeholder?: string;
  /** Form element autocomplete hint */
  autocomplete?: string;
  /** Form element pattern for validation */
  pattern?: string;
  /** Minimum value for numeric inputs */
  min?: number | string;
  /** Maximum value for numeric inputs */
  max?: number | string;
  /** Step value for numeric inputs */
  step?: number | string;
  /** Minimum length for text inputs */
  minlength?: number;
  /** Maximum length for text inputs */
  maxlength?: number;
}

/**
 * Generic component interface with strict typing
 * @template TProps - Component-specific properties
 * @template TEvents - Component-specific events
 */
export interface USWDSComponent<
  TProps extends object = object,
  TEvents extends object = object
> extends USWDSComponentProps, AccessibilityProps {
  /** Component events map */
  readonly events?: TEvents;
  /** Component-specific properties */
  readonly props?: TProps;
}

// Button specific types
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent-cool'
  | 'accent-warm'
  | 'base'
  | 'outline'
  | 'inverse'
  | 'unstyled';
export type ButtonSize = 'small' | 'medium' | 'big'; // USWDS uses 'big' instead of 'large'
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

// Alert specific types
export type AlertType = 'info' | 'warning' | 'error' | 'success';
export type AlertHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface AlertProps {
  type?: AlertType;
  heading?: string;
  headingLevel?: AlertHeadingLevel;
  dismissible?: boolean;
  slim?: boolean;
  noIcon?: boolean;
}

// Form input types
export type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'search'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week';

export interface InputProps extends FormElementProps {
  type?: InputType;
  error?: string;
  success?: boolean;
  showPasswordToggle?: boolean;
}

// Component event types with enhanced type safety
export interface USWDSEvent<TDetail = unknown> extends CustomEvent<TDetail> {
  readonly target: HTMLElement & EventTarget;
  readonly currentTarget: HTMLElement & EventTarget;
  readonly detail: TDetail;
}

/**
 * Event handler type with proper typing
 */
export type USWDSEventHandler<TDetail = unknown> = (
  event: USWDSEvent<TDetail>
) => void;

/**
 * Event map for components
 */
export interface USWDSEventMap {
  change: USWDSEvent<{ value: string | number | boolean; name?: string }>;
  input: USWDSEvent<{ value: string | number | boolean; name?: string }>;
  focus: USWDSEvent<{ target: HTMLElement }>;
  blur: USWDSEvent<{ target: HTMLElement }>;
  click: USWDSEvent<{ target: HTMLElement }>;
  submit: USWDSEvent<{ formData: FormData }>;
  reset: USWDSEvent<{ target: HTMLElement }>;
}

/**
 * Utility type for extracting component properties
 */
export type ComponentProps<T> = T extends USWDSComponent<infer P, object> ? P : never;

/**
 * Utility type for extracting component events
 */
export type ComponentEvents<T> = T extends USWDSComponent<object, infer E> ? E : never;

/**
 * Type-safe property change callback
 */
export type PropertyChangeCallback<T> = (newValue: T, oldValue: T) => void;

/**
 * Enhanced property descriptor with type safety
 */
export interface PropertyDescriptor<T> {
  type: new () => T;
  value?: T;
  hasChanged?: (newVal: T, oldVal: T) => boolean;
  reflect?: boolean;
  converter?: PropertyConverter<T>;
}

/**
 * Property converter interface with type safety
 */
export interface PropertyConverter<T> {
  fromAttribute?: (value: string | null, type?: unknown) => T;
  toAttribute?: (value: T, type?: unknown) => string | null;
}

/**
 * ARIA role type union for better IDE support
 */
type ARIARole = 
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

/**
 * Official USWDS design token types
 * Based on USWDS design token structure and naming conventions
 */

// Color token types
export type USWDSColorGrade = 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90;
export type USWDSColorFamily = 
  | 'red' | 'orange' | 'gold' | 'yellow' | 'green' | 'mint' | 'cyan'
  | 'blue' | 'indigo' | 'violet' | 'magenta' | 'gray'
  | 'blue-cool' | 'blue-warm' | 'red-cool' | 'red-warm'
  | 'gray-cool' | 'gray-warm';

export type USWDSSystemColorToken = 
  | `${USWDSColorFamily}-${USWDSColorGrade}`
  | `${USWDSColorFamily}-${USWDSColorGrade}v` // vivid variants
  | 'white' | 'black' | 'transparent';

export type USWDSThemeColorToken = 
  | 'base-lightest' | 'base-lighter' | 'base-light' | 'base' | 'base-dark' | 'base-darker' | 'base-darkest'
  | 'ink' | 'primary-lighter' | 'primary-light' | 'primary' | 'primary-vivid' | 'primary-dark' | 'primary-darker'
  | 'secondary-lighter' | 'secondary-light' | 'secondary' | 'secondary-vivid' | 'secondary-dark' | 'secondary-darker'
  | 'accent-cool-lighter' | 'accent-cool-light' | 'accent-cool' | 'accent-cool-dark' | 'accent-cool-darker'
  | 'accent-warm-lighter' | 'accent-warm-light' | 'accent-warm' | 'accent-warm-dark' | 'accent-warm-darker'
  | 'error-lighter' | 'error-light' | 'error' | 'error-dark' | 'error-darker'
  | 'warning-lighter' | 'warning-light' | 'warning' | 'warning-dark' | 'warning-darker'
  | 'success-lighter' | 'success-light' | 'success' | 'success-dark' | 'success-darker'
  | 'info-lighter' | 'info-light' | 'info' | 'info-dark' | 'info-darker'
  | 'emergency' | 'emergency-dark' | 'disabled' | 'disabled-light';

export type USWDSColorToken = USWDSSystemColorToken | USWDSThemeColorToken;

// Spacing token types
export type USWDSSpacingToken = 
  | 'auto' | '0' | '1px' | '2px' | 'neg-1px' | 'neg-2px'
  | '05' | '1' | '105' | '2' | '205' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '15'
  | 'neg-05' | 'neg-1' | 'neg-105' | 'neg-2' | 'neg-205' | 'neg-3' | 'neg-4' | 'neg-5' | 'neg-6' | 'neg-7' | 'neg-8' | 'neg-9' | 'neg-10' | 'neg-15'
  | 'card' | 'card-lg' | 'mobile' | 'mobile-lg' | 'tablet' | 'tablet-lg' | 'desktop' | 'desktop-lg' | 'widescreen';

// Typography token types
export type USWDSFontFamilyToken = 'ui' | 'heading' | 'body' | 'code' | 'alt' | 'serif' | 'sans' | 'mono' | 'cond' | 'icon' | 'lang';

export type USWDSFontSizeToken = 
  | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  | 'micro' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20';

export type USWDSFontWeightToken = 'light' | 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// Border radius tokens
export type USWDSBorderRadiusToken = '0' | 'sm' | 'md' | 'lg' | 'pill' | 'full';

// Shadow tokens  
export type USWDSShadowToken = 'none' | '1' | '2' | '3' | '4' | '5';

// Z-index tokens
export type USWDSZIndexToken = 'auto' | 'bottom' | 'top' | 'above' | 'modal' | 'overlay';

/**
 * USWDS Design Token interface matching official structure
 */
export interface USWDSDesignTokens {
  color: {
    system: Record<USWDSSystemColorToken, string>;
    theme: Record<USWDSThemeColorToken, string>;
  };
  spacing: Record<USWDSSpacingToken, string>;
  typography: {
    fontFamily: Record<USWDSFontFamilyToken, string>;
    fontSize: Record<USWDSFontSizeToken, string>;
    fontWeight: Record<USWDSFontWeightToken, string>;
  };
  borderRadius: Record<USWDSBorderRadiusToken, string>;
  shadow: Record<USWDSShadowToken, string>;
  zIndex: Record<USWDSZIndexToken, number | string>;
}

/**
 * Theme configuration interface
 */
export interface USWDSThemeConfig {
  tokens: Partial<USWDSDesignTokens>;
  mode: 'light' | 'dark' | 'auto';
  customProperties: Record<string, string>;
}

/**
 * Strict typing for component state management
 */
export interface ComponentState<T extends Record<string, unknown>> {
  readonly current: T;
  update: (partial: Partial<T>) => void;
  reset: () => void;
  subscribe: (callback: (state: T) => void) => () => void;
}

/**
 * Type-safe event emitter interface
 */
export interface TypedEventEmitter<TEventMap extends Record<string, unknown>> {
  emit<K extends keyof TEventMap>(event: K, detail: TEventMap[K]): boolean;
  addEventListener<K extends keyof TEventMap>(
    event: K,
    listener: (event: CustomEvent<TEventMap[K]>) => void,
    options?: AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof TEventMap>(
    event: K,
    listener: (event: CustomEvent<TEventMap[K]>) => void,
    options?: EventListenerOptions
  ): void;
}
