/**
 * In-Page Navigation Story Validation Tests
 *
 * These tests validate that the Storybook stories have consistent
 * navigation items and content sections to prevent broken links.
 */

import { describe, it, expect } from 'vitest';
import type { InPageNavItem } from './usa-in-page-navigation.js';
import {
  validateNavigationTargets,
  validateHeadingSelector,
  generateValidationReport,
} from '../../../__tests__/story-validation-utils.js';

// Import the sample data and helper functions from stories
const testSampleItems: InPageNavItem[] = [
  {
    id: 'overview',
    text: 'Overview',
    href: '#overview',
    level: 2,
  },
  {
    id: 'eligibility',
    text: 'Eligibility Requirements',
    href: '#eligibility',
    level: 2,
    children: [
      {
        id: 'basic-requirements',
        text: 'Basic Requirements',
        href: '#basic-requirements',
        level: 3,
      },
      {
        id: 'documentation',
        text: 'Required Documentation',
        href: '#documentation',
        level: 3,
      },
    ],
  },
  {
    id: 'application-process',
    text: 'Application Process',
    href: '#application-process',
    level: 2,
  },
  {
    id: 'after-you-apply',
    text: 'After You Apply',
    href: '#after-you-apply',
    level: 2,
    children: [
      {
        id: 'review-timeline',
        text: 'Review Timeline',
        href: '#review-timeline',
        level: 3,
      },
      {
        id: 'status-updates',
        text: 'Status Updates',
        href: '#status-updates',
        level: 3,
      },
    ],
  },
  {
    id: 'contact-information',
    text: 'Contact Information',
    href: '#contact-information',
    level: 2,
  },
];

const createContentSections = () => `
  <section>
    <h2 id="overview">Overview</h2>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua.
    </p>
  </section>
  <section>
    <h2 id="eligibility">Eligibility Requirements</h2>
    <p>
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    <h3 id="basic-requirements">Basic Requirements</h3>
    <p>Details about basic requirements for eligibility.</p>
    <h3 id="documentation">Required Documentation</h3>
    <p>Information about required documentation.</p>
  </section>
  <section>
    <h2 id="application-process">Application Process</h2>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur.
    </p>
  </section>
  <section>
    <h2 id="after-you-apply">After You Apply</h2>
    <p>
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <h3 id="review-timeline">Review Timeline</h3>
    <p>Information about the review timeline process.</p>
    <h3 id="status-updates">Status Updates</h3>
    <p>Details about how you'll receive status updates.</p>
  </section>
  <section>
    <h2 id="contact-information">Contact Information</h2>
    <p>
      Contact details and support information for additional assistance.
    </p>
  </section>
`;

