/**
 * Advanced JSON Comparator - Test Examples & Demonstrations
 * 
 * This file contains example JSON pairs to test the Advanced JSON Comparator
 * with various scenarios including:
 * - Semantic equivalence (key ordering)
 * - Type strictness
 * - Nested structures
 * - Array differences
 * - Delete, add, and modify operations
 */

// ============================================================================
// Test Case 1: Key Order Agnostic (Semantic Equivalence)
// ============================================================================

export const test1_keyOrder = {
  name: "Key Order - Should be IDENTICAL",
  source: {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    address: {
      city: "New York",
      zip: "10001"
    }
  },
  target: {
    address: {
      zip: "10001",
      city: "New York"
    },
    email: "john@example.com",
    age: 30,
    name: "John Doe"
  },
  expectedDiffs: 0,
  description: "Objects with same keys in different order should be identical"
};

// ============================================================================
// Test Case 2: Type Strictness
// ============================================================================

export const test2_typeStrictness = {
  name: "Type Strictness - Should detect type changes",
  source: {
    id: 12345,
    count: 100,
    active: true,
    price: 19.99,
    data: null
  },
  target: {
    id: "12345",
    count: "100",
    active: "true",
    price: "19.99",
    data: undefined
  },
  expectedDiffs: 5,
  description: "Different types should be flagged as modified (number vs string, boolean vs string, null vs undefined)"
};

// ============================================================================
// Test Case 3: Nested Objects
// ============================================================================

export const test3_nestedObjects = {
  name: "Nested Objects - Deep comparison",
  source: {
    user: {
      profile: {
        personal: {
          firstName: "Jane",
          lastName: "Smith",
          birthDate: "1990-01-15"
        },
        contact: {
          email: "jane@company.com",
          phone: "+1-555-0123"
        }
      }
    }
  },
  target: {
    user: {
      profile: {
        personal: {
          firstName: "Jane",
          lastName: "Smith",
          birthDate: "1990-01-15",
          middleName: "Marie"  // Added
        },
        contact: {
          email: "jane.smith@company.com",  // Modified
          phone: "+1-555-0123"
        }
      }
    }
  },
  expectedDiffs: 2,
  description: "1 added (middleName), 1 modified (email)"
};

// ============================================================================
// Test Case 4: Array Differences
// ============================================================================

export const test4_arrays = {
  name: "Array Changes - Additions and removals",
  source: {
    tags: ["javascript", "react", "web"],
    scores: [85, 90, 88],
    items: [
      { id: 1, name: "Item A" },
      { id: 2, name: "Item B" }
    ]
  },
  target: {
    tags: ["javascript", "react", "web", "typescript"],  // Added typescript
    scores: [85, 90, 88, 92],  // Added 92
    items: [
      { id: 1, name: "Item A" },
      { id: 2, name: "Item B Updated" }  // Modified name
    ]
  },
  expectedDiffs: 3,
  description: "1 array addition (tags), 1 array addition (scores), 1 modification (items[1].name)"
};

// ============================================================================
// Test Case 5: Complete JSON Structure
// ============================================================================

export const test5_complexStructure = {
  name: "Complex Structure - Real-world API response",
  source: {
    status: "success",
    timestamp: "2024-01-15T10:30:00Z",
    data: {
      userId: 101,
      user: {
        name: "Alice Johnson",
        email: "alice@example.com",
        roles: ["admin", "user"],
        metadata: {
          loginCount: 25,
          lastLogin: "2024-01-15T09:00:00Z",
          preferences: {
            theme: "dark",
            language: "en"
          }
        }
      },
      permissions: {
        canEdit: true,
        canDelete: false,
        scopes: ["read", "write"]
      }
    }
  },
  target: {
    status: "success",
    timestamp: "2024-01-15T10:45:00Z",  // Modified but might be ignored
    data: {
      userId: 101,
      user: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",  // Modified
        roles: ["admin", "user", "moderator"],  // Added moderator
        metadata: {
          loginCount: 26,  // Modified
          lastLogin: "2024-01-15T09:00:00Z",
          preferences: {
            theme: "light",  // Modified
            language: "en",
            timezone: "UTC"  // Added
          }
        }
      },
      permissions: {
        canEdit: true,
        canDelete: true,  // Modified
        scopes: ["read", "write", "delete"]  // Added delete
      }
    }
  },
  expectedDiffs: 6,
  ignoreKeys: ["timestamp"],  // Ignore timestamp changes
  description: "Real-world case with email change, role addition, preference changes, permission modification"
};

