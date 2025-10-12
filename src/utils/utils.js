// ============================================================
// ✅ 1. Parse JSON safely
// ============================================================
export function parseFormJson(raw) {
  try {
    const cleaned = raw.replace(/(\r\n|\n|\r|\t)/gm, "").replace(/\s+/g, " ");
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("❌ Invalid JSON:", error);
    return null;
  }
}

// ============================================================
// ✅ 2. Extract components (flat list but keeps full details)
// ============================================================
export function extractComponents(components = [], result = []) {
  if (!Array.isArray(components)) components = [components];

  components.forEach((comp) => {
    if (!comp || typeof comp !== "object") return;

    const { type = "", key = "", label = "" } = comp;

    if (!["panel", "columns", "content"].includes(type)) {
      result.push({ label, key, type, ...comp });
    }

    if (Array.isArray(comp.components))
      extractComponents(comp.components, result);

    if (Array.isArray(comp.columns)) {
      comp.columns.forEach((col) => {
        if (Array.isArray(col.components))
          extractComponents(col.components, result);
      });
    }
  });

  return result;
}

// ============================================================
// ✅ 3. Check select/selectboxes options for duplicate labels/values
// ============================================================
export function checkSelectOptions(components = []) {
  const results = [];
  const allSelects = [];

  function traverse(list) {
    if (!Array.isArray(list)) return;
    list.forEach((comp) => {
      if (!comp || typeof comp !== "object") return;
      if (comp.type === "select" || comp.type === "selectboxes") {
        allSelects.push(comp);
      }

      if (Array.isArray(comp.components)) traverse(comp.components);
      if (Array.isArray(comp.columns)) {
        comp.columns.forEach((col) => {
          if (Array.isArray(col.components)) traverse(col.components);
        });
      }
    });
  }

  traverse(components);

  if (allSelects.length === 0) {
    results.push({
      rule: "Select/Selectboxes Options",
      passed: true,
      message:
        "✅ <strong>No select or selectboxes components found</strong> (nothing to check).",
    });
    return results;
  }

  const errors = [];

  allSelects.forEach((comp) => {
    const { label = "(no label)", type = "", key = "" } = comp;
    let options = [];

    // ✅ Handle select
    if (type === "select" && comp.data && Array.isArray(comp.data.values)) {
      options = comp.data.values;
    }

    // ✅ Handle selectboxes (array or object)
    if (type === "selectboxes" && comp.values) {
      if (Array.isArray(comp.values)) {
        options = comp.values;
      } else if (typeof comp.values === "object") {
        options = Object.entries(comp.values).map(([k, v]) => ({
          label: v.label || k,
          value: v.value ?? k,
        }));
      }
    }

    if (!options || options.length === 0) return;

    const labels = options.map((o) => o.label?.trim() || "");
    const values = options.map((o) => o.value?.toString().trim() || "");

    const dupLabels = labels.filter((l, i) => labels.indexOf(l) !== i);
    const dupValues = values.filter((v, i) => values.indexOf(v) !== i);

    if (dupLabels.length > 0 || dupValues.length > 0) {
      const msgs = [];
      if (dupLabels.length > 0)
        msgs.push(
          `Duplicate labels: <strong>${[...new Set(dupLabels)].join("<br>")}</strong>`
        );
      if (dupValues.length > 0)
        msgs.push(
          `Duplicate values: <strong>${[...new Set(dupValues)].join("<br>")}</strong>`
        );

      errors.push({
        label,
        message: `❌ <strong>${label}</strong> — ${msgs.join(" & ")}`,
      });
    }
  });

  if (errors.length === 0) {
    results.push({
      rule: "Select/Selectboxes Options",
      passed: true,
      message:
        "✅ <strong>All Select/Selectboxes components have unique option labels and values.</strong>",
    });
  } else {
    errors.forEach((err) =>
      results.push({
        rule: "Select/Selectboxes Options",
        passed: false,
        message: err.message,
      })
    );
  }

  return results;
}


// ============================================================
// ✅ 4. Check datetime format
// ============================================================
export function checkDatetimeFormat(
  components = [],
  expectedFormat = "MM-dd-yyyy"
) {
  const results = [];
  const allDatetimes = [];

  function traverse(list) {
    if (!Array.isArray(list)) return;
    list.forEach((comp) => {
      if (!comp || typeof comp !== "object") return;

      if (comp.type === "datetime") {
        allDatetimes.push(comp);
      }

      if (Array.isArray(comp.components)) traverse(comp.components);
      if (Array.isArray(comp.columns)) {
        comp.columns.forEach((col) => {
          if (Array.isArray(col.components)) traverse(col.components);
        });
      }
    });
  }

  traverse(components);

  if (allDatetimes.length === 0) {
    results.push({
      rule: "Datetime Format Validation",
      passed: true,
      message:
        "✅ <strong>No datetime components found</strong> (nothing to check).",
    });
    return results;
  }

  const invalidFormat = allDatetimes.filter((c) => c.format !== expectedFormat);

  if (invalidFormat.length === 0) {
    results.push({
      rule: "Datetime Format Validation",
      passed: true,
      message: `✅ All datetime components use correct format: <strong>${expectedFormat}</strong>.`,
    });
  } else {
    results.push({
      rule: "Datetime Format Validation",
      passed: false,
      message: `❌ <strong>${
        invalidFormat.length
      }</strong> datetime fields have invalid format:<br>${invalidFormat
        .map(
          (c) =>
            `(<strong>${c.label}</strong> → format: <strong>${
              c.format || "undefined"
            }</strong>)`
        )
        .join("<br>")}`,
    });
  }

  return results;
}

