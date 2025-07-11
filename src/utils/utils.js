// Recursively extract objects with 'label' and 'type'
// Recursively extract objects with 'label' and 'type'
export function extractLabelsFromJSON(json) {
  let result = [];

  function traverse(obj) {
    if (obj && typeof obj === 'object') {
      // If the current object has both "label" and "type", add it.
      if (obj.label && obj.type) {
        const entry = {
          label: obj.label,
          key: obj.key,
          type: obj.type,
        };

        // Add optional fields
        if (obj.type === 'datetime' && obj.format) {
          entry.format = obj.format;
        }

        if (obj.title) {
          entry.title = obj.title;
        }

        result.push(entry);
      }

      // Traverse arrays and nested objects
      Object.keys(obj).forEach(key => {
        const prop = obj[key];
        if (Array.isArray(prop)) {
          prop.forEach(item => traverse(item));
        } else if (typeof prop === 'object') {
          traverse(prop);
        }
      });
    }
  }

  traverse(json);
  return result;
}

  
  // Deep compare two arrays of extracted entries (by label) and return report differences.
  export function deepCompareJSON(data1, data2) {
    let report = [];
    const map1 = {};
    data1.forEach(item => map1[item.label] = item.type);
    const map2 = {};
    data2.forEach(item => map2[item.label] = item.type);
  
    // Find keys in data1 missing or different in data2
    Object.keys(map1).forEach(key => {
      if(!(key in map2)) {
        report.push({ issue: 'Missing in JSON 2', details: key });
      } else if(map1[key] !== map2[key]) {
        report.push({ issue: 'Type mismatch for key: ' + key, details: `JSON1: ${map1[key]}, JSON2: ${map2[key]}` });
      }
    });
  
    // Find keys in data2 that are missing in JSON1
    Object.keys(map2).forEach(key => {
      if(!(key in map1)) {
        report.push({ issue: 'Missing in JSON 1', details: key });
      }
    });
  
    return report;
  }
