import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { USAFileInput } from './usa-file-input.js';

const meta: Meta<USAFileInput> = {
  title: 'Forms/File Input',
  component: 'usa-file-input',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA File Input

The USA File Input component provides accessible file upload functionality with drag-and-drop support using official USWDS styling.
This component allows users to select files through a traditional file browser or by dragging files directly onto the input area.

## Features
- Drag and drop file upload
- Multiple file selection support
- File type restrictions with accept attribute
- File size display and formatting
- Individual file removal
- Form validation integration
- ARIA attributes for screen readers
- Visual feedback for drag states

## Usage Guidelines

- Use for file upload functionality
- Provide clear labels indicating what files are expected
- Consider file size and type restrictions
- Use hints to clarify upload requirements
- Test drag and drop functionality across browsers
- Ensure keyboard accessibility for file removal

## Accessibility

- File input is keyboard accessible
- Labels are properly associated with inputs
- File removal buttons have descriptive aria-labels
- Helper text is connected via aria-describedby
- Drag states provide visual feedback
- Screen reader announcements for file operations
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the file input',
    },
    hint: {
      control: { type: 'text' },
      description: 'Helper text shown below the label',
    },
    name: {
      control: { type: 'text' },
      description: 'Name attribute for form submission',
    },
    inputId: {
      control: { type: 'text' },
      description: 'ID for the input element',
    },
    multiple: {
      control: { type: 'boolean' },
      description: 'Whether multiple files can be selected',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the file input is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the file input is required',
    },
    accept: {
      control: { type: 'text' },
      description: 'File types that can be accepted (e.g., .pdf,.doc,.docx)',
    },
    maxFileSize: {
      control: { type: 'text' },
      description: 'Maximum file size allowed',
    },
  },
  args: {
    label: 'Select file',
    hint: '',
    name: 'file-input',
    inputId: 'file-input',
    multiple: false,
    disabled: false,
    required: false,
    accept: '',
    maxFileSize: '',
  },
};

export default meta;
type Story = StoryObj<USAFileInput>;

