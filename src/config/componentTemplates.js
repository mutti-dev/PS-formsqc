/**
 * componentTemplates.js
 *
 * Base Form.io JSON templates for each supported field type.
 *
 * When importing from Excel, each row is matched to its type and
 * merged with the template here. The "label", "key", and any
 * option values from the Excel row always override the template.
 *
 * To customise a component (e.g. add validation, change widget
 * settings, add a placeholder), edit the relevant template below.
 * New field types can be added by following the same pattern.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses the "Option Labels" and "Option Values" Excel columns back
 * into a Form.io values array: [{ label, value }, ...]
 *
 * Both columns use " || " as the separator (matching exportUtils.js).
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
    value: values[i] ?? label, // fall back to label if value column is shorter
  }));
};

// ---------------------------------------------------------------------------
// Base templates per type
// Edit these to match whatever defaults your Form.io project expects.
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

//   {
//   "label": "Text Area",
//   "autoExpand": false,
//   "tableView": true,
//   "key": "Text_Area",
//   "type": "textarea",
//   "input": true
// }

  number: ({ label, key }) => ({
    label,
    tableView: true,
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
    defaultValue: false,
  }),

  datetime: ({ label, key, format }) => ({
    label,
    format: format || "MM/dd/yyyy",
    placeholder: format || "MM/dd/yyyy",
    tableView: false,
    datePicker: {
      disableWeekends: false,
      disableWeekdays: false,
    },
    enableTime: false,
    enableMinDateInput: false,
    enableMaxDateInput: false,
    key,
    type: "datetime",
    input: true,
    widget: {
      type: "calendar",
      displayInTimezone: "viewer",
      locale: "en",
      useLocaleSettings: false,
      allowInput: true,
      mode: "single",
      enableTime: false,
      noCalendar: false,
      format: format || "MM/dd/yyyy",
      hourIncrement: 1,
      minuteIncrement: 1,
      time_24hr: false,
      minDate: null,
      disableWeekends: false,
      disableWeekdays: false,
      maxDate: null,
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
    html: "",
    label,
    refreshOnChange: false,
    key,
    type: "content",
    input: false,
    tableView: false,
  }),

  panel: ({ label, key }) => ({
    title: label,   // panels use "title" as their display text
    collapsible: true,
    key,
    type: "panel",
    label: "Panel",
    collapsed: false,
    input: false,
    tableView: false,
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
    inputMask: "(999) 999-9999",
    key,
    type: "phoneNumber",
    input: true,
  }),

  currency: ({ label, key }) => ({
    label,
    tableView: false,
    currency: "USD",
    inputFormat: "plain",
    key,
    type: "currency",
    input: true,
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

/**
 * Returns all type names that have a registered template.
 * Useful for showing the user which types are supported on import.
 */
export const getSupportedTypes = () => Object.keys(TEMPLATES);

/**
 * Builds a single Form.io component object from a flat field descriptor.
 *
 * @param {object} field - Properties extracted from an Excel row:
 *   { label, key, type, format, optionLabels, optionValues }
 * @returns {object} Form.io component JSON
 */
export const buildComponent = (field) => {
  const { type } = field;
  const builder = TEMPLATES[type];

  if (!builder) {
    // Unknown type: produce a minimal textfield and mark it
    console.warn(`[componentTemplates] Unknown type "${type}" — falling back to textfield`);
    return TEMPLATES.textfield({ ...field, label: `[${type}] ${field.label}` });
  }

  return builder(field);
};