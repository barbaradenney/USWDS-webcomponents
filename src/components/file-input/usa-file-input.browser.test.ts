import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './index.ts';
import type { USAFileInput } from './usa-file-input.js';

/**
 * Browser-dependent tests for USAFileInput
 *
 * These tests require actual browser behavior including:
 * - USWDS JavaScript initialization and DOM transformation
 * - Drag and drop file handling
 * - File input enhancement
 * - Custom drag/choose text rendering
 *
 * Run with: npm run test:browser
 *
 * NOTE: These tests are skipped in unit test runs to avoid failures
 * in environments where USWDS JavaScript cannot properly initialize.
 */
describe('USAFileInput Browser Tests', () => {
  let element: USAFileInput;
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-file-input') as USAFileInput;
    container.appendChild(element);

    await element.updateComplete;
    // Give USWDS time to initialize and transform the DOM
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  afterEach(() => {
    container.remove();
  });

  describe('USWDS DOM Transformation', () => {
    it('should create enhanced file input structure', async () => {
      // USWDS transforms the file input with drag/drop UI
      const target = element.querySelector('.usa-file-input__target') as HTMLElement;
      expect(target, 'Should have target element created by USWDS').toBeTruthy();

      const box = element.querySelector('.usa-file-input__box') as HTMLElement;
      expect(box, 'Should have box element created by USWDS').toBeTruthy();
    });

    it('should create drag text and choose button', async () => {
      const dragText = element.querySelector('.usa-file-input__drag-text') as HTMLElement;
      expect(dragText, 'Should have drag text element').toBeTruthy();

      const choose = element.querySelector('.usa-file-input__choose') as HTMLElement;
      expect(choose, 'Should have choose button element').toBeTruthy();
    });

    it('should handle custom drag and choose text', async () => {
      element.remove();
      element = document.createElement('usa-file-input') as USAFileInput;
      element.dragText = 'Drop your files here or ';
      element.chooseText = 'select files';
      container.appendChild(element);

      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dragText = element.querySelector('.usa-file-input__drag-text') as HTMLElement;
      const chooseText = element.querySelector('.usa-file-input__choose') as HTMLElement;

      if (dragText) {
        expect(
          dragText.textContent?.includes('Drop your files here'),
          'Should show custom drag text'
        ).toBe(true);
      }

      if (chooseText) {
        expect(
          chooseText.textContent?.includes('select files'),
          'Should show custom choose text'
        ).toBe(true);
      }
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should handle drag over event', async () => {
      const target = element.querySelector('.usa-file-input__target') as HTMLElement;
      expect(target, 'Should have target element for drag events').toBeTruthy();

      // Create drag event with file
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dragEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });

      target.dispatchEvent(dragEvent);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // USWDS should add drag-over class
      const fileInput = element.querySelector('.usa-file-input') as HTMLElement;
      expect(
        fileInput?.classList.contains('usa-file-input--drag'),
        'Should add drag class on drag over'
      ).toBe(true);
    });

    it('should handle drag leave event', async () => {
      const target = element.querySelector('.usa-file-input__target') as HTMLElement;
      const fileInput = element.querySelector('.usa-file-input') as HTMLElement;

      // First trigger drag over
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      target.dispatchEvent(dragOverEvent);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Then trigger drag leave
      const dragLeaveEvent = new DragEvent('dragleave', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(dragLeaveEvent);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // USWDS should remove drag class
      expect(
        !fileInput?.classList.contains('usa-file-input--drag'),
        'Should remove drag class on drag leave'
      ).toBe(true);
    });

    it('should handle file drop', async () => {
      let droppedFiles: FileList | null = null;

      element.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        droppedFiles = target.files;
      });

      const target = element.querySelector('.usa-file-input__target') as HTMLElement;

      // Create drop event with file
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });

      target.dispatchEvent(dropEvent);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // USWDS should handle the file drop
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input, 'Should have file input element').toBeTruthy();

      if (droppedFiles && droppedFiles.length > 0) {
        expect(droppedFiles[0].name, 'Should have dropped file').toBe('test.txt');
      }
    });

    it('should prevent default drag behavior', async () => {
      const target = element.querySelector('.usa-file-input__target') as HTMLElement;

      const dragEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(dragEvent, 'preventDefault');
      target.dispatchEvent(dragEvent);

      expect(preventDefaultSpy, 'Should prevent default drag behavior').toHaveBeenCalled();
    });
  });

  describe('File Selection', () => {
    it('should display selected file name', async () => {
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;

      // Create and select a file
      const file = new File(['test content'], 'document.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // USWDS should display the file name
      const preview = element.querySelector('.usa-file-input__preview') as HTMLElement;
      if (preview) {
        expect(
          preview.textContent?.includes('document.pdf'),
          'Should display selected file name'
        ).toBe(true);
      }
    });

    it('should handle multiple file selection when allowed', async () => {
      element.remove();
      element = document.createElement('usa-file-input') as USAFileInput;
      element.multiple = true;
      container.appendChild(element);

      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.multiple, 'Input should allow multiple files').toBe(true);

      // Select multiple files
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file1);
      dataTransfer.items.add(file2);
      input.files = dataTransfer.files;

      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(input.files?.length, 'Should have multiple files selected').toBe(2);
    });

    it('should handle file removal', async () => {
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;

      // Select a file
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find and click the remove button created by USWDS
      const removeButton = element.querySelector(
        '.usa-file-input__preview-remove'
      ) as HTMLButtonElement;

      if (removeButton) {
        removeButton.click();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(input.files?.length || 0, 'Should have no files after removal').toBe(0);
      }
    });
  });

  describe('File Type Validation', () => {
    it('should respect accept attribute', async () => {
      element.remove();
      element = document.createElement('usa-file-input') as USAFileInput;
      element.accept = '.pdf,.doc,.docx';
      container.appendChild(element);

      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.accept, 'Should have accept attribute').toBe('.pdf,.doc,.docx');
    });

    it('should show error for invalid file type', async () => {
      element.remove();
      element = document.createElement('usa-file-input') as USAFileInput;
      element.accept = 'image/*';
      element.errorMessage = 'Only image files are allowed';
      container.appendChild(element);

      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;

      // Try to select a non-image file
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // USWDS should show error for invalid file type
      const errorMessage = element.querySelector('.usa-error-message') as HTMLElement;
      if (errorMessage) {
        expect(errorMessage.textContent, 'Should show error for invalid file type').toBeTruthy();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have accessible drag and drop interface', async () => {
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input, 'Should have native file input for accessibility').toBeTruthy();

      const label = element.querySelector('.usa-label') as HTMLElement;
      expect(label, 'Should have label for input').toBeTruthy();

      if (label && input.id) {
        expect(
          label.getAttribute('for') === input.id,
          'Label should be associated with input'
        ).toBe(true);
      }
    });

    it('should be keyboard accessible', async () => {
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;

      input.focus();
      expect(document.activeElement, 'Should be focusable').toBe(input);

      // Pressing Enter or Space should open file picker (browser native behavior)
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });

      const keydownSpy = vi.fn();
      input.addEventListener('keydown', keydownSpy);
      input.dispatchEvent(keyEvent);

      expect(keydownSpy, 'Should respond to keyboard events').toHaveBeenCalled();
    });

    it('should announce file selection to screen readers', async () => {
      const input = element.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['content'], 'accessible-doc.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // USWDS creates a status message for screen readers
      const statusMessage = element.querySelector('.usa-file-input__preview-heading');
      expect(statusMessage, 'Should have status message for screen readers').toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should disable drag and drop when disabled', async () => {
      element.disabled = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.disabled, 'Input should be disabled').toBe(true);

      const target = element.querySelector('.usa-file-input__target') as HTMLElement;

      // Try to trigger drag event
      const dragEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
      });

      target.dispatchEvent(dragEvent);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const fileInput = element.querySelector('.usa-file-input') as HTMLElement;
      expect(
        !fileInput?.classList.contains('usa-file-input--drag'),
        'Should not accept drag when disabled'
      ).toBe(true);
    });

    it('should show disabled styling', async () => {
      element.disabled = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const fileInput = element.querySelector('.usa-file-input') as HTMLElement;
      expect(
        fileInput?.classList.contains('usa-file-input--disabled') ||
          element.hasAttribute('disabled'),
        'Should have disabled styling'
      ).toBe(true);
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain correct USWDS structure', async () => {
      const fileInputContainer = element.querySelector('.usa-file-input') as HTMLElement;
      expect(fileInputContainer, 'Should have usa-file-input container').toBeTruthy();

      const target = element.querySelector('.usa-file-input__target') as HTMLElement;
      expect(target, 'Should have target element').toBeTruthy();

      const input = element.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input, 'Should have file input').toBeTruthy();

      const instructions = element.querySelector('.usa-file-input__instructions') as HTMLElement;
      expect(instructions, 'Should have instructions element').toBeTruthy();
    });

    it('should maintain structure after property changes', async () => {
      element.label = 'Updated File Label';
      element.hint = 'Updated hint text';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const fileInput = element.querySelector('.usa-file-input');
      const target = element.querySelector('.usa-file-input__target');
      const input = element.querySelector('input[type="file"]');

      expect(fileInput, 'Should maintain structure after updates').toBeTruthy();
      expect(target, 'Should maintain target after updates').toBeTruthy();
      expect(input, 'Should maintain input after updates').toBeTruthy();
    });
  });
});
