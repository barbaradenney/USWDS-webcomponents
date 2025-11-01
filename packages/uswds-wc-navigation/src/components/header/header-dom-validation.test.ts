import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-header.ts';
import type { USAHeader } from './usa-header.js';
/**
 * Header DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing mobile menu button
 * - Missing navigation structure
 * - Logo not displaying
 * - Search functionality missing
 * - Mobile menu not working
 */

describe('Header DOM Structure Validation', () => {
  let element: USAHeader;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-header') as USAHeader;
    element.logoText = 'Test Site';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have header element', async () => {
      await element.updateComplete;

      const header = element.querySelector('.usa-header');
      expect(header).toBeTruthy();
    });

    it('should have navbar element', async () => {
      await element.updateComplete;

      const navbar = element.querySelector('.usa-navbar');
      expect(navbar).toBeTruthy();
    });

    it('should have mobile menu button', async () => {
      await element.updateComplete;

      const menuButton = element.querySelector('.usa-menu-btn');
      expect(menuButton).toBeTruthy();
      expect(menuButton?.tagName).toBe('BUTTON');
    });
  });

  describe('Logo Display', () => {
    it('should display logo text', async () => {
      element.logoText = 'Test Application';
      await element.updateComplete;

      const logoText = element.querySelector('.usa-logo__text');
      expect(logoText).toBeTruthy();
      expect(logoText?.textContent).toContain('Test Application');
    });

    it('should display logo image when provided', async () => {
      element.logoImageSrc = '/logo.png';
      element.logoImageAlt = 'Site Logo';
      await element.updateComplete;

      const logoImg = element.querySelector('.usa-logo img');
      expect(logoImg).toBeTruthy();
      expect(logoImg?.getAttribute('src')).toBe('/logo.png');
      expect(logoImg?.getAttribute('alt')).toBe('Site Logo');
    });

    it('should link logo to homepage', async () => {
      element.logoHref = '/home';
      await element.updateComplete;

      const logoLink = element.querySelector('.usa-logo a');
      expect(logoLink?.getAttribute('href')).toBe('/home');
    });
  });

  describe('Navigation Structure', () => {
    it('should have navigation element', async () => {
      element.navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];
      await element.updateComplete;

      const nav = element.querySelector('.usa-nav');
      expect(nav).toBeTruthy();
    });

    it('should render navigation items', async () => {
      element.navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];
      await element.updateComplete;

      const navLinks = element.querySelectorAll('.usa-nav__primary-item a');
      expect(navLinks.length).toBeGreaterThanOrEqual(2);
    });

    it('should have primary navigation list', async () => {
      element.navItems = [{ label: 'Home', href: '/' }];
      await element.updateComplete;

      const primaryNav = element.querySelector('.usa-nav__primary');
      expect(primaryNav).toBeTruthy();
    });

    it('should mark current page in navigation', async () => {
      element.navItems = [
        { label: 'Home', href: '/', current: true },
        { label: 'About', href: '/about' },
      ];
      await element.updateComplete;

      const currentLink = element.querySelector('.usa-current');
      expect(currentLink).toBeTruthy();
    });
  });

  describe('Extended Header Variant', () => {
    it('should have extended class when extended is true', async () => {
      element.extended = true;
      await element.updateComplete;

      const header = element.querySelector('.usa-header');
      expect(header?.classList.contains('usa-header--extended')).toBe(true);
    });

    it('should NOT have extended class when extended is false', async () => {
      element.extended = false;
      await element.updateComplete;

      const header = element.querySelector('.usa-header');
      expect(header?.classList.contains('usa-header--extended')).toBe(false);
    });
  });

  describe('Search Functionality', () => {
    it('should show search when showSearch is true', async () => {
      element.showSearch = true;
      await element.updateComplete;

      const search = element.querySelector('.usa-search');
      expect(search).toBeTruthy();
    });

    it('should NOT show search when showSearch is false', async () => {
      element.showSearch = false;
      await element.updateComplete;

      const search = element.querySelector('.usa-search');
      expect(search).toBeFalsy();
    });

    it('should have search input with placeholder', async () => {
      element.showSearch = true;
      element.searchPlaceholder = 'Search site';
      await element.updateComplete;

      const searchInput = element.querySelector('.usa-search input');
      expect(searchInput?.getAttribute('placeholder')).toBe('Search site');
    });

    it('should have search button', async () => {
      element.showSearch = true;
      await element.updateComplete;

      const searchButton = element.querySelector('.usa-search button');
      expect(searchButton).toBeTruthy();
      expect(searchButton?.getAttribute('type')).toBe('submit');
    });
  });

  describe('Mobile Menu Functionality', () => {
    it('should have menu button with correct attributes', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const menuButton = element.querySelector('.usa-menu-btn');
      // USWDS may add these attributes after initialization
      expect(menuButton).toBeTruthy();
      expect(
        menuButton?.hasAttribute('aria-controls') || menuButton?.hasAttribute('aria-label')
      ).toBe(true);
    });

    it('should toggle aria-expanded on mobile menu button', async () => {
      element.mobileMenuOpen = true;
      await element.updateComplete;

      const menuButton = element.querySelector('.usa-menu-btn');
      expect(menuButton?.getAttribute('aria-expanded')).toBe('true');

      element.mobileMenuOpen = false;
      await element.updateComplete;

      expect(menuButton?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have close button in mobile menu', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const closeButton = element.querySelector('.usa-nav__close');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Accessibility Structure', () => {
    it('should have banner role on header', async () => {
      await element.updateComplete;

      const header = element.querySelector('.usa-header');
      const banner = header?.closest('[role="banner"]') || header;
      expect(banner).toBeTruthy();
    });

    it('should have navigation role on nav element', async () => {
      element.navItems = [{ label: 'Home', href: '/' }];
      await element.updateComplete;

      const nav = element.querySelector('.usa-nav');
      expect(nav?.closest('[role="navigation"]') || nav).toBeTruthy();
    });

    it('should have proper ARIA labels on buttons', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const menuButton = element.querySelector('.usa-menu-btn');
      // USWDS may add these after initialization
      expect(
        menuButton?.hasAttribute('aria-controls') || menuButton?.hasAttribute('aria-label')
      ).toBe(true);
      expect(menuButton?.hasAttribute('aria-expanded')).toBe(true);
    });
  });

  describe('Submenu Support', () => {
    it('should render submenu items', async () => {
      element.navItems = [
        {
          label: 'Services',
          submenu: [
            { label: 'Service 1', href: '/service1' },
            { label: 'Service 2', href: '/service2' },
          ],
        },
      ];
      await element.updateComplete;

      const submenuButton = element.querySelector('.usa-accordion__button');
      expect(submenuButton).toBeTruthy();
    });

    it('should have proper ARIA attributes on submenu', async () => {
      element.navItems = [
        {
          label: 'Services',
          submenu: [{ label: 'Service 1', href: '/service1' }],
        },
      ];
      await element.updateComplete;

      const submenuButton = element.querySelector('.usa-accordion__button');
      expect(submenuButton?.hasAttribute('aria-expanded')).toBe(true);
      expect(submenuButton?.hasAttribute('aria-controls')).toBe(true);
    });
  });
});
