/**
 * USWDS File Input Behavior
 *
 * Mirrors official USWDS file input JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-file-input/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { Sanitizer } from '@uswds-wc/core';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 6-30)
 */
const PREFIX = 'usa';
const DROPZONE_CLASS = `${PREFIX}-file-input`;
const DROPZONE = `.${DROPZONE_CLASS}`;
const INPUT_CLASS = `${PREFIX}-file-input__input`;
const TARGET_CLASS = `${PREFIX}-file-input__target`;
const INPUT = `.${INPUT_CLASS}`;
const BOX_CLASS = `${PREFIX}-file-input__box`;
const INSTRUCTIONS_CLASS = `${PREFIX}-file-input__instructions`;
const PREVIEW_CLASS = `${PREFIX}-file-input__preview`;
const PREVIEW_HEADING_CLASS = `${PREFIX}-file-input__preview-heading`;
const DISABLED_CLASS = `${PREFIX}-file-input--disabled`;
const CHOOSE_CLASS = `${PREFIX}-file-input__choose`;
const ACCEPTED_FILE_MESSAGE_CLASS = `${PREFIX}-file-input__accepted-files-message`;
const DRAG_TEXT_CLASS = `${PREFIX}-file-input__drag-text`;
const DRAG_CLASS = `${PREFIX}-file-input--drag`;
const LOADING_CLASS = 'is-loading';
const INVALID_FILE_CLASS = 'has-invalid-file';
const GENERIC_PREVIEW_CLASS_NAME = `${PREFIX}-file-input__preview-image`;
const GENERIC_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--generic`;
const PDF_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--pdf`;
const WORD_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--word`;
const VIDEO_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--video`;
const EXCEL_PREVIEW_CLASS = `${GENERIC_PREVIEW_CLASS_NAME}--excel`;
const SR_ONLY_CLASS = `${PREFIX}-sr-only`;
const SPACER_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const DEFAULT_ERROR_LABEL_TEXT = 'Error: This is not a valid file type.';

let TYPE_IS_VALID = Boolean(true); // logic gate for change listener
let DEFAULT_ARIA_LABEL_TEXT = '';
let DEFAULT_FILE_STATUS_TEXT = '';

/**
 * File input context interface
 */
interface FileInputContext {
  dropZoneEl: HTMLElement;
  inputEl: HTMLInputElement;
}

/**
 * Get an object of the properties and elements belonging directly to the given
 * file input component.
 *
 * SOURCE: index.js (Lines 47-61)
 *
 * @param el - The element within the file input
 * @returns Elements
 */
const getFileInputContext = (el: HTMLElement): FileInputContext => {
  const dropZoneEl = el.closest(DROPZONE) as HTMLElement;

  if (!dropZoneEl) {
    throw new Error(`Element is missing outer ${DROPZONE}`);
  }

  const inputEl = dropZoneEl.querySelector(INPUT) as HTMLInputElement;

  return {
    dropZoneEl,
    inputEl,
  };
};

/**
 * Disable the file input component
 *
 * SOURCE: index.js (Lines 68-73)
 *
 * @param el - An element within the file input component
 */
export const disable = (el: HTMLElement) => {
  const { dropZoneEl, inputEl } = getFileInputContext(el);

  inputEl.disabled = true;
  dropZoneEl.classList.add(DISABLED_CLASS);
};

/**
 * Set aria-disabled attribute to file input component
 *
 * SOURCE: index.js (Lines 80-84)
 *
 * @param el - An element within the file input component
 */
export const ariaDisable = (el: HTMLElement) => {
  const { dropZoneEl } = getFileInputContext(el);

  dropZoneEl.classList.add(DISABLED_CLASS);
};

/**
 * Enable the file input component
 *
 * SOURCE: index.js (Lines 91-97)
 *
 * @param el - An element within the file input component
 */
export const enable = (el: HTMLElement) => {
  const { dropZoneEl, inputEl } = getFileInputContext(el);

  inputEl.disabled = false;
  dropZoneEl.classList.remove(DISABLED_CLASS);
  dropZoneEl.removeAttribute('aria-disabled');
};

