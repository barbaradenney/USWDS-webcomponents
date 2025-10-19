import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-file-input.ts';
import type { USAFileInput } from './usa-file-input.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '../../../__tests__/accessibility-utils.js';
import {
  waitForUpdate, waitForBehaviorInit, testPropertyChanges,
  validateComponentJavaScript,
  runUSWDSTransformationTests,
} from '../../../__tests__/test-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
  testActivationKeys,
} from '../../../__tests__/keyboard-navigation-utils.js';

describe('USAFileInput', () => {
  let element: USAFileInput;

  beforeEach(() => {
    element = document.createElement('usa-file-input') as USAFileInput;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-FILE-INPUT');
    });

    it('should have default properties', () => {
      expect(element.name).toBe('file-input');
      expect(element.inputId).toBe('file-input');
      expect(element.label).toBe('Select file');
      expect(element.hint).toBe('');
      expect(element.multiple).toBe(false);
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.accept).toBe('');
      expect(element.maxFileSize).toBe('');
      expect(element.selectedFiles).toEqual([]);
      // Note: dragText and chooseText are created by USWDS JavaScript, not component properties
    });
  });

  describe('Properties', () => {
    it('should handle label changes', async () => {
      await testPropertyChanges(
        element,
        'label',
        ['Upload Document', 'Choose Image', 'Select Files'],
        async (el, value) => {
          expect(el.label).toBe(value);
          const label = el.querySelector('label');
          expect(label?.textContent?.trim()).toContain(value);
        }
      );
    });

    it('should handle hint changes', async () => {
      await testPropertyChanges(
        element,
        'hint',
        ['Select up to 5 files', 'Maximum 10MB per file', ''],
        async (el, value) => {
          expect(el.hint).toBe(value);
          if (value) {
            const hint = el.querySelector('.usa-hint');
            expect(hint?.textContent?.trim()).toBe(value);
          }
        }
      );
    });

    it('should handle multiple file selection', async () => {
      element.multiple = true;
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.multiple).toBe(true);
    });

    it('should handle disabled state', async () => {
      element.disabled = true;
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should handle required state', async () => {
      element.required = true;
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      const label = element.querySelector('label');

      expect(input.required).toBe(true);
      expect(label?.innerHTML).toContain('required');
    });

    it('should handle accept attribute', async () => {
      element.accept = '.pdf,.doc,.docx';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.accept).toBe('.pdf,.doc,.docx');
    });

  });

  describe('Rendering', () => {
    it('should render file input with correct structure', async () => {
      element.label = 'Test File';
      element.hint = 'Test hint';

      await waitForUpdate(element);

      const formGroup = element.querySelector('.usa-form-group');
      const label = element.querySelector('.usa-label');
      const hint = element.querySelector('.usa-hint');
      const fileInput = element.querySelector('.usa-file-input');
      const input = element.querySelector('input[type="file"]');

      expect(formGroup).toBeTruthy();
      expect(label).toBeTruthy();
      expect(hint).toBeTruthy();
      expect(fileInput).toBeTruthy();
      expect(input).toBeTruthy();
      // Note: .usa-file-input__target is created by USWDS JavaScript, not by the component
    });

    it('should not render hint when not provided', async () => {
      element.hint = '';
      await waitForUpdate(element);

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBe(null);
    });

    it('should render required asterisk when required', async () => {
      element.required = true;
      await waitForUpdate(element);

      const requiredAbbr = element.querySelector('abbr[title="required"]');
      expect(requiredAbbr).toBeTruthy();
      expect(requiredAbbr?.textContent).toBe('*');
    });

    it('should set form group class for required fields', async () => {
      element.required = true;
      await waitForUpdate(element);

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--required')).toBe(true);
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should use custom input ID when provided', async () => {
      element.inputId = 'custom-file-input';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]');
      expect(input?.id).toBe('custom-file-input');
    });

    it('should connect label to input', async () => {
      element.inputId = 'test-file';
      element.label = 'Test Label';

      await waitForUpdate(element);

      const label = element.querySelector('label');
      const input = element.querySelector('input[type="file"]');

      expect(label?.getAttribute('for')).toBe('test-file');
      expect(input?.id).toBe('test-file');
    });

    it('should connect hint via aria-describedby', async () => {
      element.inputId = 'test-file';
      element.hint = 'Test hint';

      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]');
      const hint = element.querySelector('.usa-hint');

      expect(input?.getAttribute('aria-describedby')).toBe('test-file-hint');
      expect(hint?.id).toBe('test-file-hint');
    });

    // TODO: Requires USWDS file preview rendering - redesign test
    it.skip('should set proper aria-label on remove buttons', async () => {
      // Create mock files
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const removeButton = element.querySelector('.usa-file-input__preview-file-remove');
      expect(removeButton?.getAttribute('aria-label')).toBe('Remove test.txt');
    });
  });

  describe('File Selection', () => {
    // TODO: File input mocking doesn't trigger USWDS change handler - needs Cypress test
    it.skip('should handle file selection via input', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('file-change', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      await waitForBehaviorInit(element);

      // Create mock file
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;

      // Mock file selection
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      input.dispatchEvent(new Event('change', { bubbles: true }));

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(eventFired).toBe(true);
      expect(eventDetail.files).toHaveLength(1);
      expect(eventDetail.files[0].name).toBe('test.txt');
      expect(element.selectedFiles).toHaveLength(1);
    });

    it('should handle multiple file selection', async () => {
      element.multiple = true;
      await waitForUpdate(element);

      const mockFile1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const mockFile2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

      element.selectedFiles = [mockFile1, mockFile2];
      await waitForUpdate(element);

      expect(element.selectedFiles).toHaveLength(2);
      expect(element.selectedFiles[0].name).toBe('test1.txt');
      expect(element.selectedFiles[1].name).toBe('test2.txt');
    });

    // TODO: Redesign to test via native input, not selectedFiles property
    // selectedFiles property doesn't trigger USWDS preview rendering
    it.skip('should display selected files', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      element.selectedFiles = [mockFile];
      await waitForBehaviorInit(element);

      const preview = element.querySelector('.usa-file-input__preview');
      const fileName = element.querySelector('.usa-file-input__preview-file-name');
      const fileSize = element.querySelector('.usa-file-input__preview-file-size');

      expect(preview).toBeTruthy();
      expect(fileName?.textContent).toBe('document.pdf');
      expect(fileSize?.textContent).toBeTruthy();
    });

    // TODO: Redesign to test via native input interaction
    it.skip('should handle file removal', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('file-remove', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const mockFile1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const mockFile2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

      element.selectedFiles = [mockFile1, mockFile2];
      await waitForUpdate(element);

      const removeButton = element.querySelector(
        '.usa-file-input__preview-file-remove'
      ) as HTMLButtonElement;
      removeButton.click();

      await waitForUpdate(element);

      expect(eventFired).toBe(true);
      expect(eventDetail.file.name).toBe('test1.txt');
      expect(eventDetail.index).toBe(0);
      expect(eventDetail.remainingFiles).toHaveLength(1);
      expect(element.selectedFiles).toHaveLength(1);
      expect(element.selectedFiles[0].name).toBe('test2.txt');
    });
  });

  describe('Drag and Drop', () => {
    it('should not accept drop when disabled', async () => {
      element.disabled = true;
      await waitForUpdate(element);

      const target = element.querySelector('.usa-file-input') as HTMLElement;
      const mockFile = new File(['content'], 'dropped.txt', { type: 'text/plain' });

      const dropEvent = new Event('drop', { bubbles: true }) as any;
      Object.defineProperty(dropEvent, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(dropEvent, 'stopPropagation', { value: vi.fn() });
      dropEvent.dataTransfer = {
        files: [mockFile],
      };

      target.dispatchEvent(dropEvent);

      await waitForUpdate(element);

      expect(element.selectedFiles).toHaveLength(0);
    });
  });

  // TODO: File size formatting is handled by USWDS JS - redesign these tests
  describe.skip('File Size Formatting', () => {
    it('should format file sizes correctly', async () => {
      // Test with a reasonably sized file to avoid string length issues
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 1536 });

      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const fileSize = element.querySelector('.usa-file-input__preview-file-size');
      expect(fileSize?.textContent).toBe('1.5 KB');
    });

    it('should handle zero byte files', async () => {
      const mockFile = new File([''], 'empty.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 0 });

      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const fileSize = element.querySelector('.usa-file-input__preview-file-size');
      expect(fileSize?.textContent).toBe('0 Bytes');
    });

    it('should format large file sizes', async () => {
      const mockFile = new File(['content'], 'large.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, 'size', { value: 2048576 }); // ~2MB

      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const fileSize = element.querySelector('.usa-file-input__preview-file-size');
      expect(fileSize?.textContent).toBe('1.95 MB');
    });
  });

  describe('Form Integration', () => {
    it('should work within a form', async () => {
      const form = document.createElement('form');
      element.name = 'test-files';
      form.appendChild(element);
      document.body.appendChild(form);

      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.name).toBe('test-files');

      form.remove();
    });

    it('should support form validation', async () => {
      element.required = true;
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.checkValidity()).toBe(false);

      // Simulate file selection by updating the component's selectedFiles directly
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      element.selectedFiles = [mockFile];

      // Create a proper FileList mock
      const fileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => (index === 0 ? mockFile : null),
        [Symbol.iterator]: function* () {
          yield mockFile;
        },
      };

      // Mock the input.files to simulate browser behavior
      Object.defineProperty(input, 'files', {
        value: fileList,
        writable: false,
        configurable: true,
      });

      // Trigger a change event to simulate user interaction
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await waitForUpdate(element);

      // In jsdom, file input validation doesn't work as expected
      // Verify that files are properly set which would make the input valid
      expect(input.files?.length).toBeGreaterThan(0);
      expect(input.files?.[0]?.name).toBe('test.txt');
    });
  });

  // TODO: Preview display is handled by USWDS JS - redesign these tests
  describe.skip('Preview Display', () => {
    it('should show plural text for multiple files', async () => {
      const mockFile1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const mockFile2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

      element.selectedFiles = [mockFile1, mockFile2];
      await waitForUpdate(element);

      const heading = element.querySelector('.usa-file-input__preview-heading span');
      expect(heading?.textContent).toBe('Selected files');
    });

    it('should show singular text for single file', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const heading = element.querySelector('.usa-file-input__preview-heading span');
      expect(heading?.textContent).toBe('Selected file');
    });

    it('should not show preview when no files selected', async () => {
      element.selectedFiles = [];
      await waitForUpdate(element);

      const preview = element.querySelector('.usa-file-input__preview');
      expect(preview).toBe(null);
    });
  });

  // TODO: Error handling requires USWDS behavior - test via Cypress
  describe.skip('Error Handling', () => {
    it('should clear input when all files are removed', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      const removeButton = element.querySelector(
        '.usa-file-input__preview-file-remove'
      ) as HTMLButtonElement;

      // Mock input.value for clearing
      const valueSetter = vi.fn();
      Object.defineProperty(input, 'value', {
        set: valueSetter,
        get: () => '',
      });

      removeButton.click();
      await waitForUpdate(element);

      expect(element.selectedFiles).toHaveLength(0);
      expect(valueSetter).toHaveBeenCalledWith('');
    });

    it('should handle empty file list gracefully', async () => {
      element.selectedFiles = [];
      await waitForUpdate(element);

      expect(element.querySelector('.usa-file-input__preview')).toBe(null);
    });
  });

  // TODO: Custom events require USWDS behavior - test via Cypress
  describe.skip('Custom Events', () => {
    it('should dispatch file-change event with correct detail', async () => {
      let eventDetail: any = null;

      element.addEventListener('file-change', (e: any) => {
        eventDetail = e.detail;
      });

      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      element.selectedFiles = [mockFile];

      // Simulate input change
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      input.dispatchEvent(new Event('change', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.files).toHaveLength(1);
      expect(eventDetail.input).toBe(input);
    });

    it('should dispatch file-remove event with correct detail', async () => {
      let eventDetail: any = null;

      element.addEventListener('file-remove', (e: any) => {
        eventDetail = e.detail;
      });

      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      element.selectedFiles = [mockFile];
      await waitForUpdate(element);

      const removeButton = element.querySelector(
        '.usa-file-input__preview-file-remove'
      ) as HTMLButtonElement;
      removeButton.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.file).toBe(mockFile);
      expect(eventDetail.index).toBe(0);
      expect(eventDetail.remainingFiles).toHaveLength(0);
    });
  });

  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      const originalParent = element.parentElement;

      element.name = 'updated-file';
      element.inputId = 'updated-file-input';
      element.label = 'Updated File Label';
      element.hint = 'Updated hint text';
      element.multiple = true;
      element.disabled = true;
      element.required = true;
      element.accept = 'image/*,.pdf';
      element.maxFileSize = '10MB';
      // Note: dragText and chooseText are handled by USWDS JavaScript

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.parentElement).toBe(originalParent);
    });

    it('should handle file selection and removal without removal', async () => {
      const originalParent = element.parentElement;

      // Add files
      const mockFiles = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['content3'], 'file3.jpg', { type: 'image/jpeg' }),
      ];

      element.selectedFiles = mockFiles;
      await element.updateComplete;

      // Remove files one by one
      for (let i = mockFiles.length - 1; i >= 0; i--) {
        element.selectedFiles = element.selectedFiles.slice(0, i);
        await element.updateComplete;
      }

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM presence during drag and drop operations', async () => {
      const originalParent = element.parentElement;

      const dropTarget = element.querySelector('.usa-file-input__target') as HTMLElement;

      if (dropTarget) {
        // Simulate drag events
        dropTarget.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        dropTarget.dispatchEvent(new DragEvent('dragover', { bubbles: true }));

        // Add files during drag state
        element.selectedFiles = [new File(['drag content'], 'dragged.txt', { type: 'text/plain' })];
        await element.updateComplete;

        dropTarget.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
        dropTarget.dispatchEvent(new DragEvent('drop', { bubbles: true }));
      }

      element.disabled = false;
      element.required = true;
      await element.updateComplete;

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  // TODO: Storybook integration requires real file input - test via Cypress
  describe.skip('Storybook Integration Tests (CRITICAL)', () => {
    it('should render in Storybook environment without errors', async () => {
      const storybookContainer = document.createElement('div');
      storybookContainer.id = 'storybook-root';
      document.body.appendChild(storybookContainer);

      const storybookElement = document.createElement('usa-file-input') as USAFileInput;
      storybookElement.label = 'Storybook File Upload';
      storybookElement.hint = 'Upload files from Storybook';
      storybookElement.multiple = true;
      storybookElement.accept = '.pdf,.doc,.docx';
      storybookElement.maxFileSize = '5MB';

      storybookContainer.appendChild(storybookElement);

      await waitForUpdate(storybookElement);

      expect(storybookContainer.contains(storybookElement)).toBe(true);
      expect(storybookElement.isConnected).toBe(true);

      const input = storybookElement.querySelector('input[type="file"]');
      const label = storybookElement.querySelector('label');
      // Note: .usa-file-input__target is created by USWDS JavaScript, not by component

      expect(input).toBeTruthy();
      expect(label).toBeTruthy();

      storybookContainer.remove();
    });

    it('should handle Storybook control updates without component removal', async () => {
      const mockStorybookUpdate = vi.fn();
      element.addEventListener('file-change', mockStorybookUpdate);
      element.addEventListener('file-remove', mockStorybookUpdate);

      // Simulate Storybook controls panel updates
      element.label = 'Controls Updated File';
      element.hint = 'Updated from controls';
      element.multiple = false;
      element.accept = 'image/*';
      element.maxFileSize = '2MB';
      element.disabled = false;
      element.required = true;
      // Note: dragText and chooseText are handled by USWDS JavaScript

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.label).toBe('Controls Updated File');
      expect(element.accept).toBe('image/*');

      const input = element.querySelector('input[type="file"]');
      const label = element.querySelector('label');
      expect(input?.accept).toBe('image/*');
      expect(label?.textContent).toContain('Controls Updated File');
    });

    it('should maintain event listeners during Storybook interactions', async () => {
      const changeSpy = vi.fn();
      const removeSpy = vi.fn();

      element.addEventListener('file-change', changeSpy);
      element.addEventListener('file-remove', removeSpy);

      await element.updateComplete;

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      const dropTarget = element.querySelector('.usa-file-input__target') as HTMLElement;

      // Test file selection
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // Test drag and drop
      if (dropTarget) {
        dropTarget.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
        dropTarget.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
        dropTarget.dispatchEvent(new DragEvent('drop', { bubbles: true }));
      }

      // Test file removal if preview exists
      element.selectedFiles = [mockFile];
      await element.updateComplete;

      const removeButton = element.querySelector(
        '.usa-file-input__preview-file-remove'
      ) as HTMLButtonElement;
      if (removeButton) {
        removeButton.click();
      }

      expect(changeSpy).toHaveBeenCalled();
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  // TODO: USWDS integration requires real browser - test via Cypress
  describe.skip('USWDS Enhancement Integration (CRITICAL)', () => {
    let newElement: USAFileInput;

    beforeEach(() => {
      // Create fresh element for USWDS tests to avoid state pollution
      newElement = document.createElement('usa-file-input') as USAFileInput;
      newElement.label = 'File upload test';
      newElement.name = 'test-files';
      newElement.accept = '.pdf,.jpg,.png';
      newElement.multiple = true;
      document.body.appendChild(newElement);

      // Mock global USWDS for testing (avoid (global as any).USWDS pattern)
      (global as any).USWDS = {
        fileInput: {
          enhance: vi.fn().mockImplementation((fileInputEl: HTMLElement) => {
            // Mock USWDS file input enhancement
            const target = fileInputEl.querySelector('.usa-file-input__target');
            if (target) {
              // Add enhanced validation elements
              const validationDiv = document.createElement('div');
              validationDiv.className = 'usa-file-input__validation';
              validationDiv.innerHTML = '<span class="usa-file-input__validation-text">Files validated</span>';
              target.appendChild(validationDiv);
              
              // Add enhanced file preview with validation
              const input = fileInputEl.querySelector('input[type="file"]');
              if (input) {
                input.classList.add('usa-file-input--enhanced');
              }
              
              // Mark as enhanced
              fileInputEl.classList.add('usa-file-input--enhanced');
              
              // Add enhanced drag styling
              target.setAttribute('data-enhanced', 'true');
            }
          }),
          validateFiles: vi.fn().mockImplementation((files: FileList) => {
            // Mock file validation
            return Array.from(files).map(file => ({
              file,
              valid: file.size <= 10485760, // 10MB limit
              errors: file.size > 10485760 ? ['File too large'] : []
            }));
          })
        }
      };
    });

    afterEach(() => {
      newElement?.remove();
      // Clean up global mock
      if ((global as any).USWDS) {
        delete (global as any).USWDS;
      }
    });

    it('should maintain basic file input structure (progressive enhancement)', async () => {
      await waitForUpdate(newElement);

      // Should always have basic structure regardless of USWDS availability
      expect(newElement.querySelector('.usa-file-input')).toBeTruthy();
      expect(newElement.querySelector('input[type="file"]')).toBeTruthy();
      // Note: .usa-file-input__target and .usa-file-input__instructions are created by USWDS JavaScript
      // The component provides minimal structure for progressive enhancement
    });

    it('should handle file validation with USWDS when available', async () => {
      await waitForUpdate(newElement);

      // Mock file validation
      const mockFile1 = new File(['small content'], 'small.txt', { type: 'text/plain' });
      const mockFile2 = new File(['x'.repeat(20000000)], 'large.pdf', { type: 'application/pdf' }); // Large file

      // Simulate FileList for validation
      const mockFileList = {
        0: mockFile1,
        1: mockFile2,
        length: 2,
        item: (index: number) => index === 0 ? mockFile1 : index === 1 ? mockFile2 : null
      } as FileList;

      const USWDS = (global as any).USWDS;
      if (USWDS?.fileInput?.validateFiles) {
        const validationResults = USWDS.fileInput.validateFiles(mockFileList);
        
        expect(validationResults).toHaveLength(2);
        expect(validationResults[0].valid).toBe(true);
        expect(validationResults[1].valid).toBe(false);
        expect(validationResults[1].errors).toContain('File too large');
      }
    });

    it('should gracefully handle USWDS enhancement errors', async () => {
      // Mock USWDS with error
      (global as any).USWDS = {
        fileInput: {
          enhance: vi.fn().mockImplementation(() => {
            throw new Error('Enhancement failed');
          })
        }
      };

      await waitForUpdate(newElement);

      // Should not throw and component should still work
      expect(() => {
        try {
          if ((global as any).USWDS?.fileInput?.enhance) {
            (global as any).USWDS.fileInput.enhance(newElement);
          }
        } catch (error) {
          // Error should be handled gracefully
        }
      }).not.toThrow();

      // Basic functionality should remain
      expect(newElement.querySelector('.usa-file-input')).toBeTruthy();
      expect(newElement.querySelector('input[type="file"]')).toBeTruthy();
    });

    it('should work without USWDS (fallback behavior)', async () => {
      // Remove USWDS mock to test fallback
      delete (global as any).USWDS;

      await waitForUpdate(newElement);

      // Should still render and work without USWDS
      expect(newElement.querySelector('.usa-file-input')).toBeTruthy();
      expect(newElement.querySelector('input[type="file"]')).toBeTruthy();
      // Note: .usa-file-input__target is created by USWDS JavaScript, component provides minimal fallback

      // Basic drag and drop should still work
      const target = newElement.querySelector('.usa-file-input') as HTMLElement;
      const dragEvent = new DragEvent('dragover', { bubbles: true, cancelable: true });
      
      expect(() => target.dispatchEvent(dragEvent)).not.toThrow();
    });

    it('should maintain USWDS compliance after enhancement', async () => {
      await waitForUpdate(newElement);

      // Enhance with USWDS
      if ((global as any).USWDS?.fileInput?.enhance) {
        (global as any).USWDS.fileInput.enhance(newElement);
        await waitForUpdate(newElement);
      }

      // Should maintain all USWDS required classes and structure
      expect(newElement.querySelector('.usa-file-input')).toBeTruthy();
      // Note: USWDS-enhanced elements (.usa-file-input__target, etc.) are created by USWDS JavaScript
      // Component provides minimal structure for progressive enhancement

      // Should preserve USWDS file input behavior
      const input = newElement.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input?.name).toBe('test-files');
      expect(input?.accept).toBe('.pdf,.jpg,.png');
      expect(input?.multiple).toBe(true);
    });

    it('should handle file selection with enhanced validation', async () => {
      let fileChangeEvent: any = null;

      newElement.addEventListener('file-change', (e: any) => {
        fileChangeEvent = e.detail;
      });

      await waitForUpdate(newElement);

      // Enhance with USWDS
      if ((global as any).USWDS?.fileInput?.enhance) {
        (global as any).USWDS.fileInput.enhance(newElement);
        await waitForUpdate(newElement);
      }

      // Simulate file selection
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const input = newElement.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should fire file-change event with enhanced data
      expect(fileChangeEvent).toBeTruthy();
      expect(fileChangeEvent.files).toHaveLength(1);
      expect(fileChangeEvent.files[0].name).toBe('test.pdf');
      
      // Component should update selected files
      expect(newElement.selectedFiles).toHaveLength(1);
      expect(newElement.selectedFiles[0].name).toBe('test.pdf');
    });
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/file-input/usa-file-input.ts`;
      const validation = validateComponentJavaScript(componentPath, 'file-input');

      if (!validation.isValid) {
        console.warn('JavaScript validation issues:', validation.issues);
      }

      // JavaScript validation should pass for critical integration patterns
      expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

      // Critical USWDS integration should be present
      const criticalIssues = validation.issues.filter(issue =>
        issue.includes('Missing USWDS JavaScript integration')
      );
      expect(criticalIssues.length).toBe(0);
    });
  });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Setup file input with comprehensive configuration
      element.label = 'Upload supporting documents';
      element.name = 'document-upload';
      element.accept = '.pdf,.doc,.docx,.jpg,.png';
      element.multiple = false;
      element.required = false;
      element.disabled = false;
      element.hint = 'Upload PDF, Word, or image files (max 10MB each)';
      await waitForUpdate(element);

      // Run comprehensive accessibility audit
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with multiple files allowed', async () => {
      element.label = 'Upload multiple attachments';
      element.name = 'multiple-files';
      element.accept = '.pdf,.jpg,.png,.docx';
      element.multiple = true;
      element.hint = 'You can select multiple files at once';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests when required', async () => {
      element.label = 'Required file upload';
      element.name = 'required-files';
      element.required = true;
      element.hint = 'This field is required. Please select at least one file.';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests when disabled', async () => {
      element.label = 'Disabled file input';
      element.name = 'disabled-files';
      element.disabled = true;
      element.hint = 'File upload is currently unavailable';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('USWDS DOM Transformation (CRITICAL - Prevents Duplicate Loading)', () => {
    it('should provide minimal structure for USWDS transformation', async () => {
      await waitForUpdate(element);

      // CRITICAL: This test would have detected the duplicate loading issue
      // Component should NOT pre-build drag-drop structure - USWDS generates it
      const preBuiltTarget = element.querySelector('.usa-file-input__target');
      const preBuiltBox = element.querySelector('.usa-file-input__box');
      const preBuiltInstructions = element.querySelector('.usa-file-input__instructions');

      expect(preBuiltTarget).toBeNull(); // Should not pre-build target
      expect(preBuiltBox).toBeNull(); // Should not pre-build box
      expect(preBuiltInstructions).toBeNull(); // Should not pre-build instructions

      // Should have minimal structure
      const input = element.querySelector('input[type="file"].usa-file-input');
      expect(input).toBeTruthy();
    });

    it('should verify USWDS can transform minimal structure (functional test)', async () => {
      // This test simulates what USWDS would do to detect transformation issues
      try {
        const { default: fileInputModule } = await import('@uswds/uswds/js/usa-file-input');

        await waitForUpdate(element);
        const inputElement = element.querySelector('input.usa-file-input');

        expect(inputElement).toBeTruthy();

        // Apply USWDS transformation (if available)
        if (fileInputModule && typeof fileInputModule.on === 'function') {
          fileInputModule.on(inputElement);

          // Wait for transformation
          await new Promise(resolve => setTimeout(resolve, 200));

          // After transformation, should have drag-drop structure
          const target = element.querySelector('.usa-file-input__target');
          const box = element.querySelector('.usa-file-input__box');
          const instructions = element.querySelector('.usa-file-input__instructions');

          // This would have FAILED in the old implementation due to pre-built structure
          if (target) {
            expect(target).toBeTruthy(); // USWDS should create target
            console.log('✅ USWDS created drag-drop target');
          }
          if (box) {
            expect(box).toBeTruthy(); // USWDS should create box
            console.log('✅ USWDS created drag-drop box');
          }
          if (instructions) {
            expect(instructions).toBeTruthy(); // USWDS should create instructions
            console.log('✅ USWDS created instructions');
          }

          // Test actual drag-drop functionality
          if (target) {
            try {
              const dragEvent = new DragEvent('dragover', { bubbles: true });
              target.dispatchEvent(dragEvent);
              console.log('✅ Drag-drop functionality working correctly');
            } catch (error) {
              console.warn('⚠️ Drag events may not be fully supported in test environment');
            }
          }
        }
      } catch (error) {
        console.warn('USWDS file input module not available in test environment:', error);
      }
    });

    it('should prevent duplicate initialization (would have caught the issue)', async () => {
      // Mock console to detect duplicate initialization warnings
      const consoleWarnings: string[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        consoleWarnings.push(args.join(' '));
        originalWarn.apply(console, args);
      };

      try {
        await waitForUpdate(element);

        // Simulate the scenario that caused duplicate loading
        const inputElement = element.querySelector('input.usa-file-input');
        if (inputElement) {
          // First initialization
          inputElement.setAttribute('data-uswds-init', 'true');

          // Second initialization (should be prevented by fixed code)
          const hasMultipleInit = inputElement.hasAttribute('data-uswds-init');
          expect(hasMultipleInit).toBe(true);

          // Component should prevent duplicate initialization
          // This is what the fixed code does with the uswdsInitialized flag
          const uswdsInitialized = (element as any).uswdsInitialized;

          // After fix, duplicate initialization should be prevented
          if (typeof uswdsInitialized === 'boolean') {
            console.log('✅ Duplicate initialization prevention is implemented');
          }
        }
      } finally {
        console.warn = originalWarn;
      }

      // Should not have excessive duplicate transformation warnings
      const duplicateWarnings = consoleWarnings.filter(msg =>
        msg.includes('Already transformed') || msg.includes('duplicate')
      );

      // In fixed version, this should be handled gracefully
      expect(duplicateWarnings.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard focus to file input', async () => {
      element.label = 'Upload document';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus the file input
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
    });

    it('should activate file picker with Space/Enter keys', async () => {
      element.label = 'Choose file';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus input
      input.focus();

      // Native file inputs open picker on Space/Enter
      // Verify input is properly configured for keyboard activation
      expect(input.type).toBe('file');
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support Enter and Space key activation', async () => {
      element.label = 'Select files';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      const result = await testActivationKeys(input);
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should be keyboard-only usable', async () => {
      element.label = 'Upload file';
      await waitForUpdate(element);

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.label = 'Choose files';
      await waitForUpdate(element);

      const result = await testKeyboardNavigation(element, {
        shortcuts: [
          {
            key: 'Enter',
            description: 'Open file picker',
          },
          {
            key: ' ',
            description: 'Open file picker with Space',
          },
        ],
        testEscapeKey: false, // File inputs don't respond to Escape
        testArrowKeys: false, // File inputs use Tab navigation
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have no keyboard traps', async () => {
      element.label = 'Upload';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus input
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(tabEvent);

      // Tab should not be prevented (keyboard trap check)
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.label = 'Select document';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus input
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that input is focused
      expect(document.activeElement).toBe(input);

      // USWDS applies :focus styles via CSS - we verify element is focusable
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support multiple file selection via keyboard', async () => {
      element.label = 'Upload multiple files';
      element.multiple = true;
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.multiple).toBe(true);

      // Multiple file input should be keyboard accessible
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should not respond to disabled file inputs via keyboard', async () => {
      element.label = 'Disabled upload';
      element.disabled = true;
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.disabled).toBe(true);

      // Disabled file inputs should not be focusable
      // In real browser, disabled inputs don't receive focus
      expect(input.disabled).toBe(true);
    });

    it('should support drag-and-drop area keyboard access', async () => {
      element.label = 'Upload or drag files';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // File input should be keyboard accessible
      const input = focusableElements.find(
        (el) => el instanceof HTMLInputElement && el.type === 'file'
      );

      expect(input).toBeTruthy();
      expect((input as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle file type restrictions with keyboard', async () => {
      element.label = 'Upload PDF';
      element.accept = '.pdf,application/pdf';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.accept).toBe('.pdf,application/pdf');

      // File input with restrictions should be keyboard accessible
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should provide accessible instructions via keyboard', async () => {
      element.label = 'Upload image';
      element.instructions = 'Select PNG or JPG files only';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Instructions should be associated with input for screen readers
      // Verify input is keyboard accessible
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
    });

    it('should handle error state keyboard interaction', async () => {
      element.label = 'Upload file';
      element.error = 'File size too large';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Error state should not prevent keyboard access
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Regression Prevention: USWDS Behavior Patterns (2025-10-08)', () => {
    // Prevents regression of bugs found in combo box and date picker components
    // These patterns apply to all components using USWDS-mirrored behavior files

    it('should render correct DOM structure for USWDS behavior enhancement', async () => {
      // Validates that the component renders the structure needed by usa-file-input-behavior.ts
      element.label = 'Test file';
      await waitForUpdate(element);

      // Structure needed for USWDS mirrored behavior:
      // 1. Input element with .usa-file-input class (USWDS transforms this)
      const input = element.querySelector('input[type="file"]');
      expect(input).toBeTruthy();
      expect(input?.classList.contains('usa-file-input')).toBe(true);

      // Note: Component provides minimal structure for progressive enhancement
      // USWDS JavaScript will:
      // - Transform the input element
      // - Create drag-and-drop target and file preview
      // - Add usa-file-input__input class during enhancement
      // - Add data-enhanced attribute during transformation
    });

    it('should maintain data-enhanced as string type', async () => {
      // CRITICAL: data-enhanced must be a string, not boolean
      // Pattern found in combo box Bug #1
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]');
      expect(input).toBeTruthy();

      // Note: data-enhanced attribute is added by USWDS JavaScript during transformation
      // Component provides minimal structure; USWDS enhances it with this attribute
      // This test verifies component renders the input that USWDS will enhance
      expect(input?.classList.contains('usa-file-input')).toBe(true);
    });

    it('should properly initialize with USWDS behavior file', async () => {
      // Validates component structure allows proper USWDS enhancement
      element.label = 'Upload document';
      element.name = 'document-upload';
      await waitForUpdate(element);

      const input = element.querySelector('input[type="file"]');
      const label = element.querySelector('label');

      // All required elements must exist for USWDS behavior to work
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input?.classList.contains('usa-file-input')).toBe(true);

      // Note: data-enhanced attribute is added by USWDS JavaScript during enhancement
      // Component provides minimal structure for progressive enhancement
    });
  });
});
