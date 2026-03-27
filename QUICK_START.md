# Quick Start Guide - Advanced JSON Comparator

## 🚀 5-Minute Setup

### Step 1: Access the Component
Navigate to your app and click **"JSON Comparator Pro"** in the sidebar, or visit:
```
http://localhost:3000/AdvancedJSONComparator
```

### Step 2: Copy a Test Case
Choose one of the examples below and paste into the Source and Target fields.

### Step 3: Click "Compare JSONs"
See the summary dashboard appear with statistics.

### Step 4: Explore Results
- Use Tree View to navigate hierarchically
- Switch to List View for a flat list
- Click arrows in Tree View to expand/collapse
- Hover over differences to see full paths

---

## 📋 Quick Test Cases

### Test Case 1: Simple Property Change

**Source:**
```json
{
  "user": "John",
  "email": "john@example.com",
  "active": true
}
```

**Target:**
```json
{
  "user": "John",
  "email": "john.doe@example.com",
  "active": true
}
```

**Expected Result:**
- 🟡 1 Modification: `root.email` changed from "john@example.com" to "john.doe@example.com"

---

### Test Case 2: Key Order (No Differences)

**Source:**
```json
{
  "id": 1,
  "name": "Product A",
  "price": 99.99
}
```

**Target:**
```json
{
  "price": 99.99,
  "name": "Product A",
  "id": 1
}
```

**Expected Result:**
- ✅ No differences (keys reordered, but content identical)

---

### Test Case 3: Adding New Fields