/**
 * Replace special characters
 *
 * SOURCE: index.js (Lines 104-109)
 *
 * @param s - Special characters
 * @returns Replaces specified values
 */
const replaceName = (s: string): string => {
  const c = s.charCodeAt(0);
  if (c === 32) return '-';
  if (c >= 65 && c <= 90) return `img_${s.toLowerCase()}`;
  return `__${('000' + c.toString(16)).slice(-4)}`;
};

/**
 * Creates an ID name for each file that strips all invalid characters.
 *
 * SOURCE: index.js (Lines 116-118)
 *
 * @param name - Name of the file added to file input
 * @returns Same characters as the name with invalid chars removed
 */
const makeSafeForID = (name: string): string => name.replace(/[^a-z0-9]/g, replaceName);

/**
 * Takes a generated safe ID and creates a unique ID.
 *
 * SOURCE: index.js (Lines 121-122)
 *
 * @param name - Safe ID name
 * @returns Unique ID with timestamp
 */
const createUniqueID = (name: string): string => `${name}-${Math.floor(Date.now() / 1000)}`;

/**
 * Determines if the singular or plural item label should be used
 * Determination is based on the presence of the `multiple` attribute
 *
 * SOURCE: index.js (Lines 129-135)
 *
 * @param fileInputEl - The input element
 * @returns The singular or plural version of "item"
 */
const getItemsLabel = (fileInputEl: HTMLInputElement): string => {
  const acceptsMultiple = fileInputEl.hasAttribute('multiple');
  const itemsLabel = acceptsMultiple ? 'files' : 'file';

  return itemsLabel;
};

/**
 * Scaffold the file input component with a parent wrapper and
 * Create a target area overlay for drag and drop functionality
 *
 * SOURCE: index.js (Lines 142-167)
 *
 * @param fileInputEl - The input element
 * @returns The drag and drop target area
 */
const createTargetArea = (fileInputEl: HTMLInputElement): HTMLElement => {
  const fileInputParent = document.createElement('div');
  const dropTarget = document.createElement('div');
  const box = document.createElement('div');

  // Adds class names and other attributes
  fileInputEl.classList.remove(DROPZONE_CLASS);
  fileInputEl.classList.add(INPUT_CLASS);
  fileInputParent.classList.add(DROPZONE_CLASS);
  box.classList.add(BOX_CLASS);
  dropTarget.classList.add(TARGET_CLASS);

  // Adds child elements to the DOM
  dropTarget.prepend(box);
  fileInputEl.parentNode!.insertBefore(dropTarget, fileInputEl);
  fileInputEl.parentNode!.insertBefore(fileInputParent, dropTarget);
  dropTarget.appendChild(fileInputEl);
  fileInputParent.appendChild(dropTarget);

  return dropTarget;
};

/**
 * Build the visible element with default interaction instructions.
 *
 * SOURCE: index.js (Lines 174-206)
 *
 * @param fileInputEl - The input element
 * @returns The container for visible interaction instructions
 */
const createVisibleInstructions = (fileInputEl: HTMLInputElement): HTMLElement => {
  const fileInputParent = fileInputEl.closest(DROPZONE) as HTMLElement;
  const itemsLabel = getItemsLabel(fileInputEl);
  const instructions = document.createElement('div');
  const dragText = `Drag ${itemsLabel} here or`;
  const chooseText = 'choose from folder';

  // Create instructions text for aria-label
  DEFAULT_ARIA_LABEL_TEXT = `${dragText} ${chooseText}`;

  // Adds class names and other attributes
  instructions.classList.add(INSTRUCTIONS_CLASS);
  instructions.setAttribute('aria-hidden', 'true');

  // Add initial instructions for input usage
  fileInputEl.setAttribute('aria-label', DEFAULT_ARIA_LABEL_TEXT);
  instructions.innerHTML = Sanitizer.escapeHTML`<span class="${DRAG_TEXT_CLASS}">${dragText}</span> <span class="${CHOOSE_CLASS}">${chooseText}</span>`;

  // Add the instructions element to the DOM
  fileInputEl.parentNode!.insertBefore(instructions, fileInputEl);

  // IE11 and Edge do not support drop files on file inputs, so we've removed text that indicates that
  if (/rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
    const dragTextEl = fileInputParent.querySelector(`.${DRAG_TEXT_CLASS}`);
    if (dragTextEl) {
      dragTextEl.outerHTML = '';
    }
  }

  return instructions;
};

