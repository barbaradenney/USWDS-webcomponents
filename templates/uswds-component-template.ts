import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA [ComponentName] Web Component
 *
 * USWDS [component] implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-[component-name]
 * @fires [event-name] - Dispatched when [condition]
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-[component]/src/styles/_usa-[component].scss
 * @uswds-docs https://designsystem.digital.gov/components/[component]/
 * @uswds-guidance https://designsystem.digital.gov/components/[component]/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/[component]/#accessibility
 */
@customElement('usa-[component-name]')
export class USA[ComponentName] extends USWDSBaseComponent {
  static override styles = css\`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  \`;

  // REQUIRED: Initialization flag to prevent duplicate USWDS initialization
  @state()
  private initialized = false;

  @property({ type: String })
  name = '';

  @property({ type: Boolean })
  disabled = false;

  // Store USWDS module for cleanup
  private uswdsModule: any = null;

  override connectedCallback() {
    super.connectedCallback();
    console.log('🎯 [ComponentName]: Initializing USWDS component');
    this.initializeUSWDS[ComponentName]();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  /**
   * Initialize USWDS component with duplicate prevention
   * CRITICAL: Always check initialization flag first
   */
  private async initializeUSWDS[ComponentName]() {
    // REQUIRED: Prevent multiple initializations
    if (this.initialized) {
      console.log(\`⚠️ [ComponentName]: Already initialized, skipping duplicate initialization\`);
      return;
    }

    console.log(\`🎯 [ComponentName]: Initializing with USWDS integration\`);

    try {
      // Strategy 1: Try main USWDS bundle
      const module = await import('@uswds/uswds');
      this.uswdsModule = module.default;

      if (this.uswdsModule && typeof this.uswdsModule.on === 'function') {
        this.uswdsModule.on(this);
        this.initialized = true; // REQUIRED: Set flag after successful initialization
        console.log(\`✅ [ComponentName]: USWDS initialized successfully\`);
        return;
      }
    } catch (error) {
      console.warn(\`⚠️ [ComponentName]: USWDS initialization failed:\`, error);
    }

    // Strategy 2: Try global USWDS fallback
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.[componentName] && typeof USWDS.[componentName].on === 'function') {
          USWDS.[componentName].on(this);
          this.initialized = true; // REQUIRED: Set flag after successful initialization
          console.log(\`✅ [ComponentName]: Global USWDS initialized successfully\`);
          return;
        }
      }
    } catch (error) {
      console.warn(\`⚠️ [ComponentName]: Global USWDS fallback failed:\`, error);
    }

    // Fallback: Use component without USWDS enhancement
    console.log(\`🚀 [ComponentName]: Using fallback behavior (no USWDS JavaScript)\`);
    this.setupFallbackBehavior();
  }

  /**
   * Cleanup USWDS integration
   * CRITICAL: Always reset initialization flag
   */
  private cleanupUSWDS() {
    try {
      if (this.uswdsModule && typeof this.uswdsModule.off === 'function') {
        this.uswdsModule.off(this);
        console.log(\`✅ [ComponentName]: USWDS module cleaned up\`);
      } else if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.[componentName] && typeof USWDS.[componentName].off === 'function') {
          USWDS.[componentName].off(this);
          console.log(\`✅ [ComponentName]: Global USWDS cleaned up\`);
        }
      }
    } catch (error) {
      console.warn(\`⚠️ [ComponentName]: Cleanup failed:\`, error);
    }

    this.uswdsModule = null;

    // REQUIRED: Reset initialization flag to allow reinitialization
    this.initialized = false;
  }

  private setupFallbackBehavior() {
    console.log(\`🚀 [ComponentName]: Setting up fallback behavior\`);
    // Implement basic functionality without USWDS JavaScript
  }

  private handleEvent = (e: Event) => {
    if (this.disabled) return;

    // Component-specific event handling
    this.dispatchEvent(new CustomEvent('[event-name]', {
      detail: { /* event data */ },
      bubbles: true,
      composed: true,
    }));
  };

  override render() {
    const classes = [
      'usa-[component-name]',
      this.disabled ? 'usa-[component-name]--disabled' : '',
    ].filter(Boolean).join(' ');

    return html\`
      <div class="\${classes}">
        <!-- Component content using USWDS classes -->
        <slot></slot>
      </div>
    \`;
  }
}

/*
 * DUPLICATE INITIALIZATION PREVENTION CHECKLIST:
 *
 * ✅ Has @state() private initialized = false
 * ✅ Checks this.initialized before initializing
 * ✅ Sets this.initialized = true after successful init
 * ✅ Resets this.initialized = false in cleanup
 * ✅ Has proper cleanup in disconnectedCallback
 * ✅ Uses console.log for guard messages
 * ✅ Has fallback behavior when USWDS fails
 */