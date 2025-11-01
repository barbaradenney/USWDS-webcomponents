/**
 * USWDS Design Token Helper Utilities
 *
 * Provides type-safe access to USWDS design tokens for use in web components.
 * These utilities help maintain consistency with USWDS while providing
 * enhanced developer experience through TypeScript.
 */

import type {
  USWDSColorToken,
  USWDSSpacingToken,
  USWDSFontFamilyToken,
  USWDSFontSizeToken,
  USWDSFontWeightToken,
  USWDSBorderRadiusToken,
  USWDSShadowToken,
  USWDSZIndexToken,
} from '../types/index.js';

/**
 * Type-safe CSS custom property generator for USWDS tokens
 */
export class USWDSTokenHelper {
  /**
   * Generate CSS custom property for color tokens
   * @param token - USWDS color token
   * @returns CSS custom property string
   */
  static color(token: USWDSColorToken): string {
    return `var(--usa-color-${token})`;
  }

  /**
   * Generate CSS custom property for spacing tokens
   * @param token - USWDS spacing token
   * @returns CSS custom property string
   */
  static spacing(token: USWDSSpacingToken): string {
    return `var(--usa-spacing-${token})`;
  }

  /**
   * Generate CSS custom property for font family tokens
   * @param token - USWDS font family token
   * @returns CSS custom property string
   */
  static fontFamily(token: USWDSFontFamilyToken): string {
    return `var(--usa-font-family-${token})`;
  }

  /**
   * Generate CSS custom property for font size tokens
   * @param token - USWDS font size token
   * @returns CSS custom property string
   */
  static fontSize(token: USWDSFontSizeToken): string {
    return `var(--usa-font-size-${token})`;
  }

  /**
   * Generate CSS custom property for font weight tokens
   * @param token - USWDS font weight token
   * @returns CSS custom property string
   */
  static fontWeight(token: USWDSFontWeightToken): string {
    return `var(--usa-font-weight-${token})`;
  }

  /**
   * Generate CSS custom property for border radius tokens
   * @param token - USWDS border radius token
   * @returns CSS custom property string
   */
  static borderRadius(token: USWDSBorderRadiusToken): string {
    return `var(--usa-border-radius-${token})`;
  }

  /**
   * Generate CSS custom property for shadow tokens
   * @param token - USWDS shadow token
   * @returns CSS custom property string
   */
  static shadow(token: USWDSShadowToken): string {
    return `var(--usa-shadow-${token})`;
  }

  /**
   * Generate CSS custom property for z-index tokens
   * @param token - USWDS z-index token
   * @returns CSS custom property string
   */
  static zIndex(token: USWDSZIndexToken): string {
    return `var(--usa-z-index-${token})`;
  }

  /**
   * Generate responsive spacing using USWDS responsive tokens
   * @param mobile - Mobile spacing token
   * @param tablet - Optional tablet spacing token
   * @param desktop - Optional desktop spacing token
   * @returns CSS with responsive spacing
   */
  static responsiveSpacing(
    mobile: USWDSSpacingToken,
    tablet?: USWDSSpacingToken,
    desktop?: USWDSSpacingToken
  ): string {
    let css = `${this.spacing(mobile)}`;

    if (tablet) {
      css += `; @media (min-width: 40rem) { ${this.spacing(tablet)} }`;
    }

    if (desktop) {
      css += `; @media (min-width: 64rem) { ${this.spacing(desktop)} }`;
    }

    return css;
  }

  /**
   * Generate responsive typography using USWDS responsive tokens
   * @param size - Font size token
   * @param family - Font family token
   * @param weight - Font weight token
   * @returns CSS font properties
   */
  static typography(
    size: USWDSFontSizeToken,
    family?: USWDSFontFamilyToken,
    weight?: USWDSFontWeightToken
  ): string {
    let css = `font-size: ${this.fontSize(size)};`;

    if (family) {
      css += ` font-family: ${this.fontFamily(family)};`;
    }

    if (weight) {
      css += ` font-weight: ${this.fontWeight(weight)};`;
    }

    return css;
  }
}

/**
 * Enhanced CSS class builder with USWDS token integration
 */
export class USWDSStyleBuilder {
  private styles: Map<string, string> = new Map();

  /**
   * Add color styling with USWDS tokens
   */
  color(token: USWDSColorToken): this {
    this.styles.set('color', USWDSTokenHelper.color(token));
    return this;
  }

  /**
   * Add background color styling with USWDS tokens
   */
  backgroundColor(token: USWDSColorToken): this {
    this.styles.set('background-color', USWDSTokenHelper.color(token));
    return this;
  }

  /**
   * Add border color styling with USWDS tokens
   */
  borderColor(token: USWDSColorToken): this {
    this.styles.set('border-color', USWDSTokenHelper.color(token));
    return this;
  }

  /**
   * Add spacing styling with USWDS tokens
   */
  margin(token: USWDSSpacingToken): this {
    this.styles.set('margin', USWDSTokenHelper.spacing(token));
    return this;
  }

  /**
   * Add padding styling with USWDS tokens
   */
  padding(token: USWDSSpacingToken): this {
    this.styles.set('padding', USWDSTokenHelper.spacing(token));
    return this;
  }