// ============================================================================
// Test Case 6: Large Array with Objects
// ============================================================================

export const test6_largeArrays = {
  name: "Large Arrays - Multiple object changes",
  source: {
    products: [
      {
        id: "prod-001",
        name: "Laptop",
        price: 999.99,
        inStock: true,
        tags: ["electronics", "computers"]
      },
      {
        id: "prod-002",
        name: "Mouse",
        price: 29.99,
        inStock: true,
        tags: ["electronics", "peripherals"]
      },
      {
        id: "prod-003",
        name: "Keyboard",
        price: 79.99,
        inStock: false,
        tags: ["electronics", "peripherals"]
      }
    ]
  },
  target: {
    products: [
      {
        id: "prod-001",
        name: "Laptop",
        price: 1099.99,  // Price increased
        inStock: true,
        tags: ["electronics", "computers"],
        discount: 0.1  // New field
      },
      {
        id: "prod-002",
        name: "Mouse",
        price: 29.99,
        inStock: true,
        tags: ["electronics", "peripherals"]
      },
      {
        id: "prod-003",
        name: "Keyboard",
        price: 79.99,
        inStock: true,  // Changed to in stock
        tags: ["electronics", "peripherals"]
      }
    ]
  },
  expectedDiffs: 3,
  description: "Price modification, new discount field, stock status change"
};

// ============================================================================
// Test Case 7: Deletions and Additions
// ============================================================================

export const test7_deletionsAndAdditions = {
  name: "Deletions and Additions",
  source: {
    config: {
      apiKey: "secret-key-123",
      debug: true,
      logLevel: "debug",
      timeout: 30000,
      retries: 3
    }
  },
  target: {
    config: {
      apiKey: "secret-key-123",
      debug: false,  // Modified
      // logLevel removed
      timeout: 60000,  // Modified
      retries: 5,  // Modified
      environment: "production",  // Added
      version: "2.0"  // Added
    }
  },
  expectedDiffs: 6,
  description: "4 modifications (debug, timeout, retries), 1 removal (logLevel), 2 additions (environment, version)"
};

// ============================================================================
// Test Case 8: Empty Objects and Arrays
// ============================================================================

export const test8_emptyStructures = {
  name: "Empty Structures",
  source: {
    data: {},
    items: [],
    nested: {
      empty: {},
      values: []
    }
  },
  target: {
    data: { key: "value" },  // Was empty, now has data
    items: [1, 2, 3],  // Was empty, now has items
    nested: {
      empty: {},
      values: [{ id: 1 }]  // Was empty
    }
  },
  expectedDiffs: 3,
  description: "Additions to previously empty structures"
};

// ============================================================================
// Test Case 9: Special Values
// ============================================================================

export const test9_specialValues = {
  name: "Special Values - null, undefined, booleans",
  source: {
    nullValue: null,
    undefinedValue: undefined,
    emptyString: "",
    zero: 0,
    falseValue: false,
    trueValue: true
  },
  target: {
    nullValue: undefined,  // null vs undefined
    undefinedValue: null,  // undefined vs null
    emptyString: "0",  // empty vs "0"
    zero: false,  // 0 vs false
    falseValue: null,  // false vs null
    trueValue: 1  // true vs 1
  },
  expectedDiffs: 6,
  description: "All special values are different types and should be flagged"
};