/**
 * Build a screen reader-only message element that contains file status updates and
 * Create and set the default file status message
 *
 * SOURCE: index.js (Lines 213-229)
 *
 * @param fileInputEl - The input element
 */
const createSROnlyStatus = (fileInputEl: HTMLInputElement): void => {
  const statusEl = document.createElement('div');
  const itemsLabel = getItemsLabel(fileInputEl);
  const fileInputParent = fileInputEl.closest(DROPZONE) as HTMLElement;
  const fileInputTarget = fileInputEl.closest(`.${TARGET_CLASS}`) as HTMLElement;

  DEFAULT_FILE_STATUS_TEXT = `No ${itemsLabel} selected.`;

  // Adds class names and other attributes
  statusEl.classList.add(SR_ONLY_CLASS);
  statusEl.setAttribute('aria-live', 'polite');

  // Add initial file status message
  statusEl.textContent = DEFAULT_FILE_STATUS_TEXT;

  // Add the status element to the DOM
  fileInputParent.insertBefore(statusEl, fileInputTarget);
};

/**
 * Scaffold the component with all required elements
 *
 * SOURCE: index.js (Lines 236-250)
 *
 * @param fileInputEl - The original input element
 * @returns Instructions and drop target elements
 */
const enhanceFileInput = (
  fileInputEl: HTMLInputElement
): { instructions: HTMLElement; dropTarget: HTMLElement } => {
  const isInputDisabled =
    fileInputEl.hasAttribute('aria-disabled') || fileInputEl.hasAttribute('disabled');
  const dropTarget = createTargetArea(fileInputEl);
  const instructions = createVisibleInstructions(fileInputEl);
  const { dropZoneEl } = getFileInputContext(fileInputEl);

  if (isInputDisabled) {
    dropZoneEl.classList.add(DISABLED_CLASS);
  } else {
    createSROnlyStatus(fileInputEl);
  }

  return { instructions, dropTarget };
};

/**
 * Removes image previews
 * We want to start with a clean list every time files are added to the file input
 *
 * SOURCE: index.js (Lines 258-287)
 *
 * @param dropTarget - The drag and drop target area
 * @param instructions - The container for visible interaction instructions
 */
const removeOldPreviews = (dropTarget: HTMLElement, instructions: HTMLElement): void => {
  const filePreviews = dropTarget.querySelectorAll(`.${PREVIEW_CLASS}`);
  const currentPreviewHeading = dropTarget.querySelector(`.${PREVIEW_HEADING_CLASS}`);
  const currentErrorMessage = dropTarget.querySelector(`.${ACCEPTED_FILE_MESSAGE_CLASS}`);

  /**
   * finds the parent of the passed node and removes the child
   * @param node
   */
  const removeImages = (node: Element) => {
    node.parentNode!.removeChild(node);
  };

  // Remove the heading above the previews
  if (currentPreviewHeading) {
    currentPreviewHeading.outerHTML = '';
  }

  // Remove existing error messages
  if (currentErrorMessage) {
    currentErrorMessage.outerHTML = '';
    dropTarget.classList.remove(INVALID_FILE_CLASS);
  }

  // Get rid of existing previews if they exist, show instructions
  if (filePreviews !== null) {
    if (instructions) {
      instructions.removeAttribute('hidden');
    }
    Array.prototype.forEach.call(filePreviews, removeImages);
  }
};

