export const extractKeysAndLabels = (formObj) => {
  const keysMap = {};

  const traverse = (obj) => {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (item && item.key && typeof item.key === "string") {
          const entry = {
            label: item.label || "",
            type: item.type || "unknown",
          };

          // Capture options for select, radio, selectboxes
          if (
            ["select", "radio", "selectboxes"].includes(item.type) &&
            item.data?.values &&
            Array.isArray(item.data.values)
          ) {
            entry.options = item.data.values.map((v) => ({
              label: v.label || "",
              value: v.value || "",
            }));
          }

          keysMap[item.key] = entry;
        }

        traverse(item?.components);

        // columns is an array of column objects, each with a components array
        if (Array.isArray(item?.columns)) {
          item.columns.forEach((col) => traverse(col?.components));
        }
      });
    } else if (typeof obj === "object" && obj !== null) {
      if (obj.key && typeof obj.key === "string") {
        const entry = {
          label: obj.label || "",
          type: obj.type || "unknown",
        };

        if (
          ["select", "radio", "selectboxes"].includes(obj.type) &&
          obj.data?.values &&
          Array.isArray(obj.data.values)
        ) {
          entry.options = obj.data.values.map((v) => ({
            label: v.label || "",
            value: v.value || "",
          }));
        }

        keysMap[obj.key] = entry;
      }

      traverse(obj.components);

      if (Array.isArray(obj.columns)) {
        obj.columns.forEach((col) => traverse(col?.components));
      }
    }
  };

  traverse(formObj.components || formObj);
  return keysMap;
};

/**
 * Compare two option arrays and return added/removed/changed option entries.
 * Keyed by `value` since labels can change.
 */
const compareOptions = (prodOptions = [], sandboxOptions = []) => {
  const prodMap = Object.fromEntries(prodOptions.map((o) => [o.value, o.label]));
  const sandboxMap = Object.fromEntries(sandboxOptions.map((o) => [o.value, o.label]));

  const removedOptions = [];
  const addedOptions = [];
  const changedOptions = [];

  Object.entries(prodMap).forEach(([value, prodLabel]) => {
    if (!(value in sandboxMap)) {
      removedOptions.push({ value, oldLabel: prodLabel });
    } else if (sandboxMap[value] !== prodLabel) {
      changedOptions.push({ value, oldLabel: prodLabel, newLabel: sandboxMap[value] });
    }
  });

  Object.entries(sandboxMap).forEach(([value, sandboxLabel]) => {
    if (!(value in prodMap)) {
      addedOptions.push({ value, newLabel: sandboxLabel });
    }
  });

  return { removedOptions, addedOptions, changedOptions };
};

export const compareFormKeys = (sandboxForm, productionForm) => {
  const sandboxKeys = extractKeysAndLabels(sandboxForm);
  const prodKeys = extractKeysAndLabels(productionForm);

  const results = {
    removedKeys: [],
    addedKeys: [],
    changedKeys: [],
  };

  Object.entries(prodKeys).forEach(([key, prodData]) => {
    const prodLabel = typeof prodData === "string" ? prodData : prodData.label;
    const prodType = typeof prodData === "string" ? "unknown" : prodData.type;
    const prodOptions = prodData.options || [];

    if (!(key in sandboxKeys)) {
      results.removedKeys.push({
        key,
        oldLabel: prodLabel,
        type: prodType,
        issue: "Field removed from sandbox",
      });
    } else {
      const sandboxData = sandboxKeys[key];
      const sandboxLabel = typeof sandboxData === "string" ? sandboxData : sandboxData.label;
      const sandboxOptions = sandboxData.options || [];

      const sandboxType = typeof sandboxData === "string" ? "unknown" : sandboxData.type;

      const hasLabelChange = sandboxLabel !== prodLabel;
      const hasTypeChange = sandboxType !== prodType;

      // Compare options if both sides have them or one side added/removed all
      const optionDiff =
        prodOptions.length > 0 || sandboxOptions.length > 0
          ? compareOptions(prodOptions, sandboxOptions)
          : null;

      const hasOptionChanges =
        optionDiff &&
        (optionDiff.removedOptions.length > 0 ||
          optionDiff.addedOptions.length > 0 ||
          optionDiff.changedOptions.length > 0);

      if (hasLabelChange || hasTypeChange || hasOptionChanges) {
        const issuesParts = [];
        if (hasLabelChange) issuesParts.push("Label changed");
        if (hasTypeChange) issuesParts.push("Type changed");
        if (hasOptionChanges) issuesParts.push("Options changed");

        results.changedKeys.push({
          key,
          oldLabel: prodLabel,
          newLabel: sandboxLabel,
          oldType: prodType,
          newType: sandboxType,
          hasTypeChange,
          issue: issuesParts.join(", "),
          ...(optionDiff && { optionDiff }),
        });
      }
    }
  });

  Object.entries(sandboxKeys).forEach(([key, sandboxData]) => {
    const sandboxLabel = typeof sandboxData === "string" ? sandboxData : sandboxData.label;
    const sandboxType = typeof sandboxData === "string" ? "unknown" : sandboxData.type;

    if (!(key in prodKeys)) {
      results.addedKeys.push({
        key,
        newLabel: sandboxLabel,
        type: sandboxType,
        issue: "New field added",
      });
    }
  });

  return results;
};

export const detectPotentialRenames = (prodKeys, sandboxKeys) => {
  const renames = [];
  const prodKeysArr = Object.entries(prodKeys);
  const sandboxKeysArr = Object.entries(sandboxKeys);

  prodKeysArr.forEach(([prodKey, prodLabel]) => {
    if (prodLabel && !(prodKey in sandboxKeys)) {
      const matchingSandbox = sandboxKeysArr.find(
        ([sKey, sLabel]) => sLabel === prodLabel && !(sKey in prodKeys)
      );

      if (matchingSandbox) {
        renames.push({
          oldKey: prodKey,
          newKey: matchingSandbox[0],
          label: prodLabel,
          issue: "Key renamed (same label)",
        });
      }
    }
  });

  return renames;
};