export const Default: Story = {
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const WithHelperText: Story = {
  args: {
    label: 'Upload Document',
    hint: 'Select a PDF, Word document, or image file',
  },
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const MultipleFiles: Story = {
  args: {
    label: 'Upload Images',
    hint: 'You can select multiple image files at once',
    multiple: true,
    accept: '.jpg,.jpeg,.png,.gif,.webp',
  },
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const Required: Story = {
  args: {
    label: 'Required Document',
    hint: 'This field is required',
    required: true,
  },
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const WithFileTypeRestrictions: Story = {
  args: {
    label: 'Upload Resume',
    hint: 'Only PDF and Word documents are accepted',
    accept: '.pdf,.doc,.docx',
  },
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled File Input',
    hint: 'This field is currently disabled',
    disabled: true,
  },
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const CustomText: Story = {
  args: {
    label: 'Custom Upload Area',
    hint: 'Customized drag and drop text',
  },
  render: (args) => html`
    <usa-file-input
      label="${args.label}"
      hint="${args.hint}"
      name="${args.name}"
      inputId="${args.inputId}"
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
      ?required=${args.required}
      accept="${args.accept}"
      maxFileSize="${args.maxFileSize}"
    ></usa-file-input>
  `,
};

export const FormExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <form
      class="maxw-tablet"
      @submit=${(e: CustomEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        console.log('Form data:', formData);

        // Log file information
        const files = formData.getAll('document');
        files.forEach((file, index) => {
          if (file instanceof File) {
            console.log(`File ${index + 1}:`, {
              name: file.name,
              size: file.size,
              type: file.type,
            });
          }
        });

        alert('Form submitted! Check console for file data.');
      }}
    >
      <usa-file-input
        name="document"
        label="Primary Document"
        hint="Upload your main document (PDF preferred)"
        accept=".pdf,.doc,.docx"
        required
      ></usa-file-input>

      <usa-file-input
        name="attachments"
        label="Additional Files"
        hint="Upload any supporting documents"
        multiple
        class="margin-top-2"
      ></usa-file-input>

      <div class="margin-top-3">
        <usa-button type="submit">Submit Files</usa-button>
      </div>
    </form>
  `,
};

export const ValidationStates: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-1 maxw-tablet">
      <usa-file-input label="Default state" hint="No validation applied"></usa-file-input>

      <usa-file-input
        label="Required field"
        required
        hint="This field is required"
      ></usa-file-input>

      <usa-file-input
        label="With file type restrictions"
        hint="Only images are allowed"
        accept=".jpg,.jpeg,.png,.gif,.webp"
      ></usa-file-input>

      <usa-file-input
        label="Multiple files allowed"
        hint="Select up to 5 files"
        multiple
        accept=".pdf,.doc,.docx,.txt"
      ></usa-file-input>
    </div>
  `,
};

export const AccessibilityFeatures: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Accessibility Features Demo</h3>
      <p>This demo shows various accessibility features of the file input component.</p>

      <usa-file-input
        id="accessible-file-input"
        name="accessibleExample"
        label="Accessible file input with all features"
        hint="This helper text is connected via aria-describedby"
        required
        accept=".pdf,.doc,.docx"
        dragText="Drop your document here or "
        chooseText="select from computer"
      ></usa-file-input>

      <div class="margin-top-1 padding-1 bg-base-lightest radius-md">
        <h4>Features demonstrated:</h4>
        <ul>
          <li>Label properly associated with input</li>
          <li>Helper text connected via aria-describedby</li>
          <li>Required field marked with asterisk</li>
          <li>File type restrictions via accept attribute</li>
          <li>Drag and drop with visual feedback</li>
          <li>Keyboard accessible file selection</li>
          <li>Screen reader compatible structure</li>
          <li>Individual file removal with descriptive labels</li>
        </ul>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet-lg">
      <h3>Interactive File Input Demo</h3>
      <p>Try uploading files by clicking the input area or dragging files onto it.</p>

      <usa-file-input
        label="Upload Files"
        hint="Select files or drag them onto this area"
        multiple
        @file-change=${(e: CustomEvent) => {
          console.log('Files selected:', e.detail);
          const output = document.getElementById('file-output');
          if (output) {
            const fileList = e.detail.files
              .map(
                (file: File) => `• ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type})`
              )
              .join('\\n');
            output.textContent = fileList || 'No files selected';
          }
        }}
        @file-remove=${(e: CustomEvent) => {
          console.log('File removed:', e.detail);
          const status = document.getElementById('remove-status');
          if (status) {
            status.textContent = `Removed: ${e.detail.file.name} (index ${e.detail.index})`;
            setTimeout(() => {
              if (status) status.textContent = '';
            }, 3000);
          }
        }}
      ></usa-file-input>

      <div class="margin-top-1 padding-1 bg-info-lighter radius-md">
        <h4>Selected Files:</h4>
        <pre id="file-output" class="text-pre-line margin-0">No files selected</pre>
        <p id="remove-status" class="text-secondary-dark margin-top-05 minh-3"></p>
      </div>

      <div class="margin-top-2">
        <h4>Try these actions:</h4>
        <ul>
          <li>Click the file input area to browse for files</li>
          <li>Drag files from your computer onto the input area</li>
          <li>Select multiple files to see the preview list</li>
          <li>Use the "Remove" button to delete individual files</li>
          <li>Check the browser console for detailed event information</li>
        </ul>
      </div>
    </div>
  `,
};

export const DragAndDropDemo: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Drag and Drop Functionality</h3>
      <p>This demo highlights the drag and drop capabilities with visual feedback.</p>

      <usa-file-input
        label="Drag &amp; Drop Zone"
        hint="Drag files directly onto this area or click to browse"
        multiple
        dragText="Drop files here or "
        chooseText="click to browse"
      ></usa-file-input>

      <div class="margin-top-1 padding-1 bg-warning-lighter radius-md">
        <h4>Drag and Drop Features:</h4>
        <ul>
          <li>
            <strong>Visual feedback</strong>: The input area changes appearance when files are
            dragged over it
          </li>
          <li><strong>Multiple files</strong>: Drop multiple files at once for bulk selection</li>
          <li>
            <strong>File validation</strong>: Only accepted file types will be processed (if accept
            attribute is set)
          </li>
          <li>
            <strong>Disabled state</strong>: Drag and drop is ignored when the input is disabled
          </li>
          <li><strong>Custom text</strong>: The drag instructions can be customized</li>
        </ul>
      </div>

      <style>
        .usa-file-input--drag-over {
          background-color: #e7f3ff;
          border-color: #0066cc;
        }
      </style>
    </div>
  `,
};

export const FileTypeExamples: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-205 maxw-tablet-lg">
      <h3>File Type Restriction Examples</h3>

      <usa-file-input
        label="Images Only"
        hint="Accept common image formats"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        multiple
      ></usa-file-input>

      <usa-file-input
        label="Documents Only"
        hint="Accept PDF and Office documents"
        accept=".pdf,.doc,.docx,.txt,.rtf"
        multiple
      ></usa-file-input>

      <usa-file-input
        label="Spreadsheets"
        hint="Accept Excel and CSV files"
        accept=".xlsx,.xls,.csv"
      ></usa-file-input>

      <usa-file-input
        label="Audio Files"
        hint="Accept common audio formats"
        accept=".mp3,.wav,.ogg,.m4a"
        multiple
      ></usa-file-input>

      <usa-file-input
        label="Video Files"
        hint="Accept common video formats"
        accept=".mp4,.avi,.mov,.wmv,.webm"
      ></usa-file-input>

      <div class="padding-2 bg-base-lightest radius-md">
        <h4>File Type Notes:</h4>
        <ul>
          <li>The <code>accept</code> attribute filters the file browser dialog</li>
          <li>Users can still bypass restrictions in most browsers</li>
          <li>Always validate file types on the server side</li>
          <li>Consider using MIME types for more precise filtering</li>
          <li>Multiple extensions can be specified with commas</li>
        </ul>
      </div>
    </div>
  `,
};