/**
 * Update the screen reader-only status message after interaction
 *
 * SOURCE: index.js (Lines 295-311)
 *
 * @param statusElement - The screen reader-only container for file status updates
 * @param fileNames - The selected files found in the fileList object
 * @param fileStore - The array of uploaded file names created from the fileNames object
 */
const updateStatusMessage = (
  statusElement: HTMLElement,
  fileNames: FileList,
  fileStore: string[]
): void => {
  const statusEl = statusElement;
  let statusMessage = DEFAULT_FILE_STATUS_TEXT;

  // If files added, update the status message with file name(s)
  if (fileNames.length === 1) {
    statusMessage = `You have selected the file: ${fileStore}`;
  } else if (fileNames.length > 1) {
    statusMessage = `You have selected ${fileNames.length} files: ${fileStore.join(', ')}`;
  }

  // Add delay to encourage screen reader readout
  setTimeout(() => {
    statusEl.textContent = statusMessage;
  }, 1000);
};

/**
 * Show the preview heading, hide the initial instructions and
 * Update the aria-label with new instructions text
 *
 * SOURCE: index.js (Lines 318-342)
 *
 * @param fileInputEl - The input element
 * @param fileNames - The selected files found in the fileList object
 */
const addPreviewHeading = (fileInputEl: HTMLInputElement, fileNames: FileList): void => {
  const filePreviewsHeading = document.createElement('div');
  const dropTarget = fileInputEl.closest(`.${TARGET_CLASS}`) as HTMLElement;
  const instructions = dropTarget.querySelector(`.${INSTRUCTIONS_CLASS}`) as HTMLElement;
  let changeItemText = 'Change file';
  let previewHeadingText = '';

  if (fileNames.length === 1) {
    previewHeadingText = Sanitizer.escapeHTML`Selected file <span class="usa-file-input__choose">${changeItemText}</span>`;
  } else if (fileNames.length > 1) {
    changeItemText = 'Change files';
    previewHeadingText = Sanitizer.escapeHTML`${fileNames.length} files selected <span class="usa-file-input__choose">${changeItemText}</span>`;
  }

  // Hides null state content and sets preview heading
  instructions.setAttribute('hidden', 'true');
  filePreviewsHeading.classList.add(PREVIEW_HEADING_CLASS);
  filePreviewsHeading.innerHTML = previewHeadingText;
  dropTarget.insertBefore(filePreviewsHeading, instructions);

  // Update aria label to match the visible action text
  fileInputEl.setAttribute('aria-label', changeItemText);
};

/**
 * Add an error listener to the image preview to set a fallback image
 *
 * SOURCE: index.js (Lines 347-356)
 *
 * @param previewImage - The image element
 * @param fallbackClass - The CSS class of the fallback image
 */
const setPreviewFallback = (previewImage: HTMLImageElement, fallbackClass: string): void => {
  previewImage.addEventListener(
    'error',
    () => {
      const localPreviewImage = previewImage;
      localPreviewImage.src = SPACER_GIF;
      localPreviewImage.classList.add(fallbackClass);
    },
    { once: true }
  );
};

/**
 * When new files are applied to file input, this function generates previews
 * and removes old ones.
 *
 * SOURCE: index.js (Lines 364-426)
 *
 * @param e - Event
 * @param fileInputEl - The input element
 * @param instructions - The container for visible interaction instructions
 * @param dropTarget - The drag and drop target area
 */
