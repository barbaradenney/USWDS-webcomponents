/**
 * Color Contrast Testing Utilities
 *
 * Utilities for testing WCAG color contrast requirements
 */

/**
 * Calculate relative luminance from RGB values
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function getRelativeLuminance(r, g, b) {
  // Normalize RGB values to 0-1
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance using ITU-R BT.709 formula
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse color string to RGB values
 * @param {string} color - Color in any CSS format
 * @returns {Object} Object with r, g, b properties
 */
function parseColor(color) {
  // Create temporary element to get computed color
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);

  const computed = window.getComputedStyle(div).color;
  document.body.removeChild(div);

  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);

  if (!match) {
    // Default to black if parsing fails
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (foreground)
 * @param {string} color2 - Second color (background)
 * @returns {number} Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1, color2) {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Test if color contrast meets WCAG requirements
 * @param {HTMLElement} element - Element to test
 * @param {string} level - WCAG level: 'AA' or 'AAA'
 * @param {string} size - Text size: 'normal' or 'large'
 * @returns {Object} Test result with pass/fail and contrast ratio
 */
export function testColorContrast(element, level = 'AA', size = 'normal') {
  const styles = window.getComputedStyle(element);
  const foreground = styles.color;
  const background = styles.backgroundColor;

  const contrastRatio = calculateContrastRatio(foreground, background);

  // WCAG contrast requirements
  const requirements = {
    AA: {
      normal: 4.5,
      large: 3,
    },
    AAA: {
      normal: 7,
      large: 4.5,
    },
  };

  const required = requirements[level][size];
  const passes = contrastRatio >= required;
  const elementIsLargeText = isLargeText(element);

  return {
    passes,
    passesAA: level === 'AA' ? passes : contrastRatio >= requirements.AA[size],
    passesAAA: level === 'AAA' ? passes : contrastRatio >= requirements.AAA[size],
    contrastRatio,
    ratio: contrastRatio, // Alias for contrastRatio
    required,
    foreground,
    background,
    level,
    size,
    isLargeText: elementIsLargeText,
  };
}

/**
 * Check if text is considered "large" per WCAG
 * Large text is 18pt+ or 14pt+ bold
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether text is large
 */
export function isLargeText(element) {
  const styles = window.getComputedStyle(element);
  const fontSize = parseFloat(styles.fontSize);
  const fontWeight = parseInt(styles.fontWeight);

  // 18pt = 24px (at 96dpi)
  const is18pt = fontSize >= 24;

  // 14pt bold = 18.67px bold (at 96dpi)
  const is14ptBold = fontSize >= 18.67 && fontWeight >= 700;

  return is18pt || is14ptBold;
}

/**
 * Test contrast for all text in element
 * @param {HTMLElement} container - Container to test
 * @param {string} level - WCAG level
 * @returns {Array} Array of contrast test results
 */
export function testAllTextContrast(container, level = 'AA') {
  const results = [];

  // Get all text-containing elements
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) {
      textNodes.push(node.parentElement);
    }
  }

  // Remove duplicates
  const uniqueElements = [...new Set(textNodes)];

  for (const element of uniqueElements) {
    const size = isLargeText(element) ? 'large' : 'normal';
    const result = testColorContrast(element, level, size);
    results.push({
      element,
      ...result,
    });
  }

  return results;
}

/**
 * Assert element meets contrast requirements
 * @param {HTMLElement} element - Element to test
 * @param {string} level - WCAG level
 */
export function assertMeetsContrastRequirements(element, level = 'AA') {
  const size = isLargeText(element) ? 'large' : 'normal';
  const result = testColorContrast(element, level, size);

  if (!result.passes) {
    throw new Error(
      `Contrast ratio ${result.contrastRatio.toFixed(2)}:1 does not meet ` +
        `WCAG ${level} requirements (${result.required}:1 required for ${size} text)`
    );
  }
}
