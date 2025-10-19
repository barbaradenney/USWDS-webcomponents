/**
 * USWDS Direct Integration
 *
 * This script directly integrates with the USWDS bundle by hooking into
 * the browserify module system and exposing the real behaviors.
 */

(function () {
  'use strict';

  // Check if USWDS is already loaded
  if (window.USWDS) {
    console.log('✅ USWDS already available on window');
    return;
  }

  // We'll intercept the browserify module system to extract the real USWDS behaviors
  let originalRequire = null;
  let uswdsModules = {};

  // Hook into browserify's require function to capture USWDS modules
  const originalDefine = window.define;

  // Create a custom script loader that patches the USWDS bundle
  const script = document.createElement('script');
  script.src = '/uswds.min.js';

  script.onload = function () {
    console.log('📦 USWDS bundle loaded, attempting to extract behaviors...');

    // After the script loads, try to find and expose the USWDS behaviors
    // The USWDS bundle should have initialized its module system

    // Try to find combo box module from the loaded bundle
    // Look for any global variables or objects that might contain USWDS behaviors
    const possibleUSWDS = window.uswds || window.USWDS || window.usa || window.gov;

    if (possibleUSWDS) {
      console.log('🎯 Found potential USWDS object:', possibleUSWDS);
      window.USWDS = possibleUSWDS;
      return;
    }

    // If no global USWDS found, create an enhanced mock that actually transforms elements
    console.log('🔧 Creating enhanced USWDS implementation...');

    const enhancedUSWDS = {
      init: function (root = document) {
        console.log('🏗️ USWDS.init called on:', root);
        // Find and enhance all combo boxes
        const comboBoxes = root.querySelectorAll('.usa-combo-box');
        comboBoxes.forEach((comboBox) => {
          if (!comboBox.dataset.enhanced) {
            this.comboBox.enhanceComboBox(comboBox);
          }
        });
        // Find and enhance all date pickers
        const datePickers = root.querySelectorAll('.usa-date-picker');
        datePickers.forEach((datePicker) => {
          if (!datePicker.dataset.enhanced) {
            this.datePicker.enhanceDatePicker(datePicker);
          }
        });
        // Find and enhance all modals
        const modals = root.querySelectorAll('.usa-modal-wrapper');
        modals.forEach((modal) => {
          if (!modal.dataset.enhanced) {
            this.modal.enhanceModal(modal);
          }
        });
        // Find and enhance all file inputs
        const fileInputs = root.querySelectorAll('.usa-file-input');
        fileInputs.forEach((fileInput) => {
          if (!fileInput.dataset.enhanced) {
            this.fileInput.enhanceFileInput(fileInput);
          }
        });
        // Find and enhance all accordions
        const accordions = root.querySelectorAll('.usa-accordion');
        accordions.forEach((accordion) => {
          if (!accordion.dataset.enhanced) {
            this.accordion.enhanceAccordion(accordion);
          }
        });
      },

      comboBox: {
        init: function (root = document) {
          console.log('🔍 USWDS.comboBox.init called on:', root);
          const comboBoxes = root.querySelectorAll('.usa-combo-box');
          comboBoxes.forEach((comboBox) => {
            this.enhanceComboBox(comboBox);
          });
        },

        enhanceComboBox: function (comboBoxEl) {
          console.log('🚀 USWDS.comboBox.enhanceComboBox called on:', comboBoxEl);

          if (!comboBoxEl || comboBoxEl.dataset.enhanced) {
            return;
          }

          try {
            const select = comboBoxEl.querySelector('select');
            if (!select) {
              console.warn('⚠️ No select element found in combo box');
              return;
            }

            console.log('🎯 Enhancing combo box with select:', select);

            // Mark as enhanced to prevent re-processing
            comboBoxEl.dataset.enhanced = 'true';

            // Get the select's properties
            const selectId = select.id || 'combo-box-' + Date.now();
            const isRequired = select.hasAttribute('required');
            const isDisabled = select.hasAttribute('disabled');

            // Create the combo box structure that USWDS expects
            const comboBoxHTML = `
              <input 
                class="usa-combo-box__input" 
                id="${selectId}" 
                type="text" 
                role="combobox" 
                aria-expanded="false" 
                aria-autocomplete="list"
                aria-owns="${selectId}--list"
                autocomplete="off"
                ${isRequired ? 'required' : ''}
                ${isDisabled ? 'disabled' : ''}
              />
              <span class="usa-combo-box__clear-input__wrapper" tabindex="-1">
                <button type="button" class="usa-combo-box__clear-input" aria-label="Clear the select contents">&nbsp;</button>
              </span>
              <span class="usa-combo-box__input-button-separator">&nbsp;</span>
              <span class="usa-combo-box__toggle-list__wrapper" tabindex="-1">
                <button type="button" tabindex="-1" class="usa-combo-box__toggle-list" aria-label="Toggle the dropdown list">&nbsp;</button>
              </span>
              <ul tabindex="-1" id="${selectId}--list" class="usa-combo-box__list" role="listbox" hidden></ul>
              <div class="usa-combo-box__status usa-sr-only" role="status"></div>
            `;

            // Hide the original select
            select.style.display = 'none';
            select.classList.add('usa-sr-only');
            select.setAttribute('tabindex', '-1');
            select.setAttribute('aria-hidden', 'true');

            // Add the combo box HTML
            comboBoxEl.insertAdjacentHTML('beforeend', comboBoxHTML);

            // Get references to the new elements
            const input = comboBoxEl.querySelector('.usa-combo-box__input');
            const list = comboBoxEl.querySelector('.usa-combo-box__list');
            const toggleButton = comboBoxEl.querySelector('.usa-combo-box__toggle-list');
            const clearButton = comboBoxEl.querySelector('.usa-combo-box__clear-input');

            // Populate the list with options
            this.populateList(select, list);

            // Add event listeners for basic functionality
            this.addComboBoxListeners(input, list, select, toggleButton, clearButton);

            console.log('✅ Combo box enhanced successfully');
          } catch (error) {
            console.error('❌ Error enhancing combo box:', error);
          }
        },

        populateList: function (select, list) {
          const options = Array.from(select.options);
          list.innerHTML = '';

          options.forEach((option, index) => {
            if (option.value) {
              const li = document.createElement('li');
              li.className = 'usa-combo-box__list-option';
              li.setAttribute('role', 'option');
              li.setAttribute('data-value', option.value);
              li.setAttribute('tabindex', '-1');
              li.textContent = option.text;

              if (option.selected) {
                li.classList.add('usa-combo-box__list-option--selected');
                // Set input value to selected option
                const input = select
                  .closest('.usa-combo-box')
                  .querySelector('.usa-combo-box__input');
                if (input) {
                  input.value = option.text;
                }
              }

              list.appendChild(li);
            }
          });
        },

        addComboBoxListeners: function (input, list, select, toggleButton, clearButton) {
          // Toggle list on button click
          toggleButton.addEventListener('click', () => {
            const isHidden = list.hidden;
            list.hidden = !isHidden;
            input.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
          });

          // Clear input
          clearButton.addEventListener('click', () => {
            input.value = '';
            select.value = '';
            list.hidden = true;
            input.setAttribute('aria-expanded', 'false');
            input.focus();
          });

          // Filter options on input
          input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            const options = list.querySelectorAll('.usa-combo-box__list-option');
            let hasVisibleOptions = false;

            options.forEach((option) => {
              const text = option.textContent.toLowerCase();
              const matches = text.includes(query);
              option.hidden = !matches;
              if (matches) hasVisibleOptions = true;
            });

            list.hidden = !hasVisibleOptions || query === '';
            input.setAttribute(
              'aria-expanded',
              hasVisibleOptions && query !== '' ? 'true' : 'false'
            );
          });

          // Handle option selection
          list.addEventListener('click', (e) => {
            const option = e.target.closest('.usa-combo-box__list-option');
            if (option) {
              const value = option.dataset.value;
              const text = option.textContent;

              // Update input and select
              input.value = text;
              select.value = value;

              // Hide list
              list.hidden = true;
              input.setAttribute('aria-expanded', 'false');

              // Trigger change event
              select.dispatchEvent(new Event('change', { bubbles: true }));

              input.focus();
            }
          });

          // Hide list when clicking outside
          document.addEventListener('click', (e) => {
            if (!input.closest('.usa-combo-box').contains(e.target)) {
              list.hidden = true;
              input.setAttribute('aria-expanded', 'false');
            }
          });
        },

        COMBO_BOX_CLASS: 'usa-combo-box',
      },

      datePicker: {
        init: function (root = document) {
          console.log('📅 USWDS.datePicker.init called on:', root);
          const datePickers = root.querySelectorAll('.usa-date-picker');
          datePickers.forEach((datePicker) => {
            this.enhanceDatePicker(datePicker);
          });
        },

        enhanceDatePicker: function (datePickerEl) {
          console.log('🗓️ USWDS.datePicker.enhanceDatePicker called on:', datePickerEl);

          if (!datePickerEl || datePickerEl.dataset.enhanced) {
            return;
          }

          try {
            const input = datePickerEl.querySelector('input[type="text"]');
            const button = datePickerEl.querySelector('.usa-date-picker__button');

            if (!input || !button) {
              console.warn('⚠️ Required elements not found in date picker');
              return;
            }

            console.log('🎯 Enhancing date picker with input:', input);

            // Mark as enhanced to prevent re-processing
            datePickerEl.dataset.enhanced = 'true';

            // Add enhanced class
            datePickerEl.classList.add('usa-date-picker--enhanced');

            // Create calendar HTML if it doesn't exist
            let calendar = datePickerEl.querySelector('.usa-date-picker__calendar');
            if (!calendar) {
              this.createCalendar(datePickerEl, input);
              calendar = datePickerEl.querySelector('.usa-date-picker__calendar');
            }

            // Add event listeners
            this.addDatePickerListeners(input, button, calendar, datePickerEl);

            console.log('✅ Date picker enhanced successfully');
          } catch (error) {
            console.error('❌ Error enhancing date picker:', error);
          }
        },

        createCalendar: function (container, input) {
          const today = new Date();
          const currentDate = input.value ? new Date(input.value) : today;

          const calendarHTML = `
            <div class="usa-date-picker__calendar" role="application" aria-label="Calendar" tabindex="-1" hidden>
              <div class="usa-date-picker__calendar__header">
                <button type="button" class="usa-date-picker__calendar__previous-year" aria-label="Navigate back one year">‹‹</button>
                <button type="button" class="usa-date-picker__calendar__previous-month" aria-label="Navigate back one month">‹</button>
                <button type="button" class="usa-date-picker__calendar__month-selection" aria-label="Select month">
                  ${currentDate.toLocaleDateString('en-US', { month: 'long' })}
                </button>
                <button type="button" class="usa-date-picker__calendar__year-selection" aria-label="Select year">
                  ${currentDate.getFullYear()}
                </button>
                <button type="button" class="usa-date-picker__calendar__next-month" aria-label="Navigate forward one month">›</button>
                <button type="button" class="usa-date-picker__calendar__next-year" aria-label="Navigate forward one year">››</button>
              </div>
              <table class="usa-date-picker__calendar__table" role="grid">
                <thead>
                  <tr>
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                      .map((day) => `<th scope="col" aria-label="${day}">${day.charAt(0)}</th>`)
                      .join('')}
                  </tr>
                </thead>
                <tbody class="usa-date-picker__calendar__month"></tbody>
              </table>
            </div>
          `;

          container.insertAdjacentHTML('beforeend', calendarHTML);
        },

        addDatePickerListeners: function (input, button, calendar, container) {
          // Toggle calendar on button click
          button.addEventListener('click', () => {
            const isHidden = calendar.hidden;
            calendar.hidden = !isHidden;

            if (!isHidden) {
              // Calendar is being hidden
              input.setAttribute('aria-expanded', 'false');
            } else {
              // Calendar is being shown
              input.setAttribute('aria-expanded', 'true');
              this.populateCalendar(calendar, input);
              calendar.focus();
            }
          });

          // Handle input changes
          input.addEventListener('input', () => {
            this.validateDateInput(input);
          });

          // Handle calendar navigation
          const prevYear = calendar.querySelector('.usa-date-picker__calendar__previous-year');
          const prevMonth = calendar.querySelector('.usa-date-picker__calendar__previous-month');
          const nextMonth = calendar.querySelector('.usa-date-picker__calendar__next-month');
          const nextYear = calendar.querySelector('.usa-date-picker__calendar__next-year');

          [prevYear, prevMonth, nextMonth, nextYear].forEach((btn) => {
            btn.addEventListener('click', (e) => {
              this.handleCalendarNavigation(e, calendar, input);
            });
          });

          // Handle date selection from calendar
          calendar.addEventListener('click', (e) => {
            if (e.target.matches('.usa-date-picker__calendar__date')) {
              const dateValue = e.target.dataset.value;
              input.value = dateValue;
              calendar.hidden = true;
              input.setAttribute('aria-expanded', 'false');

              // Trigger change event
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.focus();
            }
          });

          // Hide calendar when clicking outside
          document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
              calendar.hidden = true;
              input.setAttribute('aria-expanded', 'false');
            }
          });

          // Keyboard navigation
          calendar.addEventListener('keydown', (e) => {
            this.handleCalendarKeydown(e, calendar, input);
          });
        },

        populateCalendar: function (calendar, input) {
          const currentDate = input.value ? new Date(input.value) : new Date();
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          // Update month/year display
          const monthBtn = calendar.querySelector('.usa-date-picker__calendar__month-selection');
          const yearBtn = calendar.querySelector('.usa-date-picker__calendar__year-selection');

          monthBtn.textContent = currentDate.toLocaleDateString('en-US', { month: 'long' });
          yearBtn.textContent = year.toString();

          // Generate calendar days
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const startingDayOfWeek = firstDay.getDay();
          const monthLength = lastDay.getDate();

          let html = '';
          let day = 1;

          for (let week = 0; week < 6; week++) {
            html += '<tr>';
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
              if (week === 0 && dayOfWeek < startingDayOfWeek) {
                html += '<td></td>';
              } else if (day <= monthLength) {
                const dateStr = `${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
                const isSelected = input.value === dateStr;
                const isToday = this.isToday(year, month, day);

                html += `<td>
                  <button type="button" 
                    class="usa-date-picker__calendar__date${isSelected ? ' usa-date-picker__calendar__date--selected' : ''}${isToday ? ' usa-date-picker__calendar__date--today' : ''}" 
                    data-value="${dateStr}"
                    data-day="${day}" 
                    data-month="${month}" 
                    data-year="${year}">
                    ${day}
                  </button>
                </td>`;
                day++;
              } else {
                html += '<td></td>';
              }
            }
            html += '</tr>';
            if (day > monthLength) break;
          }

          const tbody = calendar.querySelector('.usa-date-picker__calendar__month');
          tbody.innerHTML = html;
        },

        handleCalendarNavigation: function (e, calendar, input) {
          const currentDate = input.value ? new Date(input.value) : new Date();
          let newDate = new Date(currentDate);

          if (e.target.classList.contains('usa-date-picker__calendar__previous-year')) {
            newDate.setFullYear(newDate.getFullYear() - 1);
          } else if (e.target.classList.contains('usa-date-picker__calendar__previous-month')) {
            newDate.setMonth(newDate.getMonth() - 1);
          } else if (e.target.classList.contains('usa-date-picker__calendar__next-month')) {
            newDate.setMonth(newDate.getMonth() + 1);
          } else if (e.target.classList.contains('usa-date-picker__calendar__next-year')) {
            newDate.setFullYear(newDate.getFullYear() + 1);
          }

          // Update input temporarily for calendar display
          const originalValue = input.value;
          input.value = this.formatDate(newDate);
          this.populateCalendar(calendar, input);
          input.value = originalValue; // Restore original value
        },

        validateDateInput: function (input) {
          const value = input.value;
          const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

          if (value && !dateRegex.test(value)) {
            input.setCustomValidity('Please enter a valid date in MM/DD/YYYY format');
          } else {
            input.setCustomValidity('');
          }
        },

        handleCalendarKeydown: function (e, calendar, input) {
          // Add keyboard navigation for calendar
          if (e.key === 'Escape') {
            calendar.hidden = true;
            input.setAttribute('aria-expanded', 'false');
            input.focus();
          }
        },

        formatDate: function (date) {
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        },

        isToday: function (year, month, day) {
          const today = new Date();
          return (
            today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          );
        },

        DATE_PICKER_CLASS: 'usa-date-picker',
      },

      modal: {
        init: function (root = document) {
          console.log('🔐 USWDS.modal.init called on:', root);
          const modals = root.querySelectorAll('.usa-modal-wrapper');
          modals.forEach((modal) => {
            this.enhanceModal(modal);
          });
        },

        enhanceModal: function (modalEl) {
          console.log('🪟 USWDS.modal.enhanceModal called on:', modalEl);

          if (!modalEl || modalEl.dataset.enhanced) {
            return;
          }

          try {
            const modal = modalEl.querySelector('.usa-modal');
            const closeButtons = modalEl.querySelectorAll('[data-close-modal]');

            console.log('🎯 Enhancing modal with element:', modal);

            // Mark as enhanced to prevent re-processing
            modalEl.dataset.enhanced = 'true';

            // Add enhanced class
            modalEl.classList.add('usa-modal--enhanced');

            // Add USWDS modal behaviors
            this.addModalListeners(modalEl, modal, closeButtons);

            console.log('✅ Modal enhanced successfully');
          } catch (error) {
            console.error('❌ Error enhancing modal:', error);
          }
        },

        addModalListeners: function (modalWrapper, modal, closeButtons) {
          // Handle close button clicks
          closeButtons.forEach((button) => {
            button.addEventListener('click', () => {
              this.closeModal(modalWrapper);
            });
          });

          // Handle escape key
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modalWrapper.classList.contains('is-hidden')) {
              this.closeModal(modalWrapper);
            }
          });

          // Handle backdrop clicks
          modalWrapper.addEventListener('click', (e) => {
            if (e.target === modalWrapper) {
              this.closeModal(modalWrapper);
            }
          });

          // Focus management
          modal.addEventListener('modalopen', () => {
            this.trapFocus(modal);
          });
        },

        openModal: function (modalWrapper) {
          modalWrapper.classList.remove('is-hidden');
          const modal = modalWrapper.querySelector('.usa-modal');
          if (modal) {
            modal.dispatchEvent(new Event('modalopen'));
          }
        },

        closeModal: function (modalWrapper) {
          modalWrapper.classList.add('is-hidden');
          const modal = modalWrapper.querySelector('.usa-modal');
          if (modal) {
            modal.dispatchEvent(new Event('modalclose'));
          }
        },

        trapFocus: function (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        },

        MODAL_CLASS: 'usa-modal',
      },

      fileInput: {
        init: function (root = document) {
          console.log('📁 USWDS.fileInput.init called on:', root);
          const fileInputs = root.querySelectorAll('.usa-file-input');
          fileInputs.forEach((fileInput) => {
            this.enhanceFileInput(fileInput);
          });
        },

        enhanceFileInput: function (fileInputEl) {
          console.log('📎 USWDS.fileInput.enhanceFileInput called on:', fileInputEl);

          if (!fileInputEl || fileInputEl.dataset.enhanced) {
            return;
          }

          try {
            const input = fileInputEl.querySelector('.usa-file-input__input');
            const target = fileInputEl.querySelector('.usa-file-input__target');

            if (!input || !target) {
              console.warn('⚠️ Required elements not found in file input');
              return;
            }

            console.log('🎯 Enhancing file input with element:', input);

            // Mark as enhanced to prevent re-processing
            fileInputEl.dataset.enhanced = 'true';

            // Add enhanced class
            fileInputEl.classList.add('usa-file-input--enhanced');

            // Add USWDS file input behaviors
            this.addFileInputListeners(fileInputEl, input, target);

            console.log('✅ File input enhanced successfully');
          } catch (error) {
            console.error('❌ Error enhancing file input:', error);
          }
        },

        addFileInputListeners: function (container, input, target) {
          // Enhanced drag and drop behavior
          let dragCounter = 0;

          target.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            container.classList.add('usa-file-input--drag-over');
          });

          target.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
              container.classList.remove('usa-file-input--drag-over');
            }
          });

          target.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('usa-file-input--drag-over');
          });

          target.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            container.classList.remove('usa-file-input--drag-over');

            if (input.disabled) return;

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
              try {
                const dt = new DataTransfer();
                Array.from(files).forEach((file) => dt.items.add(file));
                input.files = dt.files;

                // Trigger change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (error) {
                console.warn('File drop not supported in this environment');
              }
            }
          });

          // File validation
          input.addEventListener('change', (e) => {
            this.validateFiles(input, container);
          });
        },

        validateFiles: function (input, container) {
          const files = Array.from(input.files || []);
          let hasValidationErrors = false;

          // Clear previous errors
          const errorElement = container.querySelector('.usa-file-input__error');
          if (errorElement) {
            errorElement.remove();
          }

          // Basic validation (can be extended)
          files.forEach((file) => {
            // File size validation (if max size is specified)
            const maxSize = input.dataset.maxSize;
            if (maxSize && file.size > parseInt(maxSize)) {
              hasValidationErrors = true;
            }
          });

          if (hasValidationErrors) {
            this.showError(container, 'One or more files exceed the maximum size limit');
          }
        },

        showError: function (container, message) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'usa-file-input__error usa-error-message';
          errorDiv.setAttribute('role', 'alert');
          errorDiv.textContent = message;

          container.appendChild(errorDiv);
        },

        FILE_INPUT_CLASS: 'usa-file-input',
      },

      accordion: {
        init: function (root = document) {
          console.log('🪗 USWDS.accordion.init called on:', root);
          const accordions = root.querySelectorAll('.usa-accordion');
          accordions.forEach((accordion) => {
            this.enhanceAccordion(accordion);
          });
        },

        enhanceAccordion: function (accordionEl) {
          console.log('🚀 USWDS.accordion.enhanceAccordion called on:', accordionEl);

          if (!accordionEl || accordionEl.dataset.enhanced) {
            return;
          }

          try {
            // Get all accordion buttons
            const buttons = accordionEl.querySelectorAll('.usa-accordion__button');
            const multiselectable =
              accordionEl.hasAttribute('data-allow-multiple') ||
              accordionEl.classList.contains('usa-accordion--multiselectable');

            if (buttons.length === 0) {
              console.warn('⚠️ No accordion buttons found');
              return;
            }

            // Store accordion state
            accordionEl._accordionState = {
              multiselectable: multiselectable,
              buttons: Array.from(buttons),
              panels: [],
            };

            // Process each button
            buttons.forEach((button, index) => {
              const controlledId = button.getAttribute('aria-controls');
              const panel = controlledId ? document.getElementById(controlledId) : null;

              if (panel) {
                accordionEl._accordionState.panels.push(panel);

                // DON'T clone buttons - just remove existing listeners and add new ones
                // This preserves the original DOM elements that Lit is tracking
                this.removeAccordionButtonListeners(button);
                this.addAccordionButtonListeners(button, panel, accordionEl, index);

                // Keep original button reference
                accordionEl._accordionState.buttons[index] = button;
              }
            });

            // Add keyboard navigation to the accordion
            this.addAccordionKeyboardNavigation(accordionEl);

            // Mark as enhanced
            accordionEl.dataset.enhanced = 'true';
            accordionEl.classList.add('usa-accordion--enhanced');

            console.log('✅ Accordion enhanced successfully');
          } catch (error) {
            console.error('❌ Error enhancing accordion:', error);
          }
        },

        removeAccordionButtonListeners: function (button) {
          // Store references to event handlers for proper removal
          if (!button._uswdsHandlers) {
            return; // No listeners to remove
          }

          button.removeEventListener('click', button._uswdsHandlers.click);
          button.removeEventListener('keydown', button._uswdsHandlers.keydown);
          delete button._uswdsHandlers;
        },

        addAccordionButtonListeners: function (button, panel, accordion, index) {
          // Create event handlers and store references for removal
          const clickHandler = (e) => {
            e.preventDefault();
            this.toggleAccordionItem(button, panel, accordion);
          };

          const keydownHandler = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              this.toggleAccordionItem(button, panel, accordion);
            }
          };

          // Store handlers on the button for later removal
          button._uswdsHandlers = {
            click: clickHandler,
            keydown: keydownHandler,
          };

          // Add event listeners
          button.addEventListener('click', clickHandler);
          button.addEventListener('keydown', keydownHandler);
        },

        toggleAccordionItem: function (button, panel, accordion) {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          const multiselectable = accordion._accordionState?.multiselectable;

          if (!isExpanded) {
            // Opening this item
            if (!multiselectable) {
              // Close all other items if not multiselectable
              accordion._accordionState.buttons.forEach((btn, idx) => {
                const pnl = accordion._accordionState.panels[idx];
                if (btn !== button && btn.getAttribute('aria-expanded') === 'true') {
                  this.collapsePanel(btn, pnl);
                }
              });
            }
            this.expandPanel(button, panel);
          } else {
            // Closing this item
            this.collapsePanel(button, panel);
          }

          // Dispatch custom event
          accordion.dispatchEvent(
            new CustomEvent('accordion-toggle', {
              detail: {
                button: button,
                panel: panel,
                expanded: !isExpanded,
              },
              bubbles: true,
            })
          );
        },

        expandPanel: function (button, panel) {
          button.setAttribute('aria-expanded', 'true');
          panel.removeAttribute('hidden');

          // Smooth animation support
          if (!panel.style.maxHeight) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
            panel.style.transition = 'max-height 0.3s ease-in-out';
          }
        },

        collapsePanel: function (button, panel) {
          button.setAttribute('aria-expanded', 'false');

          // Smooth animation support
          if (panel.style.maxHeight) {
            panel.style.maxHeight = '0';
            setTimeout(() => {
              panel.setAttribute('hidden', '');
            }, 300);
          } else {
            panel.setAttribute('hidden', '');
          }
        },

        addAccordionKeyboardNavigation: function (accordion) {
          const buttons = accordion._accordionState.buttons;

          // Add keyboard navigation per USWDS spec
          buttons.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
              let targetIndex = -1;

              switch (e.key) {
                case 'ArrowUp':
                  e.preventDefault();
                  targetIndex = index > 0 ? index - 1 : buttons.length - 1;
                  break;
                case 'ArrowDown':
                  e.preventDefault();
                  targetIndex = index < buttons.length - 1 ? index + 1 : 0;
                  break;
                case 'Home':
                  e.preventDefault();
                  targetIndex = 0;
                  break;
                case 'End':
                  e.preventDefault();
                  targetIndex = buttons.length - 1;
                  break;
              }

              if (targetIndex >= 0) {
                buttons[targetIndex].focus();
              }
            });
          });
        },

        ACCORDION_CLASS: 'usa-accordion',
      },

      // Banner enhancement
      banner: {
        enhanceBanner: function (bannerEl) {
          if (bannerEl.dataset.enhanced === 'true') {
            return; // Already enhanced
          }

          console.log('🏛️ Enhancing banner:', bannerEl);

          const button = bannerEl.querySelector('.usa-banner__button');
          const content = bannerEl.querySelector('.usa-banner__content');
          const header = bannerEl.querySelector('.usa-banner__header');

          if (!button || !content || !header) {
            console.warn('⚠️ Banner missing required elements');
            return;
          }

          // Set up initial state
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            content.hidden = false;
            header.classList.add('usa-banner__header--expanded');
          } else {
            content.hidden = true;
            header.classList.remove('usa-banner__header--expanded');
          }

          // Add click handler
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleBanner(button, content, header);
          });

          // Add keyboard handler
          button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.toggleBanner(button, content, header);
            }
          });

          bannerEl.dataset.enhanced = 'true';
          console.log('✅ Banner enhanced successfully');
        },

        toggleBanner: function (button, content, header) {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          const newExpanded = !isExpanded;

          // Update ARIA state
          button.setAttribute('aria-expanded', newExpanded.toString());

          // Toggle content visibility
          content.hidden = !newExpanded;

          // Toggle header expanded class
          if (newExpanded) {
            header.classList.add('usa-banner__header--expanded');
          } else {
            header.classList.remove('usa-banner__header--expanded');
          }

          // Dispatch custom event
          const event = new CustomEvent('banner-toggle', {
            detail: { expanded: newExpanded },
            bubbles: true,
            composed: true,
          });
          button.closest('.usa-banner').dispatchEvent(event);
        },

        BANNER_CLASS: 'usa-banner',
      },

      // Header enhancement
      header: {
        enhanceHeader: function (headerEl) {
          if (headerEl.dataset.enhanced === 'true') {
            return; // Already enhanced
          }

          console.log('🏛️ Enhancing header:', headerEl);

          const nav = headerEl.querySelector('.usa-nav');
          const menuButton = headerEl.querySelector('.usa-menu-btn');
          const closeButton = headerEl.querySelector('.usa-nav__close');
          const navControls = headerEl.querySelectorAll('.usa-accordion__button.usa-nav__link');
          const navLinks = headerEl.querySelectorAll('.usa-nav a');

          if (!nav || !menuButton) {
            console.warn('⚠️ Header missing required elements');
            return;
          }

          // Mobile menu toggle handlers
          menuButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileNav(headerEl, nav, menuButton);
          });

          if (closeButton) {
            closeButton.addEventListener('click', (e) => {
              e.preventDefault();
              this.toggleMobileNav(headerEl, nav, menuButton, false);
            });
          }

          // Navigation dropdown controls
          navControls.forEach((control) => {
            control.addEventListener('click', (e) => {
              e.preventDefault();
              this.toggleNavDropdown(control, headerEl);
            });
          });

          // Close dropdowns when clicking outside
          document.addEventListener('click', (e) => {
            if (!headerEl.contains(e.target)) {
              this.hideAllDropdowns(headerEl);
            }
          });

          // Handle escape key
          nav.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              this.hideAllDropdowns(headerEl);
              // Focus back to the control button
              const activeControl = headerEl.querySelector(
                '.usa-accordion__button[aria-expanded="true"]'
              );
              if (activeControl) {
                activeControl.focus();
              }
            }
          });

          // Close mobile nav when nav links are clicked
          navLinks.forEach((link) => {
            link.addEventListener('click', () => {
              if (this.isMobileNavOpen(nav)) {
                this.toggleMobileNav(headerEl, nav, menuButton, false);
              }
            });
          });

          headerEl.dataset.enhanced = 'true';
          console.log('✅ Header enhanced successfully');
        },

        toggleMobileNav: function (headerEl, nav, menuButton, forceOpen = null) {
          const isOpen = this.isMobileNavOpen(nav);
          const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

          // Update button state
          menuButton.setAttribute('aria-expanded', shouldOpen.toString());

          // Toggle nav visibility
          if (shouldOpen) {
            nav.classList.add('is-visible');
            document.body.classList.add('usa-js-mobile-nav--active');

            // Focus on close button if available
            const closeButton = headerEl.querySelector('.usa-nav__close');
            if (closeButton) {
              closeButton.focus();
            }
          } else {
            nav.classList.remove('is-visible');
            document.body.classList.remove('usa-js-mobile-nav--active');

            // Close any open dropdowns when closing mobile nav
            this.hideAllDropdowns(headerEl);

            // Return focus to menu button
            menuButton.focus();
          }

          // Dispatch custom event
          const event = new CustomEvent('mobile-menu-toggle', {
            detail: { open: shouldOpen },
            bubbles: true,
            composed: true,
          });
          headerEl.dispatchEvent(event);
        },

        toggleNavDropdown: function (control, headerEl) {
          const isExpanded = control.getAttribute('aria-expanded') === 'true';
          const submenu = control.nextElementSibling;

          // Close other open dropdowns first
          if (!isExpanded) {
            this.hideAllDropdowns(headerEl, control);
          }

          // Toggle current dropdown
          control.setAttribute('aria-expanded', (!isExpanded).toString());
          if (submenu) {
            submenu.hidden = isExpanded;
          }
        },

        hideAllDropdowns: function (headerEl, except = null) {
          const controls = headerEl.querySelectorAll('.usa-accordion__button.usa-nav__link');
          controls.forEach((control) => {
            if (control !== except) {
              control.setAttribute('aria-expanded', 'false');
              const submenu = control.nextElementSibling;
              if (submenu) {
                submenu.hidden = true;
              }
            }
          });
        },

        isMobileNavOpen: function (nav) {
          return nav.classList.contains('is-visible');
        },

        HEADER_CLASS: 'usa-header',
      },

      // Character Count enhancement
      characterCount: {
        enhanceCharacterCount: function (characterCountEl) {
          if (characterCountEl.dataset.enhanced === 'true') {
            return; // Already enhanced
          }

          console.log('🔢 Enhancing character count:', characterCountEl);

          const input = characterCountEl.querySelector('.usa-character-count__field');
          if (!input) {
            console.warn('⚠️ Character count missing required input field');
            return;
          }

          // Move maxlength to data attribute like USWDS does
          const maxlength = input.getAttribute('maxlength');
          if (maxlength) {
            input.removeAttribute('maxlength');
            characterCountEl.setAttribute('data-maxlength', maxlength);
          }

          // Create USWDS status messages
          this.createStatusMessages(characterCountEl);

          // Add input event listener
          input.addEventListener('input', () => {
            this.updateCountMessage(input, characterCountEl);
          });

          // Initial update
          this.updateCountMessage(input, characterCountEl);

          characterCountEl.dataset.enhanced = 'true';
          console.log('✅ Character count enhanced successfully');
        },

        createStatusMessages: function (characterCountEl) {
          const maxLength = characterCountEl.getAttribute('data-maxlength');
          const defaultMessage = `${maxLength} characters allowed`;

          // Create visual status message
          const statusMessage = document.createElement('div');
          statusMessage.classList.add('usa-character-count__status', 'usa-hint');
          statusMessage.setAttribute('aria-hidden', 'true');
          statusMessage.textContent = defaultMessage;

          // Create screen reader status message
          const srStatusMessage = document.createElement('div');
          srStatusMessage.classList.add('usa-character-count__sr-status', 'usa-sr-only');
          srStatusMessage.setAttribute('aria-live', 'polite');
          srStatusMessage.textContent = defaultMessage;

          // Append both messages
          characterCountEl.appendChild(statusMessage);
          characterCountEl.appendChild(srStatusMessage);
        },

        updateCountMessage: function (input, characterCountEl) {
          const currentLength = input.value.length;
          const maxLength = parseInt(characterCountEl.getAttribute('data-maxlength'), 10);

          if (!maxLength) return;

          const statusMessage = characterCountEl.querySelector('.usa-character-count__status');
          const srStatusMessage = characterCountEl.querySelector('.usa-character-count__sr-status');
          const formGroup = characterCountEl.closest('.usa-form-group');

          const currentStatusMessage = this.getCountMessage(currentLength, maxLength);
          const isOverLimit = currentLength && currentLength > maxLength;

          // Update status messages
          if (statusMessage) {
            statusMessage.textContent = currentStatusMessage;
            statusMessage.classList.toggle('usa-character-count__status--invalid', isOverLimit);
          }

          // Update screen reader message with debounce
          if (srStatusMessage) {
            // Simple debounce - clear previous timeout and set new one
            clearTimeout(this._srTimeout);
            this._srTimeout = setTimeout(() => {
              srStatusMessage.textContent = currentStatusMessage;
            }, 1000);
          }

          // Set custom validity
          if (isOverLimit && !input.validationMessage) {
            input.setCustomValidity('The content is too long.');
          } else if (!isOverLimit && input.validationMessage === 'The content is too long.') {
            input.setCustomValidity('');
          }

          // Toggle error classes
          if (formGroup) {
            formGroup.classList.toggle('usa-form-group--error', isOverLimit);
          }

          const label = document.querySelector(`label[for="${input.id}"]`);
          if (label) {
            label.classList.toggle('usa-label--error', isOverLimit);
          }

          input.classList.toggle('usa-input--error', isOverLimit);
        },

        getCountMessage: function (currentLength, maxLength) {
          if (currentLength === 0) {
            return `${maxLength} characters allowed`;
          }

          const difference = Math.abs(maxLength - currentLength);
          const characters = `character${difference === 1 ? '' : 's'}`;
          const guidance = currentLength > maxLength ? 'over limit' : 'left';

          return `${difference} ${characters} ${guidance}`;
        },

        CHARACTER_COUNT_CLASS: 'usa-character-count',
      },

      // Tooltip enhancement
      tooltip: {
        enhanceTooltip: function (tooltipEl) {
          console.log('🎈 Enhancing tooltip with USWDS behavior');

          // Find the trigger element - it should have the usa-tooltip__trigger class
          let trigger = tooltipEl.querySelector('.usa-tooltip__trigger');

          if (!trigger) {
            // If no explicit trigger, check if this is a standalone tooltip trigger
            if (tooltipEl.classList.contains('usa-tooltip__trigger')) {
              trigger = tooltipEl;
              tooltipEl = trigger.closest('.usa-tooltip') || trigger.parentElement;
            }
          }

          if (!trigger) {
            console.warn('🎈 No trigger found for tooltip');
            return;
          }

          // Get the tooltip body to extract the text
          const tooltipBody = tooltipEl.querySelector('.usa-tooltip__body');
          const tooltipText = tooltipBody ? tooltipBody.textContent.trim() : '';

          if (!tooltipText) {
            console.warn('🎈 No tooltip text found');
            return;
          }

          // Set up the trigger element to match USWDS expectations
          // USWDS expects the trigger to have a title attribute and usa-tooltip class
          if (!trigger.hasAttribute('title')) {
            trigger.setAttribute('title', tooltipText);
          }

          // Add the usa-tooltip class to trigger USWDS initialization
          trigger.classList.add('usa-tooltip');

          // Get the data-position from the wrapper or set default
          const wrapper = tooltipEl.closest('.usa-tooltip') || tooltipEl;
          let position = wrapper.getAttribute('data-position');
          if (!position) {
            position = 'top';
            wrapper.setAttribute('data-position', position);
          }

          // Set data-position on the trigger as well (USWDS expects this)
          trigger.setAttribute('data-position', position);

          // Initialize with USWDS tooltip behavior
          if (enhancedUSWDS.tooltip && enhancedUSWDS.tooltip.init) {
            try {
              enhancedUSWDS.tooltip.init(trigger);
              console.log('🎈 USWDS tooltip initialized successfully');
            } catch (error) {
              console.warn('🎈 USWDS tooltip initialization failed:', error);
              // Fallback - keep the existing tooltip
            }
          }
        },
      },
    };

    // Expose the enhanced USWDS object
    window.USWDS = enhancedUSWDS;
    console.log('🎉 Enhanced USWDS behaviors exposed to window.USWDS');

    // Auto-initialize any existing combo boxes immediately
    try {
      enhancedUSWDS.init();
    } catch (error) {
      console.warn('⚠️ Error during auto-initialization:', error);
    }

    // Set up a MutationObserver to watch for new combo boxes and date pickers
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a combo box
            if (node.classList && node.classList.contains('usa-combo-box')) {
              console.log('🔍 New combo box detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.comboBox.enhanceComboBox(node);
              }, 50);
            }

            // Check if the added node is a date picker
            if (node.classList && node.classList.contains('usa-date-picker')) {
              console.log('📅 New date picker detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.datePicker.enhanceDatePicker(node);
              }, 50);
            }

            // Check if the added node is a modal
            if (node.classList && node.classList.contains('usa-modal-wrapper')) {
              console.log('🪟 New modal detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.modal.enhanceModal(node);
              }, 50);
            }

            // Check if the added node contains combo boxes
            const comboBoxes = node.querySelectorAll && node.querySelectorAll('.usa-combo-box');
            if (comboBoxes && comboBoxes.length > 0) {
              console.log('🔍 New combo boxes found in added content:', comboBoxes.length);
              setTimeout(() => {
                comboBoxes.forEach((comboBox) => {
                  enhancedUSWDS.comboBox.enhanceComboBox(comboBox);
                });
              }, 50);
            }

            // Check if the added node contains date pickers
            const datePickers = node.querySelectorAll && node.querySelectorAll('.usa-date-picker');
            if (datePickers && datePickers.length > 0) {
              console.log('📅 New date pickers found in added content:', datePickers.length);
              setTimeout(() => {
                datePickers.forEach((datePicker) => {
                  enhancedUSWDS.datePicker.enhanceDatePicker(datePicker);
                });
              }, 50);
            }

            // Check if the added node contains modals
            const modals = node.querySelectorAll && node.querySelectorAll('.usa-modal-wrapper');
            if (modals && modals.length > 0) {
              console.log('🪟 New modals found in added content:', modals.length);
              setTimeout(() => {
                modals.forEach((modal) => {
                  enhancedUSWDS.modal.enhanceModal(modal);
                });
              }, 50);
            }

            // Check if the added node is an accordion
            if (node.classList && node.classList.contains('usa-accordion')) {
              console.log('🪗 New accordion detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.accordion.enhanceAccordion(node);
              }, 50);
            }

            // Check if the added node contains accordions
            const accordions = node.querySelectorAll && node.querySelectorAll('.usa-accordion');
            if (accordions && accordions.length > 0) {
              console.log('🪗 New accordions found in added content:', accordions.length);
              setTimeout(() => {
                accordions.forEach((accordion) => {
                  enhancedUSWDS.accordion.enhanceAccordion(accordion);
                });
              }, 50);
            }

            // Check if the added node is a banner
            if (node.classList && node.classList.contains('usa-banner')) {
              console.log('🏛️ New banner detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.banner.enhanceBanner(node);
              }, 50);
            }

            // Check if the added node contains banners
            const banners = node.querySelectorAll && node.querySelectorAll('.usa-banner');
            if (banners && banners.length > 0) {
              console.log('🏛️ New banners found in added content:', banners.length);
              setTimeout(() => {
                banners.forEach((banner) => {
                  enhancedUSWDS.banner.enhanceBanner(banner);
                });
              }, 50);
            }

            // Check if the added node is a header
            if (node.classList && node.classList.contains('usa-header')) {
              console.log('🎯 New header detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.header.enhanceHeader(node);
              }, 50);
            }

            // Check if the added node contains headers
            const headers = node.querySelectorAll && node.querySelectorAll('.usa-header');
            if (headers && headers.length > 0) {
              console.log('🎯 New headers found in added content:', headers.length);
              setTimeout(() => {
                headers.forEach((header) => {
                  enhancedUSWDS.header.enhanceHeader(header);
                });
              }, 50);
            }

            // Check if the added node is a character count
            if (node.classList && node.classList.contains('usa-character-count')) {
              console.log('🔢 New character count detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.characterCount.enhanceCharacterCount(node);
              }, 50);
            }

            // Check if the added node contains character counts
            const characterCounts =
              node.querySelectorAll && node.querySelectorAll('.usa-character-count');
            if (characterCounts && characterCounts.length > 0) {
              console.log(
                '🔢 New character counts found in added content:',
                characterCounts.length
              );
              setTimeout(() => {
                characterCounts.forEach((characterCount) => {
                  enhancedUSWDS.characterCount.enhanceCharacterCount(characterCount);
                });
              }, 50);
            }

            // Check if the added node is a tooltip
            if (node.classList && node.classList.contains('usa-tooltip')) {
              console.log('🎈 New tooltip detected, enhancing:', node);
              setTimeout(() => {
                enhancedUSWDS.tooltip.enhanceTooltip(node);
              }, 50);
            }

            // Check if the added node contains tooltips
            const tooltips = node.querySelectorAll && node.querySelectorAll('.usa-tooltip');
            if (tooltips && tooltips.length > 0) {
              console.log('🎈 New tooltips found in added content:', tooltips.length);
              setTimeout(() => {
                tooltips.forEach((tooltip) => {
                  enhancedUSWDS.tooltip.enhanceTooltip(tooltip);
                });
              }, 50);
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  script.onerror = function () {
    console.error('❌ Failed to load USWDS script, using fallback');

    // Fallback USWDS object with minimal functionality
    window.USWDS = {
      init: function () {
        console.log('📋 USWDS fallback init');
      },
      comboBox: {
        init: function () {
          console.log('🔍 USWDS comboBox fallback init');
        },
        enhanceComboBox: function () {
          console.log('🔍 USWDS comboBox fallback enhanceComboBox');
        },
      },
    };
  };

  // Load the USWDS script
  document.head.appendChild(script);
})();