const handleChange = (
  e: Event,
  fileInputEl: HTMLInputElement,
  instructions: HTMLElement,
  dropTarget: HTMLElement
): void => {
  const target = e.target as HTMLInputElement;
  const fileNames = target.files!;
  const inputParent = dropTarget.closest(`.${DROPZONE_CLASS}`) as HTMLElement;
  const statusElement = inputParent.querySelector(`.${SR_ONLY_CLASS}`) as HTMLElement;
  const fileStore: string[] = [];

  // First, get rid of existing previews
  removeOldPreviews(dropTarget, instructions);

  // Then, iterate through files list and create previews
  for (let i = 0; i < fileNames.length; i += 1) {
    const reader = new FileReader();
    const fileName = fileNames[i].name;
    let imageId: string;

    // Push updated file names into the store array
    fileStore.push(fileName);

    // Starts with a loading image while preview is created
    reader.onloadstart = function createLoadingImage() {
      imageId = createUniqueID(makeSafeForID(fileName));

      instructions.insertAdjacentHTML(
        'afterend',
        Sanitizer.escapeHTML`<div class="${PREVIEW_CLASS}" aria-hidden="true">
          <img id="${imageId}" src="${SPACER_GIF}" alt="" class="${GENERIC_PREVIEW_CLASS_NAME} ${LOADING_CLASS}"/>${fileName}
        <div>`
      );
    };

    // Not all files will be able to generate previews. In case this happens, we provide several types "generic previews" based on the file extension.
    reader.onloadend = function createFilePreview() {
      const previewImage = document.getElementById(imageId) as HTMLImageElement;
      const fileExtension = fileName.split('.').pop();
      if (fileExtension === 'pdf') {
        setPreviewFallback(previewImage, PDF_PREVIEW_CLASS);
      } else if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'pages') {
        setPreviewFallback(previewImage, WORD_PREVIEW_CLASS);
      } else if (
        fileExtension === 'xls' ||
        fileExtension === 'xlsx' ||
        fileExtension === 'numbers'
      ) {
        setPreviewFallback(previewImage, EXCEL_PREVIEW_CLASS);
      } else if (fileExtension === 'mov' || fileExtension === 'mp4') {
        setPreviewFallback(previewImage, VIDEO_PREVIEW_CLASS);
      } else {
        setPreviewFallback(previewImage, GENERIC_PREVIEW_CLASS);
      }

      // Removes loader and displays preview
      previewImage.classList.remove(LOADING_CLASS);
      previewImage.src = reader.result as string;
    };

    if (fileNames[i]) {
      reader.readAsDataURL(fileNames[i]);
    }
  }

  if (fileNames.length === 0) {
    // Reset input aria-label with default message
    fileInputEl.setAttribute('aria-label', DEFAULT_ARIA_LABEL_TEXT);
  } else {
    addPreviewHeading(fileInputEl, fileNames);
  }

  updateStatusMessage(statusElement, fileNames, fileStore);
};

/**
 * When using an Accept attribute, invalid files will be hidden from
 * file browser, but they can still be dragged to the input. This
 * function prevents them from being dragged and removes error states
 * when correct files are added.
 *
 * SOURCE: index.js (Lines 435-506)
 *
 * @param e - Event
 * @param fileInputEl - The input element
 * @param instructions - The container for visible interaction instructions
 * @param dropTarget - The drag and drop target area
 */
