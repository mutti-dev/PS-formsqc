/**
 * importUtils.js
 *
 * Converts an Excel file (in the format produced by exportUtils.js)
 * back into a valid Form.io container JSON.
 *
 * Expected Excel columns (case-insensitive):
 *   Label | Key | KeyLength | Type | Format | Option Labels | Option Values
 *
 * The output is a Form.io container structure:
 * {
 *   label: "Container",
 *   key: "Container",
 *   type: "container",
 *   input: true,
 *   components: [ ...one component per row... ]
 * }
 */

import * as XLSX from "xlsx";
import { buildComponent } from "../config/componentTemplates";

// ---------------------------------------------------------------------------
// Column name normalisation
// ---------------------------------------------------------------------------

/**
 * Maps raw Excel header strings to internal field names.
 * Handles minor casing or spacing differences gracefully.
 */
const COLUMN_MAP = {
  label:          "label",
  key:            "key",
  keylength:      "keyLength",
  type:           "type",
  format:         "format",
  "option labels":"optionLabels",
  "option values":"optionValues",
};

const normaliseHeader = (header) =>
  COLUMN_MAP[String(header).toLowerCase().trim()] ?? String(header).toLowerCase().trim();

// ---------------------------------------------------------------------------
// Row → field descriptor
// ---------------------------------------------------------------------------

const rowToField = (rawRow) => {
  const row = {};
  Object.entries(rawRow).forEach(([k, v]) => {
    row[normaliseHeader(k)] = v ?? "";
  });

  return {
    label:        String(row.label        || "").trim(),
    key:          String(row.key          || "").trim(),
    type:         String(row.type         || "textfield").trim().toLowerCase(),
    format:       String(row.format       || "").trim(),
    optionLabels: String(row.optionLabels || "").trim(),
    optionValues: String(row.optionValues || "").trim(),
  };
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a parsed field row before building a component.
 * Returns an array of error strings (empty = valid).
 */
const validateField = (field, rowIndex) => {
  const errors = [];
  const prefix = `Row ${rowIndex + 2}`; // +2: 1-based + header row

  if (!field.label) errors.push(`${prefix}: "Label" column is empty`);
  if (!field.key)   errors.push(`${prefix}: "Key" column is empty`);
  if (!field.type)  errors.push(`${prefix}: "Type" column is empty`);

  return errors;
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Reads an .xlsx File object and resolves with the imported form JSON
 * and any warnings/errors collected during the process.
 *
 * @param {File} file - The .xlsx file selected by the user
 * @returns {Promise<{ formJson: object, warnings: string[], errors: string[] }>}
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Use the first sheet regardless of its name
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error("The Excel file contains no sheets.");
        }

        const sheet = workbook.Sheets[sheetName];
        const rows  = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
          throw new Error(`Sheet "${sheetName}" is empty — no rows to import.`);
        }

        const warnings = [];
        const errors   = [];
        const components = [];

        rows.forEach((rawRow, idx) => {
          const field      = rowToField(rawRow);
          const rowErrors  = validateField(field, idx);

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
            return; // skip malformed rows, collect all errors first
          }

          const component = buildComponent(field);
          components.push(component);
        });

        if (components.length === 0 && errors.length > 0) {
          // Every row had errors — nothing to return
          reject(new Error("Import failed: all rows had validation errors.\n" + errors.join("\n")));
          return;
        }

        if (errors.length > 0) {
          warnings.push(
            `${errors.length} row(s) were skipped due to validation errors:`,
            ...errors
          );
        }

        const formJson = {
          label: "Container",
          tableView: false,
          key: "Container",
          type: "container",
          input: true,
          components,
        };

        resolve({ formJson, warnings, errors });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsArrayBuffer(file);
  });
};