  /**
   * Add margin-top styling with USWDS tokens
   */
  marginTop(token: USWDSSpacingToken): this {
    this.styles.set('margin-top', USWDSTokenHelper.spacing(token));
    return this;
  }

  /**
   * Add margin-bottom styling with USWDS tokens
   */
  marginBottom(token: USWDSSpacingToken): this {
    this.styles.set('margin-bottom', USWDSTokenHelper.spacing(token));
    return this;
  }

  /**
   * Add typography styling with USWDS tokens
   */
  font(
    size: USWDSFontSizeToken,
    family?: USWDSFontFamilyToken,
    weight?: USWDSFontWeightToken
  ): this {
    this.styles.set('font-size', USWDSTokenHelper.fontSize(size));
    if (family) {
      this.styles.set('font-family', USWDSTokenHelper.fontFamily(family));
    }
    if (weight) {
      this.styles.set('font-weight', USWDSTokenHelper.fontWeight(weight));
    }
    return this;
  }

  /**
   * Add border radius styling with USWDS tokens
   */
  borderRadius(token: USWDSBorderRadiusToken): this {
    this.styles.set('border-radius', USWDSTokenHelper.borderRadius(token));
    return this;
  }

  /**
   * Add box shadow styling with USWDS tokens
   */
  shadow(token: USWDSShadowToken): this {
    this.styles.set('box-shadow', USWDSTokenHelper.shadow(token));
    return this;
  }

  /**
   * Add z-index styling with USWDS tokens
   */
  zIndex(token: USWDSZIndexToken): this {
    this.styles.set('z-index', USWDSTokenHelper.zIndex(token));
    return this;
  }

  /**
   * Add custom CSS property
   */
  custom(property: string, value: string): this {
    this.styles.set(property, value);
    return this;
  }

  /**
   * Build CSS string from accumulated styles
   */
  build(): string {
    return Array.from(this.styles.entries())
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }

  /**
   * Build CSS object for use with Lit's css`` template
   */
  buildObject(): Record<string, string> {
    return Object.fromEntries(this.styles);
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.styles.clear();
    return this;
  }
}

/**
 * Utility functions for working with USWDS design tokens
 */
export const designTokens = {
  /**
   * Quick access to token helper
   */
  token: USWDSTokenHelper,

  /**
   * Create a new style builder
   */
  style(): USWDSStyleBuilder {
    return new USWDSStyleBuilder();
  },

  /**
   * Generate USWDS utility class name
   * @param utility - Utility prefix (e.g., 'text', 'bg', 'margin')
   * @param token - Token value
   * @returns USWDS utility class name
   */
  utilityClass(utility: string, token: string): string {
    return `usa-${utility}-${token}`;
  },

  /**
   * Generate responsive utility classes
   * @param utility - Utility prefix
   * @param tokens - Responsive token values
   * @returns Array of responsive utility classes
   */
  responsiveUtilityClasses(
    utility: string,
    tokens: {
      mobile: string;
      tablet?: string;
      desktop?: string;
    }
  ): string[] {
    const classes = [this.utilityClass(utility, tokens.mobile)];

    if (tokens.tablet) {
      classes.push(`tablet:${this.utilityClass(utility, tokens.tablet)}`);
    }

    if (tokens.desktop) {
      classes.push(`desktop:${this.utilityClass(utility, tokens.desktop)}`);
    }

    return classes;
  },

  /**
   * Validate if a string is a valid USWDS color token
   */
  isValidColorToken(token: string): token is USWDSColorToken {
    // This would need to be expanded with actual validation logic
    // For now, this is a type guard placeholder
    return typeof token === 'string' && token.length > 0;
  },

  /**
   * Validate if a string is a valid USWDS spacing token
   */
  isValidSpacingToken(token: string): token is USWDSSpacingToken {
    // This would need to be expanded with actual validation logic
    // For now, this is a type guard placeholder
    return typeof token === 'string' && token.length > 0;
  },
};

/**
 * Type-safe theme configuration builder
 */
export class USWDSThemeBuilder {
  private config: Map<string, string> = new Map();

  /**
   * Set primary color theme
   */
  primaryColor(token: USWDSColorToken): this {
    this.config.set('--usa-color-primary', USWDSTokenHelper.color(token));
    this.config.set('--usa-color-primary-vivid', USWDSTokenHelper.color(token));
    return this;
  }

  /**
   * Set secondary color theme
   */
  secondaryColor(token: USWDSColorToken): this {
    this.config.set('--usa-color-secondary', USWDSTokenHelper.color(token));
    return this;
  }

  /**
   * Set base font family
   */
  baseFontFamily(token: USWDSFontFamilyToken): this {
    this.config.set('--usa-font-family-ui', USWDSTokenHelper.fontFamily(token));
    return this;
  }

  /**
   * Set heading font family
   */
  headingFontFamily(token: USWDSFontFamilyToken): this {
    this.config.set('--usa-font-family-heading', USWDSTokenHelper.fontFamily(token));
    return this;
  }

  /**
   * Build theme configuration as CSS custom properties
   */
  buildCSS(): string {
    return Array.from(this.config.entries())
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }

  /**
   * Build theme configuration as object
   */
  buildObject(): Record<string, string> {
    return Object.fromEntries(this.config);
  }
}