const preventInvalidFiles = (
  e: Event,
  fileInputEl: HTMLInputElement,
  instructions: HTMLElement,
  dropTarget: HTMLElement
): void => {
  const acceptedFilesAttr = fileInputEl.getAttribute('accept');
  dropTarget.classList.remove(INVALID_FILE_CLASS);

  /**
   * We can probably move away from this once IE11 support stops, and replace
   * with a simple es `.includes`
   * check if element is in array
   * check if 1 or more alphabets are in string
   * if element is present return the position value and -1 otherwise
   * @param file
   * @param value
   * @returns
   */
  const isIncluded = (file: string, value: string): boolean => {
    let returnValue = false;
    const pos = file.indexOf(value);
    if (pos >= 0) {
      returnValue = true;
    }
    return returnValue;
  };

  // Runs if only specific files are accepted
  if (acceptedFilesAttr) {
    const acceptedFiles = acceptedFilesAttr.split(',');
    const errorMessage = document.createElement('div');
    const userErrorText = fileInputEl.dataset.errormessage;
    const errorMessageText = userErrorText || DEFAULT_ERROR_LABEL_TEXT;

    errorMessage.setAttribute('aria-hidden', 'true');

    // If multiple files are dragged, this iterates through them and look for any files that are not accepted.
    let allFilesAllowed = true;
    const target = e.target as HTMLInputElement;
    const scannedFiles = target.files || (e as DragEvent).dataTransfer?.files || new FileList();
    for (let i = 0; i < scannedFiles.length; i += 1) {
      const file = scannedFiles[i];
      if (allFilesAllowed) {
        for (let j = 0; j < acceptedFiles.length; j += 1) {
          const fileType = acceptedFiles[j];
          allFilesAllowed =
            file.name.indexOf(fileType) > 0 || isIncluded(file.type, fileType.replace(/\*/g, ''));
          if (allFilesAllowed) {
            TYPE_IS_VALID = true;
            break;
          }
        }
      } else break;
    }

    // If dragged files are not accepted, this removes them from the value of the input and creates and error state
    if (!allFilesAllowed) {
      removeOldPreviews(dropTarget, instructions);
      fileInputEl.value = '';
      errorMessage.textContent = errorMessageText;
      dropTarget.insertBefore(errorMessage, fileInputEl);

      const ariaLabelText = `${errorMessageText} ${DEFAULT_ARIA_LABEL_TEXT}`;

      fileInputEl.setAttribute('aria-label', ariaLabelText);
      errorMessage.classList.add(ACCEPTED_FILE_MESSAGE_CLASS);
      dropTarget.classList.add(INVALID_FILE_CLASS);
      TYPE_IS_VALID = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }
};

/**
 * 1. passes through gate for preventing invalid files
 * 2. handles updates if file is valid
 *
 * SOURCE: index.js (Lines 514-519)
 *
 * @param event - Event
 * @param fileInputEl - The input element
 * @param instructions - The container for visible interaction instructions
 * @param dropTarget - The drag and drop target area
 */
const handleUpload = (
  event: Event,
  fileInputEl: HTMLInputElement,
  instructions: HTMLElement,
  dropTarget: HTMLElement
): void => {
  preventInvalidFiles(event, fileInputEl, instructions, dropTarget);
  if (TYPE_IS_VALID === true) {
    handleChange(event, fileInputEl, instructions, dropTarget);
  }
};

/**
 * Initialize file input behavior
 *
 * SOURCE: index.js (Lines 521-558)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeFileInput(root: HTMLElement | Document = document): () => void {
  const fileInputs = selectOrMatches(DROPZONE, root);
  const handlers = new Map<HTMLElement, any>();

  fileInputs.forEach((fileInputEl) => {
    const { instructions, dropTarget } = enhanceFileInput(fileInputEl as HTMLInputElement);

    const handleDragOver = function (this: HTMLElement) {
      this.classList.add(DRAG_CLASS);
    };

    const handleDragLeave = function (this: HTMLElement) {
      this.classList.remove(DRAG_CLASS);
    };

    const handleDrop = function (this: HTMLElement) {
      this.classList.remove(DRAG_CLASS);
    };

    const handleChangeEvent = (e: Event) =>
      handleUpload(e, fileInputEl as HTMLInputElement, instructions, dropTarget);

    dropTarget.addEventListener('dragover', handleDragOver, false);
    dropTarget.addEventListener('dragleave', handleDragLeave, false);
    dropTarget.addEventListener('drop', handleDrop, false);
    (fileInputEl as HTMLInputElement).addEventListener('change', handleChangeEvent, false);

    // Store handlers for cleanup
    handlers.set(fileInputEl as HTMLElement, {
      dropTarget,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleChangeEvent,
    });
  });

  return () => {
    fileInputs.forEach((fileInputEl) => {
      const handler = handlers.get(fileInputEl as HTMLElement);
      if (handler) {
        handler.dropTarget.removeEventListener('dragover', handler.handleDragOver, false);
        handler.dropTarget.removeEventListener('dragleave', handler.handleDragLeave, false);
        handler.dropTarget.removeEventListener('drop', handler.handleDrop, false);
        (fileInputEl as HTMLInputElement).removeEventListener(
          'change',
          handler.handleChangeEvent,
          false
        );
      }
    });
    handlers.clear();
  };
}

// Export functions needed by other components
export { getFileInputContext };
