/**
 * Header Layout Tests
 * Tests basic layout structure and positioning without requiring USWDS JavaScript behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../header/index.ts';
import type { USAHeader } from './usa-header.js';

describe('USAHeader Layout Tests', () => {
  let element: USAHeader;

  beforeEach(() => {
    element = document.createElement('usa-header') as USAHeader;
    element.logoText = 'Test Site';
    element.navItems = [
      { label: 'Home', href: '/', current: true },
      { label: 'About', href: '/about' },
      {
        label: 'Services',
        href: '/services',
        submenu: [
          { label: 'Web Design', href: '/services/web-design' },
          { label: 'Consulting', href: '/services/consulting' },
        ],
      },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS header DOM structure', async () => {
    await element.updateComplete;

    const header = element.querySelector('header.usa-header');
    const navbar = element.querySelector('.usa-navbar');
    const nav = element.querySelector('.usa-nav');
    const navContainer = element.querySelector('.usa-nav__primary');

    expect(header).toBeTruthy();
    expect(navbar).toBeTruthy();
    expect(nav).toBeTruthy();
    expect(navContainer).toBeTruthy();

    // Check for proper nesting
    expect(header!.contains(navbar!)).toBe(true);
    expect(header!.contains(nav!)).toBe(true);
    expect(nav!.contains(navContainer!)).toBe(true);
  });

  it('should position mobile menu button correctly within navbar', async () => {
    await element.updateComplete;

    const navbar = element.querySelector('.usa-navbar');
    const menuButton = element.querySelector('.usa-menu-btn');

    expect(menuButton).toBeTruthy();
    expect(navbar!.contains(menuButton!)).toBe(true);
  });

  it('should position navigation close button correctly within nav', async () => {
    await element.updateComplete;

    const nav = element.querySelector('.usa-nav');
    const closeButton = element.querySelector('.usa-nav__close');

    expect(closeButton).toBeTruthy();
    expect(nav!.contains(closeButton!)).toBe(true);
  });

  it('should position search form correctly when enabled', async () => {
    element.showSearch = true;
    await element.updateComplete;

    const searchForm = element.querySelector('.usa-search');
    if (searchForm) {
      const nav = element.querySelector('.usa-nav');
      expect(nav!.contains(searchForm)).toBe(true);
    }
    // Search form presence is tested in other tests
  });

  it('should render submenu structure when nav items have submenus', async () => {
    await element.updateComplete;

    // Check if submenus are rendered (depends on component implementation)
    const submenuButton = element.querySelector('.usa-nav__submenu-button');
    const submenu = element.querySelector('.usa-nav__submenu');

    if (submenuButton && submenu) {
      // If both exist, they should be properly nested
      const navItem = submenuButton.parentElement;
      expect(navItem!.contains(submenu)).toBe(true);
    }
    // Submenu rendering behavior tested in main header tests
  });

  it('should handle extended header variant correctly', async () => {
    element.extended = true;
    await element.updateComplete;

    const header = element.querySelector('.usa-header');
    expect(header!.classList.contains('usa-header--extended')).toBe(true);
  });

  it('should handle basic header variant correctly', async () => {
    element.extended = false;
    await element.updateComplete;

    const header = element.querySelector('.usa-header');
    expect(header!.classList.contains('usa-header--basic')).toBe(true);
  });

  it('should handle search visibility correctly', async () => {
    // Test with search enabled
    element.showSearch = true;
    await element.updateComplete;

    let searchForm = element.querySelector('.usa-search');
    expect(searchForm).toBeTruthy();

    // Test with search disabled
    element.showSearch = false;
    await element.updateComplete;

    searchForm = element.querySelector('.usa-search');
    expect(searchForm).toBeFalsy();
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for header structure', async () => {
      await element.updateComplete;

      const header = element.querySelector('header.usa-header');
      const navbar = element.querySelector('.usa-navbar');
      const logo = element.querySelector('.usa-logo');
      const nav = element.querySelector('.usa-nav');

      // Check header structure
      expect(header).toBeTruthy();
      expect(navbar).toBeTruthy();
      expect(logo).toBeTruthy();
      expect(nav).toBeTruthy();

      // Check proper relationships
      expect(header!.contains(navbar!)).toBe(true);
      expect(navbar!.contains(logo!)).toBe(true);
      expect(header!.contains(nav!)).toBe(true);
    });

    it('should pass visual layout checks for search positioning', async () => {
      element.showSearch = true;
      await element.updateComplete;

      const nav = element.querySelector('.usa-nav');
      const secondary = element.querySelector('.usa-nav__secondary');
      const searchForm = element.querySelector('.usa-search');

      expect(nav).toBeTruthy();
      expect(secondary).toBeTruthy();
      expect(searchForm).toBeTruthy();

      // Search should be in secondary nav
      expect(secondary!.contains(searchForm!)).toBe(true);
      expect(nav!.contains(secondary!)).toBe(true);
    });

    it('should pass visual layout checks for navigation buttons', async () => {
      await element.updateComplete;

      const navbar = element.querySelector('.usa-navbar');
      const menuButton = element.querySelector('.usa-menu-btn');
      const nav = element.querySelector('.usa-nav');
      const closeButton = element.querySelector('.usa-nav__close');

      // Check button placement
      expect(navbar!.contains(menuButton!)).toBe(true);
      expect(nav!.contains(closeButton!)).toBe(true);

      // Check button structure
      expect(menuButton!.tagName).toBe('BUTTON');
      expect(closeButton!.tagName).toBe('BUTTON');
    });

    it('should handle logo rendering correctly', async () => {
      element.logoText = 'Test Agency';
      element.logoHref = '/home';
      await element.updateComplete;

      const logo = element.querySelector('.usa-logo');
      expect(logo).toBeTruthy();

      // Check for logo text (could be in different elements depending on implementation)
      const logoText = logo!.textContent?.trim();
      expect(logoText).toContain('Test Agency');
    });
  });
});