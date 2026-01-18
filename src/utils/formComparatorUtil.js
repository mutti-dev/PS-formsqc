
export const extractFields = (components, fields = {}) => {
  const ignoreTypes = ["container", "columns", "content"];

  components.forEach((comp) => {
    if (!ignoreTypes.includes(comp.type)) {
      if (comp.key) {
        fields[comp.key] = comp.label || "";
      }
    }

    if (comp.components) {
      extractFields(comp.components, fields);
    }

    if (comp.columns) {
      comp.columns.forEach((col) =>
        extractFields(col.components || [], fields)
      );
    }
  });

  return fields;
};

export const compareFormsData = (sandboxObj, prodObj) => {
  const sandboxFields = extractFields(
    sandboxObj.components || sandboxObj
  );
  const prodFields = extractFields(
    prodObj.components || prodObj
  );

  const similar = [];
  const missing = [];
  const warnings = [];

  Object.keys(prodFields).forEach((key) => {
    if (sandboxFields[key]) {
      if (prodFields[key] !== sandboxFields[key]) {
        warnings.push({
          key,
          prodLabel: prodFields[key],
          sandboxLabel: sandboxFields[key],
        });
      } else {
        similar.push({ key, label: prodFields[key] });
      }
    } else {
      missing.push({
        key,
        label: prodFields[key],
        type: "Missing in Sandbox",
      });
    }
  });

  Object.keys(sandboxFields).forEach((key) => {
    if (!prodFields[key]) {
      missing.push({
        key,
        label: sandboxFields[key],
        type: "Missing in Prod",
      });
    }
  });

  return { similar, missing, warnings };
};
