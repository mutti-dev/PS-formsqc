import { deepParse } from "./jsonUtils";

export const parseBulkJsonText = (text) => {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = lines.map((line, idx) => {
    try {
      const obj = deepParse(line);
      const formName = obj?.title || obj?.name || `Form ${idx + 1}`;
      return { index: idx, formName, obj, error: null };
    } catch (e) {
      return { index: idx, formName: `Line ${idx + 1}`, obj: null, error: e.message };
    }
  });

  return results;
};

export default parseBulkJsonText;
