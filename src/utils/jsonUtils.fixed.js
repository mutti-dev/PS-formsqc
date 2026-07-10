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
        .replace(/\\\\/g, '"')
        .replace(/\\/g, '\\')
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
    const normalizeInput = () => {
      if (input && typeof input === 'object' && !Array.isArray(input)) {
        return input;
      }
      if (typeof input === 'string') {
        return JSON.parse(input);
      }
      return input;
    };

    const strategies = [
      () => normalizeInput(),
      () => {
        const parsed = normalizeInput();
        if (parsed && parsed.config && typeof parsed.config === 'string') {
          return parseDoublyEscapedJson(typeof input === 'string' ? input : JSON.stringify(parsed));
        }
        return parsed;
      },
      () => {
        const cleaned = typeof input === 'string'
          ? input.replace(/\\"/g, '"').replace(/\"/g, '"').replace(/\\\\/g, '\\')
          : JSON.stringify(input).replace(/\\"/g, '"').replace(/\"/g, '"').replace(/\\\\/g, '\\');
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
