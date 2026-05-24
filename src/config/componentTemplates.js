/**
 * componentTemplates.js
 *
 * Base Form.io JSON templates for each supported field type.
 *
 * When importing from Excel, each row is matched to its type and
 * merged with the template here. The "label", "key", and any
 * option values from the Excel row always override the template.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses the "Option Labels" and "Option Values" Excel columns back
 * into a Form.io values array: [{ label, value }, ...]
 * Both columns use " || " as the separator.
 */
export const parseOptions = (optionLabels = "", optionValues = "") => {
  const labels = optionLabels
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);

  const values = optionValues
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);

  return labels.map((label, i) => ({
    label,
    value: values[i] ?? label,
  }));
};

// ---------------------------------------------------------------------------
// Columns wrapper builder
// ---------------------------------------------------------------------------

/**
 * Builds a Form.io "columns" layout component.
 *
 * @param {string} key - Unique key for this wrapper (e.g. "Columns", "Columns2")
 * @param {Array}  columnSlots - Array of slot objects, each shaped:
 *   { components: [...], width: 6, offset: 0, push: 0, pull: 0, size: "md", currentWidth: 6 }
 * @returns {object} Form.io columns component
 */
export const buildColumnsWrapper = (key, columnSlots) => ({
  label: "Columns",
  columns: columnSlots,
  key,
  type: "columns",
  input: false,
  tableView: false,
});

// ---------------------------------------------------------------------------
// Base templates per type
// ---------------------------------------------------------------------------

const TEMPLATES = {
  textfield: ({ label, key }) => ({
    label,
    tableView: true,
    key,
    type: "textfield",
    input: true,
  }),

  textarea: ({ label, key }) => ({
    label,
    autoExpand: false,
    tableView: true,
    key,
    type: "textarea",
    input: true,
  }),

  number: ({ label, key }) => ({
    label,
    mask: false,
    tableView: false,
    delimiter: false,
    requireDecimal: false,
    inputFormat: "plain",
    truncateMultipleSpaces: false,
    key,
    type: "number",
    input: true,
  }),

  checkbox: ({ label, key }) => ({
    label,
    tableView: false,
    key,
    type: "checkbox",
    input: true,
  }),

  datetime: ({ label, key, format }) => ({
  datePicker: {
    disableWeekdays: false,
    disableWeekends: false,
  },
  enableMaxDateInput: false,
  enableMinDateInput: false,
  enableTime: false,
  format: format || "MM-dd-yyyy",
  input: true,
  key,
  label,
  tableView: false,
  type: "datetime",
  widget: {
    allowInput: true,
    disableWeekdays: false,
    disableWeekends: false,
    displayInTimezone: "viewer",
    enableTime: false,
    format: format || "MM-dd-yyyy",
    hourIncrement: 1,
    locale: "en",
    maxDate: null,
    minDate: null,
    minuteIncrement: 1,
    mode: "single",
    noCalendar: false,
    time_24hr: false,
    type: "calendar",
    useLocaleSettings: false,
  },
}),

  select: ({ label, key, optionLabels, optionValues }) => ({
    label,
    widget: "choicesjs",
    tableView: true,
    data: {
      values: parseOptions(optionLabels, optionValues),
    },
    key,
    type: "select",
    input: true,
  }),

  radio: ({ label, key, optionLabels, optionValues }) => ({
    label,
    optionsLabelPosition: "right",
    inline: false,
    tableView: false,
    values: parseOptions(optionLabels, optionValues),
    key,
    type: "radio",
    input: true,
  }),

  content: ({ label, key }) => ({
    html: label,
    label: "Content",
    refreshOnChange: false,
    key,
    type: "content",
    input: false,
    tableView: false,
  }),

  panel: ({ label, key }) => ({
    title: label,
    collapsible: true,
    key,
    type: "panel",
    label: "Panel",
    collapsed: false,
    input: false,
    tableView: false,
    components: [],
  }),

  datagrid: ({ label, key }) => ({
    label,
    reorder: false,
    addAnotherPosition: "bottom",
    layoutFixed: false,
    enableRowGroups: false,
    initEmpty: false,
    hideLabel: true,
    tableView: false,
    key,
    type: "datagrid",
    input: true,
    components: [],
  }),

  button: ({ label, key }) => ({
    label,
    action: "submit",
    showValidations: false,
    tableView: false,
    key,
    type: "button",
    input: true,
  }),

  email: ({ label, key }) => ({
    label,
    tableView: true,
    key,
    type: "email",
    input: true,
  }),

  phoneNumber: ({ label, key }) => ({
    label,
    tableView: true,
    key,
    type: "phoneNumber",
    input: true,
  }),

  currency: ({ label, key }) => ({
    label,
    mask: false,
    spellcheck: false,
    tableView: false,
    currency: "USD",
    inputFormat: "plain",
    truncateMultipleSpaces: false,
    key,
    type: "currency",
    input: true,
    delimiter: true,
  }),

  signature: ({ label, key }) => ({
    label,
    tableView: false,
    key,
    type: "signature",
    input: true,
  }),
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getSupportedTypes = () => Object.keys(TEMPLATES);

/**
 * Builds a single Form.io component from a flat field descriptor.
 */
export const buildComponent = (field) => {
  const { type } = field;
  const builder = TEMPLATES[type];

  if (!builder) {
    console.warn(`[componentTemplates] Unknown type "${type}" — falling back to textfield`);
    return TEMPLATES.textfield({ ...field, label: `[${type}] ${field.label}` });
  }

  return builder(field);
};
