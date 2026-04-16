/**
 * Example Test Cases for Key Comparison Feature
 * Copy-paste these into the comparator to test the feature
 */

// ============================================================================
// EXAMPLE 1: Safe Addition (New Fields)
// ============================================================================

// PRODUCTION (Source)
const productionExample1 = {
  components: [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name"
    },
    {
      type: "textfield",
      key: "lastName",
      label: "Last Name"
    },
    {
      type: "textfield",
      key: "email",
      label: "Email Address"
    }
  ]
};

// SANDBOX (Target) - Added phone field
const sandboxExample1 = {
  components: [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name"
    },
    {
      type: "textfield",
      key: "lastName",
      label: "Last Name"
    },
    {
      type: "textfield",
      key: "email",
      label: "Email Address"
    },
    {
      type: "textfield",
      key: "phone",
      label: "Phone Number"
    }
  ]
};

// EXPECTED RESULT:
// ✅ New Keys: phone
// Safe to proceed with deployment

// ============================================================================
// EXAMPLE 2: Dangerous Removal
// ============================================================================

// PRODUCTION (Source)
const productionExample2 = {
  components: [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name"
    },
    {
      type: "textfield",
      key: "lastName",
      label: "Last Name"
    },
    {
      type: "textfield",
      key: "email",
      label: "Email Address"
    }
  ]
};

// SANDBOX (Target) - Removed lastName field
const sandboxExample2 = {
  components: [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name"
    },
    {
      type: "textfield",
      key: "email",
      label: "Email Address"
    }
  ]
};

// EXPECTED RESULT:
// ⛔ Removed Keys: lastName
// CRITICAL ISSUE - Must restore field before deployment

// ============================================================================
// EXAMPLE 3: Label Changes
// ============================================================================

// PRODUCTION (Source)
const productionExample3 = {
  components: [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name"
    },
    {
      type: "textfield",
      key: "email",
      label: "Email Address"
    }
  ]
};

// SANDBOX (Target) - Changed email label
const sandboxExample3 = {
  components: [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name"
    },
    {
      type: "textfield",
      key: "email",
      label: "Email (Required)"
    }
  ]
};

// EXPECTED RESULT:
// ⚠️ Label Changed: email
// Old: "Email Address" → New: "Email (Required)"
// Review and confirm intentional change

// ============================================================================
// EXAMPLE 4: Nested Components (Complex Structure)
// ============================================================================

// PRODUCTION (Source)
const productionExample4 = {
  components: [
    {
      type: "fieldset",
      label: "Address Information",
      components: [
        {
          type: "textfield",
          key: "street",
          label: "Street Address"
        },
        {
          type: "textfield",
          key: "city",
          label: "City"
        }
      ]
    },
    {
      type: "columns",
      columns: [
        {
          components: [
            {
              type: "textfield",
              key: "state",
              label: "State"
            }
          ]
        },
        {
          components: [
            {
              type: "textfield",
              key: "zip",
              label: "ZIP Code"
            }
          ]
        }
      ]
    }
  ]
};

// SANDBOX (Target) - Added country field, removed zip
const sandboxExample4 = {
  components: [
    {
      type: "fieldset",
      label: "Address Information",
      components: [
        {
          type: "textfield",
          key: "street",
          label: "Street Address"
        },
        {
          type: "textfield",
          key: "city",
          label: "City"
        },
        {
          type: "textfield",
          key: "country",
          label: "Country"
        }
      ]
    },
    {
      type: "columns",
      columns: [
        {
          components: [
            {
              type: "textfield",
              key: "state",
              label: "State"
            }
          ]
        }
      ]
    }
  ]
};

// EXPECTED RESULT:
// ⛔ Removed Keys: zip
// ✅ New Keys: country

// ============================================================================
// EXAMPLE 5: No Changes (All Keys Match)
// ============================================================================

// PRODUCTION (Source)
const productionExample5 = {
  components: [
    {
      type: "textfield",
      key: "name",
      label: "Full Name"
    },
    {
      type: "select",
      key: "department",
      label: "Department"
    }
  ]
};

// SANDBOX (Target) - Same keys and labels, only values differ
const sandboxExample5 = {
  components: [
    {
      type: "textfield",
      key: "name",
      label: "Full Name",
      defaultValue: "John Doe"  // Only value differs
    },
    {
      type: "select",
      key: "department",
      label: "Department",
      data: { values: [{ label: "HR" }] }  // Different data
    }
  ]
};

// EXPECTED RESULT:
// ✓ All keys are safe - no removed or renamed keys detected
// Safe to proceed

// ============================================================================
// HOW TO USE THESE EXAMPLES:
// ============================================================================
// 1. Copy a PRODUCTION example (e.g., productionExample1)
// 2. Stringify it: JSON.stringify(productionExample1, null, 2)
// 3. Paste into the "Production JSON" field
// 4. Copy a SANDBOX example (e.g., sandboxExample1)
// 5. Stringify it: JSON.stringify(sandboxExample1, null, 2)
// 6. Paste into the "Sandbox JSON" field
// 7. Click "Compare JSONs"
// 8. Check the "Key Analysis" panel for results

export {
  productionExample1,
  sandboxExample1,
  productionExample2,
  sandboxExample2,
  productionExample3,
  sandboxExample3,
  productionExample4,
  sandboxExample4,
  productionExample5,
  sandboxExample5
};

// ============================================================================
// QUICK TEST STRINGS (Copy-paste ready):
// ============================================================================

// Production JSON (Example 1)
// {"components":[{"type":"textfield","key":"firstName","label":"First Name"},{"type":"textfield","key":"lastName","label":"Last Name"},{"type":"textfield","key":"email","label":"Email Address"}]}

// Sandbox JSON (Example 1)
// {"components":[{"type":"textfield","key":"firstName","label":"First Name"},{"type":"textfield","key":"lastName","label":"Last Name"},{"type":"textfield","key":"email","label":"Email Address"},{"type":"textfield","key":"phone","label":"Phone Number"}]}
