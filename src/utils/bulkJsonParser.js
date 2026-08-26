/**
 * Parse delimited text (TSV/CSV) robustly.
 * For TSV (tab-delimited), lines are separated by newlines and fields by tabs,
 * preserving all internal quotes within JSON payloads.
 */
export function parseDelimitedText(text, defaultDelimiter = null) {
  if (!text || typeof text !== "string") return [];

  const trimmed = text.trim();
  if (!trimmed) return [];

  // Detect delimiter if not provided
  let delimiter = defaultDelimiter;
  if (!delimiter) {
    const firstLine = trimmed.split(/\r?\n/)[0] || "";
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const pipeCount = (firstLine.match(/\|/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;

    if (tabCount >= 1 && tabCount >= commaCount) {
      delimiter = "\t";
    } else if (pipeCount >= 2 && pipeCount >= commaCount) {
      delimiter = "|";
    } else if (semiCount >= 2 && semiCount >= commaCount) {
      delimiter = ";";
    } else {
      delimiter = ",";
    }
  }

  // Fast path for TSV, Semicolon, and Pipe-separated lines
  if (delimiter === "\t" || delimiter === "|" || delimiter === ";") {
    const lines = trimmed.split(/\r?\n/);
    const rows = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const parts = line.split(delimiter);
      if (parts.length >= 3) {
        let formId = parts[0].trim();
        let caption = parts[1].trim();
        let desc = parts.slice(2).join(delimiter).trim();

        // Handle Excel / TSV quote wrapping
        if (desc.startsWith('"') && desc.endsWith('"') && desc.length >= 2) {
          if (desc.includes('""')) {
            desc = desc.slice(1, -1).replace(/""/g, '"');
          } else {
            try {
              const unescaped = JSON.parse(desc);
              if (typeof unescaped === "string") {
                desc = unescaped;
              } else if (typeof unescaped === "object" && unescaped !== null) {
                desc = JSON.stringify(unescaped);
              }
            } catch {
              const stripped = desc.slice(1, -1).trim();
              if (stripped.startsWith("{") || stripped.startsWith("[")) {
                desc = stripped;
              }
            }
          }
        }

        rows.push([formId, caption, desc]);
      } else if (parts.length === 2) {
        rows.push([parts[0].trim(), parts[1].trim()]);
      } else {
        rows.push([trimmedLine]);
      }
    }

    return rows;
  }

  // Standard CSV / quoted field parser
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (currentField.length === 0 || insideQuotes) {
        insideQuotes = !insideQuotes;
      } else {
        currentField += char;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.some((f) => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses raw text input into an array of structured form records:
 * { id, name, rawContent, rowIndex }
 */
export function parseBulkFormInput(input) {
  if (!input || typeof input !== "string") return [];

  const trimmed = input.trim();
  if (!trimmed) return [];

  // Case 1: Input is already a JSON array
  if (trimmed.startsWith("[")) {
    try {
      const parsedArr = JSON.parse(trimmed);
      if (Array.isArray(parsedArr)) {
        return parsedArr.map((item, idx) => {
          const formId = item.FormId ?? item.formId ?? item.id ?? item.ID ?? `Form_${idx + 1}`;
          const formName = item.Caption ?? item.caption ?? item.name ?? item.Name ?? item.title ?? `Form ${formId}`;
          const rawContent = item.Description ?? item.description ?? item.config ?? item.json ?? item.raw ?? JSON.stringify(item);

          return {
            id: String(formId),
            name: String(formName),
            rawContent: typeof rawContent === "object" ? JSON.stringify(rawContent) : String(rawContent),
            rowIndex: idx + 1,
          };
        });
      }
    } catch (e) {
      // Continue to delimited parsing if JSON parse fails
    }
  }

  // Case 2: Delimited text (TSV / CSV / Tab-separated)
  const rows = parseDelimitedText(trimmed);
  if (rows.length === 0) return [];

  // Check if first row is a header
  const headerRow = rows[0].map((h) => (h || "").trim().toLowerCase());
  let formIdIdx = headerRow.findIndex((h) => ["formid", "form_id", "id", "form id", "key"].includes(h));
  let captionIdx = headerRow.findIndex((h) => ["caption", "name", "formname", "form_name", "title", "form name", "form caption"].includes(h));
  let descIdx = headerRow.findIndex((h) => ["description", "config", "json", "rawjson", "raw_json", "form_json", "data"].includes(h));

  let dataRows = rows;
  const hasHeader = formIdIdx !== -1 || captionIdx !== -1 || descIdx !== -1;

  if (hasHeader) {
    if (formIdIdx === -1) formIdIdx = 0;
    if (captionIdx === -1) captionIdx = 1;
    if (descIdx === -1) descIdx = 2;
    dataRows = rows.slice(1);
  } else {
    formIdIdx = 0;
    captionIdx = 1;
    descIdx = rows[0].length >= 3 ? 2 : (rows[0].length === 2 ? 1 : 0);
  }

  return dataRows.map((row, idx) => {
    const rawId = (row[formIdIdx] || "").trim();
    const rawCaption = (row[captionIdx] || "").trim();
    const rawDesc = (row[descIdx] || "").trim();

    const formId = rawId || String(idx + 1);
    const formName = rawCaption || `Form ${formId}`;
    const rawContent = rawDesc || row.join("\t");

    return {
      id: String(formId),
      name: String(formName),
      rawContent,
      rowIndex: idx + 1,
    };
  });
}
