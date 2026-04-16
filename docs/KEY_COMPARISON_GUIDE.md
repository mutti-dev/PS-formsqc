# Key Comparison Feature - Documentation

## Overview
The Key Comparison feature analyzes the structural integrity of your form JSON when migrating between sandbox and production environments. It detects three critical types of issues:

## Features

### 1. **Removed Keys** ⛔ (DANGER - Must Address)
- **What it detects:** Keys that exist in production but have been removed from sandbox
- **Why it matters:** This indicates data loss risk - existing form fields are being deleted
- **Action Required:** Restore removed keys or confirm intentional deletion

### 2. **Label Changes** ⚠️ (WARNING - Review)
- **What it detects:** Keys that exist in both versions but have different labels
- **Why it matters:** Label changes might indicate field renames or updates
- **Action:** Verify if label changes are intentional

### 3. **New Keys** ✅ (OK - Safe)
- **What it detects:** New keys added in sandbox that don't exist in production
- **Why it matters:** Adding new fields is safe and expected during development
- **Action:** Safe to proceed with deployment

## How It Works

The feature compares the form structure by:
1. Extracting all `key` and `label` properties from form components (recursively traverses nested components)
2. Comparing keys from **Production JSON** (source) vs **Sandbox JSON** (target)
3. Categorizing differences into above three types
4. Displaying results with clear visual indicators

## Data Structure Expected

The JSON should have components with the following structure:

```json
{
  "components": [
    {
      "type": "textfield",
      "key": "firstName",
      "label": "First Name",
      "components": [
        // nested components
      ]
    },
    {
      "type": "columns",
      "columns": [
        {
          "components": [
            {
              "key": "lastName",
              "label": "Last Name"
            }
          ]
        }
      ]
    }
  ]
}
```

## Using the Comparator

1. **Production JSON** (left): Paste your current production form JSON
2. **Sandbox JSON** (right): Paste your updated sandbox form JSON
3. Click **"Compare JSONs"**
4. Review the **Key Analysis** section that appears at the top of results

## UI Elements

- **Red boxes with ⛔:** Removed keys - critical issues
- **Yellow boxes with ⚠️:** Changed labels - review changes
- **Green boxes with ✅:** New keys - safe additions
- **Badges:** Quick visual status indicators
- **Alert messages:** Actionable guidance for each category

## Example Scenarios

### Scenario 1: Safe Addition
```
Production: {firstName, lastName, email}
Sandbox:    {firstName, lastName, email, phone}

Result: ✅ New Key: phone
Action: Safe to deploy
```

### Scenario 2: Dangerous Removal
```
Production: {firstName, lastName, email}
Sandbox:    {firstName, email}

Result: ⛔ Removed Key: lastName
Action: MUST restore or confirm deletion
```

### Scenario 3: Label Update
```
Production: {firstName, label: "First Name"}
Sandbox:    {firstName, label: "Client First Name"}

Result: ⚠️ Label Changed: "First Name" → "Client First Name"
Action: Review and confirm intentional change
```

## Integration with Diff Engine

The key comparison runs **before** the standard JSON diff viewer, allowing you to catch structural issues first. Even if JSON values match, key changes will be highlighted.

## API Reference

### `compareFormKeys(sandboxForm, productionForm)`
Main function to compare form structures.

**Returns:**
```js
{
  removedKeys: [      // Keys in production but not in sandbox
    { key, oldLabel, issue }
  ],
  addedKeys: [        // Keys in sandbox but not in production
    { key, newLabel, issue }
  ],
  changedKeys: [      // Same key but different label
    { key, oldLabel, newLabel, issue }
  ]
}
```

### `extractKeysAndLabels(formObj)`
Extracts all keys and their labels from a form JSON.

**Returns:**
```js
{
  "key1": "Label 1",
  "key2": "Label 2"
}
```

### `detectPotentialRenames(prodKeys, sandboxKeys)`
Advanced feature to detect if a key was renamed (same label, different key name).

**Returns:**
```js
[
  { oldKey, newKey, label, issue: "Key renamed (same label)" }
]
```

## Tips

1. **Always check the Key Analysis first** before reviewing detailed diffs
2. **Red warnings are mandatory** - remove keys must be addressed
3. **Yellow warnings are informational** - review but usually safe
4. **Green items are excellent** - new fields without risk
5. **Run comparisons regularly** to catch structural changes early in development

## Common Patterns

- ✅ Adding new fields → Safe, proceed with deployment
- ⛔ Removing fields → Critical, must resolve before deployment
- ⚠️ Renaming field labels → Review with stakeholders
- ⚠️ Reordering fields → Safe (position doesn't matter for keys)

---

**Note:** This feature is designed for form JSON structures where fields have `key` properties. If your JSON uses different naming conventions (e.g., `name` instead of `key`), the code can be customized.