// ============================================================================
// Test Case 10: Deeply Nested with Ignore List
// ============================================================================

export const test10_ignoreList = {
  name: "Ignore List - Excluding timestamp and id fields",
  source: {
    user: {
      id: "user-001",  // Should be ignored
      name: "Bob",
      email: "bob@example.com",
      createdAt: "2024-01-10",  // Should be ignored
      metadata: {
        id: "meta-001",  // Should be ignored
        views: 100
      }
    }
  },
  target: {
    user: {
      id: "user-999",  // Changed but ignored
      name: "Robert",  // This change should be detected
      email: "bob@example.com",
      createdAt: "2024-01-15",  // Changed but ignored
      metadata: {
        id: "meta-999",  // Changed but ignored
        views: 150
      }
    }
  },
  ignoreKeys: ["id", "createdAt"],
  expectedDiffs: 2,
  description: "With ignore list, only 2 changes detected (name and views), not the id and timestamp changes"
};

// ============================================================================
// All Test Cases Collection
// ============================================================================

export const allTestCases = [
  test1_keyOrder,
  test2_typeStrictness,
  test3_nestedObjects,
  test4_arrays,
  test5_complexStructure,
  test6_largeArrays,
  test7_deletionsAndAdditions,
  test8_emptyStructures,
  test9_specialValues,
  test10_ignoreList
];

// ============================================================================
// Utility: Format Test Case for Display
// ============================================================================

export const formatTestCase = (testCase) => {
  return {
    name: testCase.name,
    source: JSON.stringify(testCase.source, null, 2),
    target: JSON.stringify(testCase.target, null, 2),
    expectedDiffs: testCase.expectedDiffs,
    ignoreKeys: testCase.ignoreKeys || "none",
    description: testCase.description
  };
};

// ============================================================================
// Utility: Get Test Case by Index
// ============================================================================

export const getTestCase = (index) => {
  if (index >= 0 && index < allTestCases.length) {
    return allTestCases[index];
  }
  return null;
};

// ============================================================================
// Utility: Run All Tests
// ============================================================================

export const runAllTests = (diffEngine) => {
  const results = [];
  
  allTestCases.forEach((testCase, index) => {
    const ignoreList = testCase.ignoreKeys 
      ? testCase.ignoreKeys.split(",").map(k => k.trim())
      : [];
    
    const diffs = diffEngine.deepDiffObjects(
      testCase.source,
      testCase.target,
      ignoreList
    );
    
    const actualDiffs = diffs.filter(d => d.type !== "ignored").length;
    const passed = actualDiffs === testCase.expectedDiffs;
    
    results.push({
      testNumber: index + 1,
      testName: testCase.name,
      expectedDiffs: testCase.expectedDiffs,
      actualDiffs: actualDiffs,
      passed: passed,
      status: passed ? "✅ PASS" : "❌ FAIL"
    });
  });
  
  return results;
};

// ============================================================================
// Quick Start Examples
// ============================================================================

export const quickStartExamples = {
  simple: {
    description: "Simple key comparison",
    source: '{"a": 1, "b": 2}',
    target: '{"b": 2, "a": 1}'
  },
  
  typeChange: {
    description: "Type change detection",
    source: '{"value": 123}',
    target: '{"value": "123"}'
  },
  
  nested: {
    description: "Nested object change",
    source: '{"user":{"name":"John","age":30}}',
    target: '{"user":{"name":"John","age":31}}'
  },
  
  array: {
    description: "Array modification",
    source: '{"items":[1,2,3]}',
    target: '{"items":[1,2,3,4]}'
  },
  
  complex: {
    description: "Complex real-world example",
    source: '{"id":1,"name":"Product","price":99.99,"tags":["a","b"],"metadata":{"created":"2024-01-10","views":100}}',
    target: '{"id":1,"name":"Product Updated","price":89.99,"tags":["a","b","c"],"metadata":{"created":"2024-01-10","views":150}}'
  }
};

export default allTestCases;