// ============================================================
// ✅ 5. Run all validations
// ============================================================

// ___________________________________________________________
// Validation Rules Summary

// Rule 1: Unique Keys

// Rule 2: Key Length ≤ 110

//  Rule 3: Unique Labels

// Rule 4: Single Container

// Rule 5: Select/Selectboxes Option Uniqueness

// Rule 6: Label–Key Match

// Rule 7: Datetime Format Validation

// ___________________________________________________________

// Datetime Format Validation
export function runValidations(parsedForm) {
  const results = [];
  const components = extractComponents(
    parsedForm.components || parsedForm.form?.components || []
  );

  // --- Rule 1: Unique Keys ---
  const keys = components.map((c) => c.key);
  const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
  results.push({
    rule: "Unique Keys",
    passed: duplicates.length === 0,
    message:
      duplicates.length === 0
        ? "✅ <strong>All keys are unique.</strong>"
        : `❌ Duplicate keys found: <strong>[${[...new Set(duplicates)].join(
            ", "
          )}]</strong>`,
  });

  // --- Rule 2: Key Length ≤ 110 ---
  const longKeys = components
    .filter((c) => (c.key || "").length > 110)
    .map((c) => ({
      label: c.label || "(no label)",
      key: c.key || "",
      length: (c.key || "").length,
    }));

  results.push({
    rule: "Key Length ≤ 110",
    passed: longKeys.length === 0,
    message:
      longKeys.length === 0
        ? "✅ <strong>All keys under 110 chars.</strong>"
        : `❌ <strong>${
            longKeys.length
          }</strong> key(s) exceed 110 chars:<br>${longKeys
            .map(
              (c) =>
                `• <strong>${c.label}</strong> — <code>${c.key}</code> (<em>${c.length} chars</em>)`
            )
            .join("<br>")}`,
  });

  // --- Rule 3: Unique Labels ---
  const labels = components.map((c) => c.label?.trim()).filter((l) => !!l); // remove null/undefined

const duplicateLabels = labels.filter((l, i) => labels.indexOf(l) !== i);

results.push({
  rule: "Unique Labels",
  passed: duplicateLabels.length === 0,
  message:
    duplicateLabels.length === 0
      ? "✅ <strong>All labels are unique.</strong>"
      : `❌ <strong>${
          [...new Set(duplicateLabels)].length
        }</strong> duplicate label(s) found:<br>${[...new Set(duplicateLabels)]
          .map((l) => `• <code>${l}</code>`)
          .join("<br>")}`,
});


  // --- Rule 4: Single Container ---
  let containerComponents = components.filter((c) => c.type === "container");

  if (
    containerComponents.length === 0 &&
    (parsedForm.type === "container" || parsedForm.key === "Container")
  ) {
    containerComponents = [parsedForm];
  }

  if (containerComponents.length === 0) {
    results.push({
      rule: "Container Component",
      passed: true,
      message:
        "ℹ️ <strong>No 'Container'</strong> component found — skipped (may be top-level).",
    });
  } else if (containerComponents.length > 1) {
    results.push({
      rule: "Single Container",
      passed: false,
      message: `❌ Found <strong>${containerComponents.length}</strong> containers — only one allowed.`,
    });
  } else {
    const container = containerComponents[0];
    const labelOk = container.label === "Container";
    const keyOk = container.key === "Container";
    results.push({
      rule: "Container Label & Key",
      passed: labelOk && keyOk,
      message:
        labelOk && keyOk
          ? "✅ <strong>Container</strong> correctly labeled/keyed."
          : `❌ Container label/key incorrect (<strong>label:</strong> '${container.label}', <strong>key:</strong> '${container.key}').`,
    });
  }

  // --- Rule 5: Select/Selectboxes Option Uniqueness ---
  const selectChecks = checkSelectOptions(
    parsedForm.components || parsedForm.form?.components || []
  );
  results.push(...selectChecks);

  // --- Rule 6: Label–Key Match ---
  const mismatched = components.filter((c) => {
    if (!c.label || !c.key) return false;

    const normalized = c.label
      .toString()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "_");

    return normalized !== c.key;
  });

  results.push({
    rule: "Label–Key Matching",
    passed: mismatched.length === 0,
    message:
      mismatched.length === 0
        ? "✅ <strong>All keys match their labels</strong> (normalized)."
        : `❌ <strong>${
            mismatched.length
          }</strong> components have mismatched label/key:<br>${mismatched
            .map(
              (c) => `(<strong>${c.label}</strong> → <strong>${c.key}</strong>)`
            )
            .join("<br>")}`,
  });

  // --- Rule 7: Datetime Format Validation ---
  const datetimeChecks = checkDatetimeFormat(
    parsedForm.components || parsedForm.form?.components || [],
    "MM-dd-yyyy"
  );
  results.push(...datetimeChecks);

  return results;
}
