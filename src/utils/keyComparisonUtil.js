export const extractKeysAndLabels = (formObj) => {
  const keysMap = {};

  const traverse = (obj) => {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (item.key && typeof item.key === "string") {
          keysMap[item.key] = {
            label: item.label || "",
            type: item.type || "unknown"
          };
        }
        traverse(item.components);
        traverse(item.columns);
      });
    } else if (typeof obj === "object" && obj !== null) {
      if (obj.key && typeof obj.key === "string") {
        keysMap[obj.key] = {
          label: obj.label || "",
          type: obj.type || "unknown"
        };
      }
      traverse(obj.components);
      traverse(obj.columns);
    }
  };

  traverse(formObj.components || formObj);
  return keysMap;
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
    const prodLabel = typeof prodData === 'string' ? prodData : prodData.label;
    const prodType = typeof prodData === 'string' ? 'unknown' : prodData.type;
    
    if (!(key in sandboxKeys)) {
      results.removedKeys.push({
        key,
        oldLabel: prodLabel,
        type: prodType,
        issue: "Field removed from sandbox",
      });
    } else {
      const sandboxData = sandboxKeys[key];
      const sandboxLabel = typeof sandboxData === 'string' ? sandboxData : sandboxData.label;
      const sandboxType = typeof sandboxData === 'string' ? 'unknown' : sandboxData.type;
      
      if (sandboxLabel !== prodLabel) {
        results.changedKeys.push({
          key,
          oldLabel: prodLabel,
          newLabel: sandboxLabel,
          type: prodType,
          issue: "Label changed",
        });
      }
    }
  });

  Object.entries(sandboxKeys).forEach(([key, sandboxData]) => {
    const sandboxLabel = typeof sandboxData === 'string' ? sandboxData : sandboxData.label;
    const sandboxType = typeof sandboxData === 'string' ? 'unknown' : sandboxData.type;
    
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
