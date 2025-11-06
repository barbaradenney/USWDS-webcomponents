import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-multi-step-form-pattern.js';
import type { USAMultiStepFormPattern, FormStep } from './usa-multi-step-form-pattern.js';

describe('USAMultiStepFormPattern', () => {
  let pattern: USAMultiStepFormPattern;
  let container: HTMLDivElement;

  const mockSteps: FormStep[] = [
    { id: 'personal-info', label: 'Personal Information' },
    { id: 'address', label: 'Address' },
    { id: 'review', label: 'Review' },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    container?.remove();
    localStorage.clear();
  });

  describe('Pattern Initialization', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-MULTI-STEP-FORM-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.showNavigation).toBe(true);
      expect(pattern.backButtonLabel).toBe('Back');
      expect(pattern.nextButtonLabel).toBe('Next');
      expect(pattern.skipButtonLabel).toBe('Skip');
      expect(pattern.submitButtonLabel).toBe('Submit');
      expect(pattern.persistState).toBe(false);
      expect(pattern.storageKey).toBe('uswds-form-progress');
      expect(pattern.steps).toEqual(mockSteps);
    });

    it('should use Light DOM for USWDS style compatibility', () => {
      expect(pattern.shadowRoot).toBeNull();
    });

    it('should start on first step', () => {
      expect(pattern.getCurrentStepIndex()).toBe(0);
      expect(pattern.getCurrentStepData()).toEqual(mockSteps[0]);
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      newPattern.steps = mockSteps;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.currentStep).toBe(0);
      expect(event.detail.totalSteps).toBe(3);
      expect(event.detail.step).toEqual(mockSteps[0]);

      newPattern.remove();
    });
  });

  describe('Progress Display', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should display current step progress', () => {
      const progressText = pattern.querySelector('.text-base');
      expect(progressText?.textContent).toContain('Step 1 of 3');
      expect(progressText?.textContent).toContain('Personal Information');
    });

    it('should update progress text when navigating', async () => {
      pattern.goToStep(1);
      await pattern.updateComplete;

      const progressText = pattern.querySelector('.text-base');
      expect(progressText?.textContent).toContain('Step 2 of 3');
      expect(progressText?.textContent).toContain('Address');
    });
  });

  describe('Navigation Buttons', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show navigation buttons by default', () => {
      const buttonGroup = pattern.querySelector('.usa-button-group');
      expect(buttonGroup).toBeTruthy();
    });

    it('should hide navigation buttons when showNavigation is false', async () => {
      pattern.showNavigation = false;
      await pattern.updateComplete;

      const buttonGroup = pattern.querySelector('.usa-button-group');
      expect(buttonGroup).toBeNull();
    });

    it('should not show back button on first step', () => {
      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.includes('Back'));
      expect(backButton).toBeFalsy();
    });

    it('should show back button on non-first steps', async () => {
      pattern.goToStep(1);
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Back');
      expect(backButton).toBeTruthy();
    });

    it('should show Next button on non-final steps', () => {
      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Next');
      expect(nextButton).toBeTruthy();
    });

    it('should show Submit button on final step', async () => {
      pattern.goToStep(2);
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Submit');
      expect(submitButton).toBeTruthy();
    });

    it('should not show Skip button for required steps', () => {
      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Skip');
      expect(skipButton).toBeFalsy();
    });

    it('should show Skip button for optional steps', async () => {
      pattern.steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2', optional: true },
      ];
      pattern.goToStep(1);
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Skip');
      expect(skipButton).toBeTruthy();
    });

    it('should use custom button labels', async () => {
      pattern.backButtonLabel = 'Previous';
      pattern.nextButtonLabel = 'Continue';
      pattern.submitButtonLabel = 'Finish';
      pattern.goToStep(2);
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Previous');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Finish');

      expect(backButton).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });
  });

  describe('Next Navigation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should navigate to next step when clicking Next', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Next') as HTMLElement;
      nextButton?.click();

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(1);
      expect(event.detail.previousStep).toBe(0);
      expect(event.detail.direction).toBe('forward');
      expect(event.detail.step).toEqual(mockSteps[1]);
    });

    it('should validate step before proceeding', async () => {
      const validate = vi.fn().mockReturnValue(false);
      pattern.steps = [
        { id: 'step1', label: 'Step 1', validate },
        { id: 'step2', label: 'Step 2' },
      ];
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Next') as HTMLElement;
      nextButton?.click();

      await pattern.updateComplete;

      expect(validate).toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(0); // Should not advance
    });

    it('should proceed if validation passes', async () => {
      const validate = vi.fn().mockReturnValue(true);
      pattern.steps = [
        { id: 'step1', label: 'Step 1', validate },
        { id: 'step2', label: 'Step 2' },
      ];
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Next') as HTMLElement;
      nextButton?.click();

      await pattern.updateComplete;

      expect(validate).toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(1); // Should advance
    });

    it('should support async validation', async () => {
      const validate = vi.fn().mockResolvedValue(true);
      pattern.steps = [
        { id: 'step1', label: 'Step 1', validate },
        { id: 'step2', label: 'Step 2' },
      ];
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Next') as HTMLElement;
      nextButton?.click();

      await pattern.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50)); // Wait for async validation

      expect(validate).toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(1);
    });
  });

  describe('Back Navigation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
      // Navigate to second step
      pattern.goToStep(1);
      await pattern.updateComplete;
    });

    it('should navigate to previous step when clicking Back', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Back') as HTMLElement;
      backButton?.click();

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(0);
      expect(event.detail.previousStep).toBe(1);
      expect(event.detail.direction).toBe('back');
    });

    it('should not validate when going back', async () => {
      const validate = vi.fn();
      pattern.steps[1].validate = validate;

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Back') as HTMLElement;
      backButton?.click();

      await pattern.updateComplete;

      expect(validate).not.toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('Skip Navigation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2', optional: true },
        { id: 'step3', label: 'Step 3' },
      ];
      container.appendChild(pattern);
      await pattern.updateComplete;
      // Navigate to optional step
      pattern.goToStep(1);
      await pattern.updateComplete;
    });

    it('should skip optional step when clicking Skip', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Skip') as HTMLElement;
      skipButton?.click();

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(2);
      expect(event.detail.previousStep).toBe(1);
      expect(event.detail.direction).toBe('skip');
    });

    it('should not validate when skipping', async () => {
      const validate = vi.fn();
      pattern.steps[1].validate = validate;
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Skip') as HTMLElement;
      skipButton?.click();

      await pattern.updateComplete;

      expect(validate).not.toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(2);
    });
  });

  describe('Form Completion', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
      // Navigate to final step
      pattern.goToStep(2);
      await pattern.updateComplete;
    });

    it('should emit form-complete event when submitting final step', async () => {
      const completePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('form-complete', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Submit') as HTMLElement;
      submitButton?.click();

      const event = await completePromise;
      expect(event.detail.totalSteps).toBe(3);
    });

    it('should validate final step before completion', async () => {
      const validate = vi.fn().mockReturnValue(false);
      pattern.steps[2].validate = validate;
      await pattern.updateComplete;

      const completeListener = vi.fn();
      pattern.addEventListener('form-complete', completeListener);

      const buttons = pattern.querySelectorAll('usa-button');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Submit') as HTMLElement;
      submitButton?.click();

      await pattern.updateComplete;

      expect(validate).toHaveBeenCalled();
      expect(completeListener).not.toHaveBeenCalled();
    });

    it('should clear persisted state on completion', async () => {
      pattern.persistState = true;
      pattern.storageKey = 'test-form-progress';
      localStorage.setItem('test-form-progress', JSON.stringify({ stepIndex: 2 }));

      const buttons = pattern.querySelectorAll('usa-button');
      const submitButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Submit') as HTMLElement;
      submitButton?.click();

      await pattern.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(localStorage.getItem('test-form-progress')).toBeNull();
    });
  });

  describe('State Persistence', () => {
    it('should not persist state by default', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.storageKey = 'test-form-progress';
      container.appendChild(pattern);
      await pattern.updateComplete;

      pattern.goToStep(1);
      await pattern.updateComplete;

      expect(localStorage.getItem('test-form-progress')).toBeNull();

      pattern.remove();
    });

    it('should persist state when enabled', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      pattern.storageKey = 'test-form-progress';
      container.appendChild(pattern);
      await pattern.updateComplete;

      pattern.goToStep(1);
      await pattern.updateComplete;

      const stored = localStorage.getItem('test-form-progress');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.stepIndex).toBe(1);
      expect(data.timestamp).toBeDefined();

      pattern.remove();
    });

    it('should restore state from localStorage on init', async () => {
      localStorage.setItem(
        'uswds-form-progress',
        JSON.stringify({ stepIndex: 1, timestamp: Date.now() })
      );

      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(1);
    });

    it('should ignore invalid persisted state', async () => {
      localStorage.setItem('uswds-form-progress', 'invalid-json');

      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(0); // Should start at beginning
    });

    it('should clear persisted state via clearPersistedState()', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      pattern.storageKey = 'test-form-progress';
      container.appendChild(pattern);
      await pattern.updateComplete;

      pattern.goToStep(1);
      await pattern.updateComplete;

      expect(localStorage.getItem('test-form-progress')).toBeTruthy();

      pattern.clearPersistedState();

      expect(localStorage.getItem('test-form-progress')).toBeNull();
    });
  });

  describe('Public API', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
    });

    it('should set steps via setSteps()', async () => {
      const newSteps: FormStep[] = [
        { id: 'step-a', label: 'Step A' },
        { id: 'step-b', label: 'Step B' },
      ];

      pattern.setSteps(newSteps);
      await pattern.updateComplete;

      expect(pattern.steps).toEqual(newSteps);
      expect(pattern.getCurrentStepIndex()).toBe(0);
    });

    it('should reset to first step when setSteps makes current index invalid', async () => {
      pattern.goToStep(2);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(2);

      const newSteps: FormStep[] = [
        { id: 'step-a', label: 'Step A' },
      ];

      pattern.setSteps(newSteps);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(0);
    });

    it('should navigate to specific step via goToStep()', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      pattern.goToStep(2);

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(2);
      expect(event.detail.previousStep).toBe(0);
      expect(pattern.getCurrentStepIndex()).toBe(2);
    });

    it('should not navigate to invalid step index', () => {
      pattern.goToStep(-1);
      expect(pattern.getCurrentStepIndex()).toBe(0);

      pattern.goToStep(999);
      expect(pattern.getCurrentStepIndex()).toBe(0);
    });

    it('should get current step index via getCurrentStepIndex()', () => {
      expect(pattern.getCurrentStepIndex()).toBe(0);
      pattern.goToStep(1);
      expect(pattern.getCurrentStepIndex()).toBe(1);
    });

    it('should get current step data via getCurrentStepData()', () => {
      expect(pattern.getCurrentStepData()).toEqual(mockSteps[0]);
      pattern.goToStep(1);
      expect(pattern.getCurrentStepData()).toEqual(mockSteps[1]);
    });

    it('should reset to first step via reset()', async () => {
      pattern.goToStep(2);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(2);

      pattern.reset();
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('Slots', () => {
    it('should render step content via slots', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.innerHTML = `
        <div slot="step-personal-info"><h2>Personal Info Content</h2></div>
        <div slot="step-address"><h2>Address Content</h2></div>
        <div slot="step-review"><h2>Review Content</h2></div>
      `;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const stepContent = pattern.querySelector('div[slot="step-personal-info"]');
      expect(stepContent).toBeTruthy();
      expect(stepContent?.querySelector('h2')?.textContent).toBe('Personal Info Content');
    });

    it('should support custom progress slot', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.innerHTML = '<div slot="progress"><p>Custom Progress</p></div>';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const customProgress = pattern.querySelector('div[slot="progress"]');
      expect(customProgress).toBeTruthy();
      expect(customProgress?.querySelector('p')?.textContent).toBe('Custom Progress');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have descriptive button labels', () => {
      const buttons = pattern.querySelectorAll('usa-button');
      buttons.forEach((button) => {
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it('should disable buttons during validation', async () => {
      const validate = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );
      pattern.steps[0].validate = validate;
      await pattern.updateComplete;

      const nextButton = Array.from(pattern.querySelectorAll('usa-button')).find(
        (btn) => btn.textContent?.trim() === 'Next'
      ) as HTMLElement;

      nextButton?.click();

      // Buttons should be disabled during validation
      await pattern.updateComplete;
      const buttons = pattern.querySelectorAll('usa-button');
      buttons.forEach((button) => {
        expect(button.hasAttribute('disabled')).toBe(true);
      });

      // Wait for validation to complete
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  });
});