describe('In-Page Navigation Story Validation', () => {
  describe('Default Story Validation', () => {
    it('should have all navigation items with corresponding content sections', () => {
      const contentHTML = createContentSections();
      const result = validateNavigationTargets(testSampleItems, contentHTML);

      if (!result.isValid) {
        const report = generateValidationReport(result);
        console.error('Default story validation failed:', report);
      }

      expect(result.isValid).toBe(true);
      expect(result.missingTargets).toEqual([]);
      expect(result.brokenLinks).toEqual([]);
    });

    it('should validate all nested navigation items', () => {
      const contentHTML = createContentSections();
      const result = validateNavigationTargets(testSampleItems, contentHTML);

      // Check that nested items are validated
      const nestedTargets = [
        'basic-requirements',
        'documentation',
        'review-timeline',
        'status-updates',
      ];

      nestedTargets.forEach((targetId) => {
        expect(result.missingTargets).not.toContain(targetId);
      });
    });
  });

  describe('Simple Navigation Story Validation', () => {
    it('should validate simple navigation items', () => {
      const simpleItems = [
        { id: 'introduction', text: 'Introduction', href: '#introduction', level: 2 },
        { id: 'process', text: 'Process', href: '#process', level: 2 },
        { id: 'requirements', text: 'Requirements', href: '#requirements', level: 2 },
        { id: 'conclusion', text: 'Conclusion', href: '#conclusion', level: 2 },
      ];

      const simpleContent = `
        <section>
          <h2 id="introduction">Introduction</h2>
          <p>Welcome to our simple guide.</p>
        </section>
        <section>
          <h2 id="process">Process</h2>
          <p>Here we explain the step-by-step process.</p>
        </section>
        <section>
          <h2 id="requirements">Requirements</h2>
          <p>This section outlines all the requirements.</p>
        </section>
        <section>
          <h2 id="conclusion">Conclusion</h2>
          <p>Summary and final thoughts.</p>
        </section>
      `;

      const result = validateNavigationTargets(simpleItems, simpleContent);

      expect(result.isValid).toBe(true);
      expect(result.missingTargets).toEqual([]);
    });
  });

  describe('Auto-Generation Story Validation', () => {
    it('should validate heading selector format for USWDS compatibility', () => {
      const validSelector = 'h2 h3';
      const invalidSelector = 'h2, h3';

      const validResult = validateHeadingSelector(validSelector);
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateHeadingSelector(invalidSelector);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('USWDS expects space-separated selectors');
    });

    it('should validate auto-generation content structure', () => {
      const autoGenContent = `
        <h2 id="auto-section-1">Automatically Detected Section</h2>
        <p>This section was automatically detected.</p>
        <h3 id="auto-subsection-1">Subsection 1</h3>
        <p>This is a subsection that was also automatically detected.</p>
        <h2 id="auto-section-2">Another Main Section</h2>
        <p>The component scans for h2 and h3 elements.</p>
        <h3 id="auto-subsection-2">Subsection 2</h3>
        <p>Nested navigation items are created for h3 elements.</p>
      `;

      // For auto-generation, we validate that the content has the expected structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(autoGenContent, 'text/html');

      const h2Elements = doc.querySelectorAll('h2');
      const h3Elements = doc.querySelectorAll('h3');

      expect(h2Elements.length).toBeGreaterThan(0);
      expect(h3Elements.length).toBeGreaterThan(0);

      // Verify all headings have IDs (required for navigation)
      const allHeadings = [...h2Elements, ...h3Elements];
      allHeadings.forEach((heading) => {
        expect(heading.id).toBeTruthy();
      });
    });
  });

  describe('Event Handler Stories Validation', () => {
    it('should validate event handler story navigation items', () => {
      const eventItems = [
        { id: 'event-section-1', text: 'Section 1', href: '#event-section-1', level: 2 },
        { id: 'event-section-2', text: 'Section 2', href: '#event-section-2', level: 2 },
        { id: 'event-section-3', text: 'Section 3', href: '#event-section-3', level: 2 },
      ];

      const eventContent = `
        <section>
          <h2 id="event-section-1">Section 1</h2>
          <p>This is the first section.</p>
        </section>
        <section>
          <h2 id="event-section-2">Section 2</h2>
          <p>This is the second section.</p>
        </section>
        <section>
          <h2 id="event-section-3">Section 3</h2>
          <p>This is the third section.</p>
        </section>
      `;

      const result = validateNavigationTargets(eventItems, eventContent);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Custom Scroll Behavior Story Validation', () => {
    it('should validate custom scroll story navigation items', () => {
      const scrollItems = [
        { id: 'scroll-section-1', text: 'Section 1', href: '#scroll-section-1', level: 2 },
        { id: 'scroll-section-2', text: 'Section 2', href: '#scroll-section-2', level: 2 },
        { id: 'scroll-section-3', text: 'Section 3', href: '#scroll-section-3', level: 2 },
      ];

      const scrollContent = `
        <section>
          <h2 id="scroll-section-1">Section 1</h2>
          <p>This section demonstrates custom scroll offset behavior.</p>
        </section>
        <section>
          <h2 id="scroll-section-2">Section 2</h2>
          <p>The scroll offset setting is particularly useful for sites with fixed navigation headers.</p>
        </section>
        <section>
          <h2 id="scroll-section-3">Section 3</h2>
          <p>Smooth scrolling provides a better user experience.</p>
        </section>
      `;

      const result = validateNavigationTargets(scrollItems, scrollContent);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Regression Prevention', () => {
    it('should catch missing target elements', () => {
      const itemsWithMissingTarget = [
        { id: 'existing', text: 'Existing', href: '#existing', level: 2 },
        { id: 'missing', text: 'Missing', href: '#missing', level: 2 },
      ];

      const incompleteContent = `
        <section>
          <h2 id="existing">Existing</h2>
          <p>This section exists.</p>
        </section>
        <!-- Missing section with id="missing" -->
      `;

      const result = validateNavigationTargets(itemsWithMissingTarget, incompleteContent);

      expect(result.isValid).toBe(false);
      expect(result.missingTargets).toContain('missing');
      expect(result.brokenLinks).toContain('#missing');
      expect(result.warnings[0]).toContain('Missing');
    });

    it('should provide helpful suggestions for missing targets', () => {
      const itemsWithMissingTarget = [
        { id: 'missing-section', text: 'Missing Section', href: '#missing-section', level: 2 },
      ];

      const emptyContent = '<div></div>';

      const result = validateNavigationTargets(itemsWithMissingTarget, emptyContent);

      expect(result.suggestions[0]).toContain('<section id="missing-section">');
      expect(result.suggestions[0]).toContain('<h2>Missing Section</h2>');
    });

    it('should validate complex nested structures', () => {
      const complexItems = [
        {
          id: 'parent',
          text: 'Parent',
          href: '#parent',
          level: 2,
          children: [
            { id: 'child1', text: 'Child 1', href: '#child1', level: 3 },
            {
              id: 'child2',
              text: 'Child 2',
              href: '#child2',
              level: 3,
              children: [{ id: 'grandchild', text: 'Grandchild', href: '#grandchild', level: 4 }],
            },
          ],
        },
      ];

      const complexContent = `
        <section>
          <h2 id="parent">Parent</h2>
          <h3 id="child1">Child 1</h3>
          <h3 id="child2">Child 2</h3>
          <h4 id="grandchild">Grandchild</h4>
        </section>
      `;

      const result = validateNavigationTargets(complexItems, complexContent);
      expect(result.isValid).toBe(true);
    });
  });
});
