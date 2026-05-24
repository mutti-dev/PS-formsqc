export const parseJson = (input) => {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
};

export const deepParse = (obj) => {
  if (typeof obj === "string") {
    const parsed = parseJson(obj);
    return typeof parsed === "object" ? deepParse(parsed) : parsed;
  }
  if (Array.isArray(obj)) return obj.map(deepParse);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, deepParse(v)])
    );
  }
  return obj;
};

export const parseDoublyEscapedJson = (jsonString) => {
  try {
    const outer = JSON.parse(jsonString);
    
    if (outer.config && typeof outer.config === 'string') {
      const cleanedString = outer.config
        .replace(/\\\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
      
      try {
        return JSON.parse(cleanedString);
      } catch (innerError) {
        if (outer.config.startsWith('"') && outer.config.endsWith('"')) {
          const trimmed = outer.config.substring(1, outer.config.length - 1);
          const unescaped = trimmed.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          return JSON.parse(unescaped);
        }
        throw innerError;
      }
    }
    
    return outer;
  } catch (error) {
    try {
      const fixed = jsonString
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      
      return JSON.parse(fixed);
    } catch (fallbackError) {
      throw new Error(`Failed to parse doubly escaped JSON: ${error.message}`);
    }
  }
};

export const extractFormJson = (input) => {
  try {
    const strategies = [
      () => JSON.parse(input),
      () => {
        const parsed = JSON.parse(input);
        if (parsed.config && typeof parsed.config === 'string') {
          return parseDoublyEscapedJson(input);
        }
        return parsed;
      },
      () => {
        const cleaned = input
          .replace(/\\\\"/g, '"')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        return JSON.parse(cleaned);
      }
    ];

    let result = null;
    let lastError = null;

    for (const strategy of strategies) {
      try {
        result = strategy();
        if (result) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!result) {
      throw lastError || new Error("All parsing strategies failed");
    }

    let configObj = result;
    if (result && result.config && typeof result.config === "string") {
      try {
        configObj = JSON.parse(result.config);
      } catch {
        configObj = result;
      }
    }

    const findFormComponents = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findFormComponents(item);
          if (found) return found;
        }
      }
      if (obj.components && Array.isArray(obj.components)) {
        return obj;
      }
      const keys = Object.keys(obj);
      for (const key of keys) {
        if (typeof obj[key] === 'object') {
          const found = findFormComponents(obj[key]);
          if (found) return found;
        }
      }
      return null;
    };

    const formStructure = findFormComponents(configObj);

    if (!formStructure && configObj !== result) {
      return configObj;
    }
    if (!formStructure) {
      return result;
    }
    return formStructure;
  } catch (error) {
    console.error("Form extraction error:", error);
    throw error;
  }
};

export const searchKeysInObject = (obj, keysToFind) => {
  const results = [];
  const foundKeys = new Set();
  
  const searchRecursive = (current, path = "") => {
    if (current && typeof current === "object") {
      if (Array.isArray(current)) {
        current.forEach((item, i) =>
          searchRecursive(item, path ? `${path}[${i}]` : `[${i}]`)
        );
      } else {
        Object.entries(current).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (keysToFind.includes(key)) {
            foundKeys.add(key);
            results.push({
              key,
              found: true,
              path: currentPath,
              value,
            });
          }
          searchRecursive(value, currentPath);
        });
      }
    }
  };
  
  searchRecursive(obj);
  
  keysToFind.forEach((key) => {
    if (!foundKeys.has(key)) {
      results.push({ key, found: false, path: null, value: null });
    }
  });
  
  return results;
};

/**
 * Strips the trailing submit button from a components array.
 * Matches any component where type === "button" and key === "submit"
 * at the END of the array (only removes it if it's the last item).
 */
const stripTrailingSubmitButton = (components) => {
  if (!Array.isArray(components) || components.length === 0) return components;
  const last = components[components.length - 1];
  if (last && last.type === "button" && last.key === "submit") {
    return components.slice(0, -1);
  }
  return components;
};

/**
 * Unwraps the outer { name, config: { components } } shell that some
 * exports produce, and strips the trailing submit button.
 *
 * Handles these shapes:
 *   { name: "...", config: { components: [...] } }   ← object config
 *   { name: "...", config: "{ \"components\": [...] }" } ← string config
 *   Any other shape → returned as-is (already unwrapped)
 */
const unwrapConfigShell = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;

  // Detect the wrapper: must have a "config" key that contains "components"
  let configObj = null;

  if (obj.config && typeof obj.config === "object" && Array.isArray(obj.config.components)) {
    configObj = obj.config;
  } else if (obj.config && typeof obj.config === "string") {
    try {
      const parsed = JSON.parse(obj.config);
      if (parsed && Array.isArray(parsed.components)) {
        configObj = parsed;
      }
    } catch {
      // not parseable — leave as-is
    }
  }

  if (!configObj) return obj; // no wrapper detected

  return stripTrailingSubmitButton(configObj.components);
};

export const formatJsonString = (jsonObj) => {
  const cleaned = unwrapConfigShell(jsonObj);
  if (Array.isArray(cleaned)) {
    return cleaned.map(item => JSON.stringify(item, null, 2)).join(",\n");
  }
  return JSON.stringify(cleaned, null, 2);
};

export const isValidJson = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

export const highlightJsonSyntax = (jsonString) => {
  if (!jsonString) return "";
  
  return jsonString.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        return /:$/.test(match) 
          ? `<span class="text-primary fw-semibold">${match}</span>`
          : `<span class="text-success">${match}</span>`;
      } else if (/true|false/.test(match)) {
        return `<span class="text-danger fw-semibold">${match}</span>`;
      } else if (/null/.test(match)) {
        return `<span class="text-info fw-semibold">${match}</span>`;
      } else {
        return `<span class="text-warning">${match}</span>`;
      }
    }
  );
};

export const extractJsonKeys = (jsonObj) => {
  const keys = new Set();
  
  const extractRecursive = (obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach(key => {
        keys.add(key);
        if (obj[key] && typeof obj[key] === "object") {
          extractRecursive(obj[key]);
        }
      });
    }
  };
  
  extractRecursive(jsonObj);
  return Array.from(keys);
};

export const countJsonElements = (jsonObj) => {
  let count = 0;
  
  const countRecursive = (obj) => {
    if (obj && typeof obj === "object") {
      count++;
      if (Array.isArray(obj)) {
        obj.forEach(countRecursive);
      } else {
        Object.values(obj).forEach(countRecursive);
      }
    }
  };
  
  countRecursive(jsonObj);
  return count;
};