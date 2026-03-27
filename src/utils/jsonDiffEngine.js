/**
 * High-Performance JSON Diff Engine
 * - Semantic-aware comparison (key order agnostic)
 * - Deep recursive diffing
 * - Type strictness
 * - Configurable ignore list
 * - JSONPath tracking
 */

// ============================================================================
// Core Comparison Logic
// ============================================================================

/**
 * Validate if a string is valid JSON
 */
export const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

/**
 * Parse JSON safely with error info
 */
export const parseJSONSafe = (str) => {
    try {
        return { success: true, data: JSON.parse(str), error: null };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: `Invalid JSON: ${error.message}`,
        };
    }
};

/**
 * Type-safe equality check
 * Treats "100" !== 100 as different
 */
const isEqual = (val1, val2) => {
    if (typeof val1 !== typeof val2) {
        return false;
    }

    if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) {
            return false;
        }
        return val1.every((v, i) => isEqual(v, val2[i]));
    }

    if (
        typeof val1 === "object" &&
        val1 !== null &&
        typeof val2 === "object" &&
        val2 !== null
    ) {
        const keys1 = Object.keys(val1);
        const keys2 = Object.keys(val2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        return keys1.every((key) => isEqual(val1[key], val2[key]));
    }

    return val1 === val2;
};

/**
 * Main diff engine - recursively compares two objects
 * Returns diff nodes with structural information
 */
export const deepDiffObjects = (
    source,
    target,
    ignoreList = [],
    path = "root"
) => {
    const diffs = [];

    // Handle null/undefined cases
    if (source === null && target === null) {
        return diffs;
    }

    if (typeof source !== "object" || typeof target !== "object") {
        // Type mismatch or primitive difference
        if (!isEqual(source, target)) {
            diffs.push({
                type: "modified",
                path,
                source,
                target,
                sourceType: typeof source,
                targetType: typeof target,
            });
        }
        return diffs;
    }

    // Both are objects - get all keys
    const allKeys = new Set([
        ...Object.keys(source || {}),
        ...Object.keys(target || {}),
    ]);

    allKeys.forEach((key) => {
        // Skip ignored keys
        if (ignoreList.includes(key)) {
            diffs.push({
                type: "ignored",
                path: `${path}.${key}`,
                source: source?.[key],
                target: target?.[key],
            });
            return;
        }

        const sourceVal = source?.[key];
        const targetVal = target?.[key];
        const newPath = `${path}.${key}`;

        // Check if key was added
        if (sourceVal === undefined) {
            diffs.push({
                type: "added",
                path: newPath,
                source: undefined,
                target: targetVal,
                targetType: typeof targetVal,
            });
        }
        // Check if key was removed
        else if (targetVal === undefined) {
            diffs.push({
                type: "removed",
                path: newPath,
                source: sourceVal,
                target: undefined,
                sourceType: typeof sourceVal,
            });
        }
        // Recurse for nested objects
        else if (
            typeof sourceVal === "object" &&
            sourceVal !== null &&
            typeof targetVal === "object" &&
            targetVal !== null &&
            !Array.isArray(sourceVal) &&
            !Array.isArray(targetVal)
        ) {
            diffs.push(...deepDiffObjects(sourceVal, targetVal, ignoreList, newPath));
        }
        // Handle arrays
        else if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
            diffs.push(
                ...deepDiffArrays(sourceVal, targetVal, ignoreList, newPath)
            );
        }
        // Primitive or value change
        else if (!isEqual(sourceVal, targetVal)) {
            diffs.push({
                type: "modified",
                path: newPath,
                source: sourceVal,
                target: targetVal,
                sourceType: typeof sourceVal,
                targetType: typeof targetVal,
            });
        }
    });

    return diffs;
};

/**
 * Deep array comparison
 */