**Source:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Target:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1-555-0123"
}
```

**Expected Result:**
- 🟢 2 Additions:
  - `root.email` → "jane@example.com"
  - `root.phoneNumber` → "+1-555-0123"

---

### Test Case 4: Type Change (Strictness)

**Source:**
```json
{
  "userId": 12345,
  "isAdmin": true,
  "count": 100
}
```

**Target:**
```json
{
  "userId": "12345",
  "isAdmin": "true",
  "count": "100"
}
```

**Expected Result:**
- 🟡 3 Modifications (type changes):
  - `root.userId`: number (12345) → string ("12345")
  - `root.isAdmin`: boolean (true) → string ("true")
  - `root.count`: number (100) → string ("100")

---

### Test Case 5: Array Changes

**Source:**
```json
{
  "tags": ["javascript", "react"],
  "scores": [85, 90, 88]
}
```

**Target:**
```json
{
  "tags": ["javascript", "react", "typescript"],
  "scores": [85, 90, 88, 92, 87]
}
```

**Expected Result:**
- 🟢 3 Additions:
  - `root.tags[2]` → "typescript"
  - `root.scores[3]` → 92
  - `root.scores[4]` → 87

---

### Test Case 6: Nested Objects

**Source:**
```json
{
  "user": {
    "profile": {
      "name": "Alice",
      "age": 30
    },
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  }
}
```

**Target:**
```json
{
  "user": {
    "profile": {
      "name": "Alice",
      "age": 31,
      "location": "New York"
    },
    "settings": {
      "theme": "light",
      "notifications": true
    }
  }
}
```

**Expected Result:**
- 🟡 2 Modifications:
  - `root.user.profile.age`: 30 → 31
  - `root.user.settings.theme`: "dark" → "light"
- 🟢 1 Addition:
  - `root.user.profile.location` → "New York"

---

### Test Case 7: Removing Fields

**Source:**
```json
{
  "name": "Product",
  "description": "Old product",
  "price": 99.99,
  "stock": 50
}
```

**Target:**
```json
{
  "name": "Product",
  "price": 99.99
}
```

**Expected Result:**
- 🔴 2 Removals:
  - `root.description` (removed)
  - `root.stock` (removed)

---

### Test Case 8: Complex Real-World API

**Source:**
```json
{
  "status": "success",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "userId": 101,
    "user": {
      "name": "Bob Johnson",
      "email": "bob@example.com",
      "roles": ["user", "editor"]
    },
    "metadata": {
      "createdAt": "2023-01-01T00:00:00Z",
      "lastUpdated": "2024-01-15T09:00:00Z"
    }
  }
}
```

**Target:**
```json
{
  "status": "success",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "userId": 101,
    "user": {
      "name": "Robert Johnson",
      "email": "bob.johnson@example.com",
      "roles": ["user", "editor", "admin"]
    },
    "metadata": {
      "createdAt": "2023-01-01T00:00:00Z",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Expected Result:**
- 🟡 4 Modifications:
  - `root.timestamp`
  - `root.data.user.name`
  - `root.data.user.email`
  - `root.data.metadata.lastUpdated`
- 🟢 1 Addition:
  - `root.data.user.roles[2]` → "admin"

**With Ignore List:**
If you add to the ignore list: `timestamp, createdAt, lastUpdated`
- Only 3 differences will be shown (name, email, and roles)

---

## 🎯 Using Ignore Keys

### Setup

1. In the **"Ignore Keys"** field, type:
   ```
   timestamp, id, uuid, createdAt, updatedAt, _updated, _created
   ```

2. Click **"Compare JSONs"**

### Common Keys to Ignore

| Key | Use Case |
|-----|----------|
| `timestamp` | Time fields that change constantly |
| `id`, `uuid` | System-generated identifiers |
| `createdAt`, `updatedAt` | Temporal tracking |
| `_id`, `_rev` | Database metadata |
| `version` | Auto-incremented versions |
| `hash`, `checksum` | Computed values |

### Example: Ignore Keys

**Source:**
```json
{
  "id": "user-001",
  "name": "Alice",
  "email": "alice@example.com",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Target:**
```json
{
  "id": "user-999",
  "name": "Alice Updated",
  "email": "alice@example.com",
  "timestamp": "2024-01-15T11:00:00Z"
}
```

**Without Ignore List:**
- 🟡 2 Modifications:
  - `root.id`: "user-001" → "user-999"
  - `root.name`: "Alice" → "Alice Updated"
  - `root.timestamp`: "2024-01-15T10:00:00Z" → "2024-01-15T11:00:00Z"

**With Ignore List `[id, timestamp]`:**
- 🟡 1 Modification:
  - `root.name`: "Alice" → "Alice Updated"

---

## 📊 Interpreting Results

### Summary Dashboard

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   ➕ Added  │  │ ❌ Removed  │  │ ✏️ Modified │  │ 📊 Total     │
│      5      │  │      2      │  │      3      │  │      10      │
└─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘
```

- **Added**: New keys/values in target
- **Removed**: Keys/values deleted from source
- **Modified**: Values changed but key exists
- **Total**: Sum of all changes

### Tree View Symbols

| Symbol | Meaning |
|--------|---------|
| `▶` | Collapsed node (click to expand) |
| `▼` | Expanded node (click to collapse) |
| `+5` | 5 additions in this branch |
| `-2` | 2 removals in this branch |
| `~3` | 3 modifications in this branch |

### Color Indicators

| Color | Meaning | Background |
|-------|---------|-----------|
| 🟢 Green | Added | Light green |
| 🔴 Red | Removed | Light red |
| 🟡 Yellow | Modified | Light yellow |
| 🟣 Purple | Ignored | Light purple |

### Value Display

```
Path: root.user.profile.age
From: number (30)
To: number (31)
Type: Both numbers, but different values
```

---

## 💡 Tips & Tricks

### Tip 1: Use Preview Mode
Before committing ignore list changes, do a test comparison:
1. Compare without ignore list
2. Note the differences
3. Then update ignore list
4. Compare again to verify

### Tip 2: Find Hidden Changes
Switch between Tree and List views:
- **Tree View**: See structure and navigate nested changes
- **List View**: See all changes in order, easier to count

### Tip 3: Debug Type Issues
If seeing unexpected modifications:
1. Check the type badges (string, number, object, etc.)
2. Remember: `100 ≠ "100"` (number vs string)
3. Use browser console to verify types: `typeof value`

### Tip 4: Handle Large Files
For large JSON files:
1. Use Tree View instead of List
2. Collapse nodes you're not interested in
3. Use ignore list to reduce diff count
4. Consider splitting file into sections

### Tip 5: Verify JSON Before Comparing
If you get "Invalid JSON" error:
1. Use the JSONFormatter tool first
2. Check for trailing commas
3. Verify all quotes are double quotes `"`
4. Check brackets and braces match

---

## ❓ FAQ

### Q: Why is `100` different from `"100"`?
**A:** Type strictness by design. JSON should maintain type consistency. Use ignore list if this is expected.

### Q: Can I compare arrays in different order?
**A:** Array comparison is by index (0, 1, 2...). Different order = different elements. Consider sorting first.

### Q: What about null vs undefined?
**A:** They are treated as different. `null` is a JSON value, `undefined` is not.

### Q: Can I save the diff results?
**A:** Currently, you can take screenshots or copy values. Export feature planned for future.

### Q: How do I handle circular references?
**A:** JSON doesn't support circular references. If needed, remove circular refs before comparing.

### Q: Can I compare more than 2 files?
**A:** Currently supports 2 files (source vs target). Compare first 2, then compare result with third.

### Q: Is comparison case-sensitive?
**A:** Yes. `"Name"` ≠ `"name"`. Keys and string values are case-sensitive.

### Q: What's the maximum file size?
**A:** No hard limit, but for best performance keep under 1MB of JSON.

---

## 🔗 Next Steps

### Want to Learn More?
- Read: [ADVANCED_JSON_COMPARATOR.md](./ADVANCED_JSON_COMPARATOR.md) - Complete documentation
- Read: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details
- Read: [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md) - For developers

### Want to Use in Code?
```javascript
import { deepDiffObjects, calculateSummary } from './utils/jsonDiffEngine';

const diffs = deepDiffObjects(
  source_object,
  target_object,
  ['timestamp', 'id'],  // Ignore list
  'root'                // Starting path
);

const stats = calculateSummary(diffs);
console.log(`Added: ${stats.added}, Removed: ${stats.removed}, Modified: ${stats.modified}`);
```

### Want to Extend?
See [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md) for:
- Adding new features
- Custom comparison rules
- Export functionality
- Performance optimization

---

## 🎓 Learning Path

```
1. START HERE
   ↓
2. Try simple test cases (Test Case 1-3)
   ↓
3. Understand key order agnosticism
   ↓
4. Learn type strictness (Test Case 4)
   ↓
5. Explore nested structures (Test Case 6)
   ↓
6. Master the ignore list
   ↓
7. Try real-world examples (Test Case 8)
   ↓
8. Read full documentation for advanced features
```

---

## 🐛 Troubleshooting Quick Links

- **"Invalid JSON" error** → Use JSONFormatter first
- **Unexpected modifications** → Check Type badges
- **Performance issues** → Try List View instead
- **Ignore list not working** → Check spelling and commas
- **Can't find a difference** → Switch views (Tree ↔ List)

---

## 📞 Help & Support

For detailed information, refer to:
- User Guide: [ADVANCED_JSON_COMPARATOR.md](./ADVANCED_JSON_COMPARATOR.md)
- Technical Docs: [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md)
- Project Summary: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Ready to compare JSON? Start with Test Case 1 above!** 🚀

*Happy comparing!*