const deepDiffArrays = (sourceArr, targetArr, ignoreList, path) => {
    const diffs = [];
    const maxLen = Math.max(sourceArr.length, targetArr.length);

    for (let i = 0; i < maxLen; i++) {
        const sourceVal = sourceArr[i];
        const targetVal = targetArr[i];
        const arrayPath = `${path}[${i}]`;

        if (sourceVal === undefined) {
            diffs.push({
                type: "added",
                path: arrayPath,
                source: undefined,
                target: targetVal,
                targetType: typeof targetVal,
            });
        } else if (targetVal === undefined) {
            diffs.push({
                type: "removed",
                path: arrayPath,
                source: sourceVal,
                target: undefined,
                sourceType: typeof sourceVal,
            });
        } else if (
            typeof sourceVal === "object" &&
            sourceVal !== null &&
            typeof targetVal === "object" &&
            targetVal !== null &&
            !Array.isArray(sourceVal) &&
            !Array.isArray(targetVal)
        ) {
            diffs.push(
                ...deepDiffObjects(sourceVal, targetVal, ignoreList, arrayPath)
            );
        } else if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
            diffs.push(
                ...deepDiffArrays(sourceVal, targetVal, ignoreList, arrayPath)
            );
        } else if (!isEqual(sourceVal, targetVal)) {
            diffs.push({
                type: "modified",
                path: arrayPath,
                source: sourceVal,
                target: targetVal,
                sourceType: typeof sourceVal,
                targetType: typeof targetVal,
            });
        }
    }

    return diffs;
};

// ============================================================================
// Tree Structure Building (for hierarchical UI)
// ============================================================================

/**
 * Parse JSONPath to get nested value
 */
export const getValueByPath = (obj, path) => {
    const parts = path.replace(/^root\./, "").split(/[.[\]]+/).filter(Boolean);
    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }

    return current;
};

/**
 * Build a hierarchical tree from diff results
 * Used for collapsed/expanded tree view
 */
export const buildDiffTree = (diffs) => {
    const root = {
        path: "root",
        type: "root",
        children: [],
        diffs: [],
        stats: { added: 0, removed: 0, modified: 0, total: 0 },
    };

    const nodeMap = new Map();
    nodeMap.set("root", root);

    diffs.forEach((diff) => {
        if (diff.type === "ignored") return;

        // Update stats
        if (diff.type === "added") root.stats.added++;
        else if (diff.type === "removed") root.stats.removed++;
        else if (diff.type === "modified") root.stats.modified++;
        root.stats.total++;

        // Create path hierarchy
        const parts = diff.path.replace(/^root\./, "").split(/[.[\]]+/).filter(Boolean);
        let currentPath = "root";
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const nextPath = i === 0 ? part : `${currentPath}.${part}`;

            if (!nodeMap.has(nextPath)) {
                const parent = nodeMap.get(currentPath);
                const newNode = {
                    path: nextPath,
                    key: part,
                    type: "container",
                    children: [],
                    diffs: [],
                    stats: { added: 0, removed: 0, modified: 0, total: 0 },
                };
                nodeMap.set(nextPath, newNode);
                parent.children.push(newNode);
            }

            currentPath = nextPath;
        }

        // Attach diff to leaf node
        const leafNode = nodeMap.get(currentPath);
        leafNode.diffs.push(diff);

        // Update all parent stats
        let updatePath = currentPath;
        while (updatePath && updatePath !== "root") {
            const node = nodeMap.get(updatePath);
            if (diff.type === "added") node.stats.added++;
            else if (diff.type === "removed") node.stats.removed++;
            else if (diff.type === "modified") node.stats.modified++;
            node.stats.total++;

            updatePath = updatePath.substring(0, updatePath.lastIndexOf("."));
        }
    });

    return root;
};

// ============================================================================
// Summary Statistics
// ============================================================================

/**
 * Calculate summary stats from diffs
 */
export const calculateSummary = (diffs) => {
    const stats = {
        added: 0,
        removed: 0,
        modified: 0,
        ignored: 0,
        total: 0,
    };

    diffs.forEach((diff) => {
        if (diff.type === "added") stats.added++;
        else if (diff.type === "removed") stats.removed++;
        else if (diff.type === "modified") stats.modified++;
        else if (diff.type === "ignored") stats.ignored++;

        if (diff.type !== "ignored") {
            stats.total++;
        }
    });

    return stats;
};

/**
 * Get all diffs of a specific type
 */
export const filterDiffsByType = (diffs, type) => {
    return diffs.filter((d) => d.type === type);
};

/**
 * Format value for display
 */
export const formatValue = (value, maxLength = 100) => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    const strValue = JSON.stringify(value);
    if (strValue.length > maxLength) {
        return strValue.substring(0, maxLength) + "...";
    }
    return strValue;
};

/**
 * Get display type name
 */
export const getTypeName = (value) => {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
};
