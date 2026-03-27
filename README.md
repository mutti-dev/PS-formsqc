# PS-formsqc - Form QC & JSON Comparison Tool

Advanced form quality control and JSON comparison utilities built with React.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Advanced JSON Comparator](#advanced-json-comparator)
5. [API Reference](#api-reference)
6. [Architecture](#architecture)
7. [Performance](#performance)
8. [Development](#development)
9. [FAQ](#faq)

---

## Quick Start

### Node Setup

In the project directory, you can run:

#### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view in your browser. The page reloads when you make changes.

#### `npm test`

Launches the test runner in interactive watch mode.

#### `npm run build`

Builds the app for production to the `build` folder. Bundles React correctly and optimizes for best performance.

---

## Features

### 1. Advanced JSON Comparator 🔍

A high-performance semantic JSON comparison engine with professional UI.

**Access**: Menu → "JSON Comparator Pro" or navigate to `/AdvancedJSONComparator`

#### Key Capabilities:
- ✅ **Semantic-aware**: `{"a": 1, "b": 2}` ≡ `{"b": 2, "a": 1}` (key order agnostic)
- ✅ **Deep diffing**: Recursive comparison of nested objects and arrays
- ✅ **Type strictness**: `100 ≠ "100"` (number vs string flagged as different)
- ✅ **Configurable ignore list**: Exclude specific keys from comparison
- ✅ **JSONPath tracking**: Full path notation for each difference
- ✅ **Tree navigation**: Collapse/expand nested nodes
- ✅ **Summary dashboard**: Real-time statistics (Added, Removed, Modified, Total)
- ✅ **Color indicators**: Green (added), Red (removed), Yellow (modified)
- ✅ **Dual view modes**: Tree view (hierarchical) and List view (flat)
- ✅ **Dark/Light themes**: Auto-detects system preference
- ✅ **Responsive design**: Mobile to desktop
- ✅ **Performance optimized**: O(n) algorithm with memoization

### 2. Other Tools

- Form Review (JSONExtractor)
- Form Comparator
- Word Converter
- API Maker (TextConverter)
- JSON Formatter

---

## Project Structure

```
PS-formsqc/
├── src/
│   ├── App.js                                    # Main app component
│   ├── common/
│   │   ├── AdvancedJSONComparator.jsx           # JSON comparison component
│   │   ├── AdvancedJSONComparator.css           # Component styling
│   │   ├── DiffViewer.jsx
│   │   ├── LineNumberedInput.jsx
│   │   ├── SearchBar.jsx
│   │   ├── SideDrawer.jsx
│   │   ├── ThemeChange.jsx
│   │   └── sections/
│   ├── screens/
│   │   ├── FormComparator.js
│   │   ├── JSONExtractor.js
│   │   ├── JSONFormatter.js
│   │   ├── TextConverter.js
│   │   └── WordConverter.js
│   └── utils/
│       ├── jsonDiffEngine.js                    # Core comparison logic
│       ├── jsonComparatorTestCases.js           # Test cases & examples
│       ├── exportUtils.js
│       ├── formComparatorUtil.js
│       ├── jsonUtils.js
│       └── utils.js
├── public/
├── build/
├── package.json
└── README.md
```

---

## Advanced JSON Comparator

### 5-Minute Setup

1. **Access**: Click "JSON Comparator Pro" in sidebar or visit `/AdvancedJSONComparator`
2. **Input**: Paste Source JSON (original) and Target JSON (modified)
3. **Configure** (optional): Add ignore keys (comma-separated)
4. **Compare**: Click "Compare JSONs"
5. **Explore**: Use Tree/List views to navigate results

### Quick Test Cases

#### Test Case 1: Simple Property Change
```json
// Source
{ "user": "John", "email": "john@example.com", "active": true }

// Target
{ "user": "John", "email": "john.doe@example.com", "active": true }

// Result: 🟡 1 Modification (email changed)
```

#### Test Case 2: Key Order (No Differences)
```json
// Source
{ "id": 1, "name": "Product A", "price": 99.99 }

// Target
{ "price": 99.99, "name": "Product A", "id": 1 }

// Result: ✅ No differences (semantic equivalence)
```

#### Test Case 3: Adding Fields
```json
// Source
{ "firstName": "Jane", "lastName": "Smith" }

// Target
{ "firstName": "Jane", "lastName": "Smith", "email": "jane@example.com" }

// Result: 🟢 1 Addition (email added)
```

#### Test Case 4: Type Change
```json
// Source
{ "userId": 12345, "isAdmin": true }

// Target
{ "userId": "12345", "isAdmin": "true" }

// Result: 🟡 2 Modifications (type changes: number→string, boolean→string)
```

#### Test Case 5: Array Changes
```json
// Source
{ "tags": ["javascript", "react"], "scores": [85, 90, 88] }

// Target
{ "tags": ["javascript", "react", "typescript"], "scores": [85, 90, 88, 92] }

// Result: 🟢 2 Additions (tags[2], scores[3])
```

#### Test Case 6: Nested Objects
```json
// Source
{ "user": { "profile": { "name": "Alice", "age": 30 } } }

// Target
{ "user": { "profile": { "name": "Alice", "age": 31, "location": "NYC" } } }

// Result: 🟡 1 Modification (age), 🟢 1 Addition (location)
```

#### Test Case 7: Removing Fields
```json
// Source
{ "name": "Product", "description": "Old", "price": 99.99, "stock": 50 }

// Target
{ "name": "Product", "price": 99.99 }

// Result: 🔴 2 Removals (description, stock)
```

#### Test Case 8: Real-World API
```json
// Source
{
  "status": "success",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "user": { "name": "Bob", "email": "bob@example.com", "roles": ["user"] },
    "metadata": { "createdAt": "2023-01-01T00:00:00Z", "lastUpdated": "2024-01-15T09:00:00Z" }
  }
}

// Target
{
  "status": "success",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "user": { "name": "Robert", "email": "bob.johnson@example.com", "roles": ["user", "admin"] },
    "metadata": { "createdAt": "2023-01-01T00:00:00Z", "lastUpdated": "2024-01-15T10:30:00Z" }
  }
}

// Result: 3 Modifications (name, email, lastUpdated), 1 Addition (roles[1])
// With ignore list [timestamp, createdAt, lastUpdated]: Only 2 changes shown
```

### Using Ignore Keys

```
1. In "Ignore Keys" field: timestamp, id, uuid, createdAt, updatedAt
2. Click "Compare JSONs"
3. Specified keys will be excluded from comparison
```

**Common keys to ignore:**
| Key | Purpose |
|-----|---------|
| `timestamp`, `createdAt`, `updatedAt` | Time tracking |
| `id`, `uuid`, `userId` | Identifiers |
| `_id`, `_rev` | Database metadata |
| `version` | Version numbers |
| `hash`, `checksum` | Computed values |

### Interpreting Results

#### Summary Dashboard
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   ➕ Added  │  │ ❌ Removed  │  │ ✏️ Modified │  │ 📊 Total     │
│      5      │  │      2      │  │      3      │  │      10      │
└─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘
```

#### Color Indicators
- 🟢 **Green**: Added keys/values
- 🔴 **Red**: Removed keys/values
- 🟡 **Yellow**: Modified values
- 🟣 **Purple**: Ignored keys

#### Tree View Symbols
- `▶` = Collapsed node (click to expand)
- `▼` = Expanded node (click to collapse)
- `+5` = 5 additions in this branch
- `-2` = 2 removals in this branch
- `~3` = 3 modifications in this branch

---

## API Reference

### Core Comparison Engine

Located in: `src/utils/jsonDiffEngine.js`

#### `deepDiffObjects(source, target, ignoreList, path)`

Performs deep semantic comparison between two objects.

**Parameters:**
```javascript
source (object)     // Original/source JSON
target (object)     // Modified/target JSON
ignoreList (array)  // Keys to exclude from comparison
path (string)       // Starting JSONPath (default: "root")
```

**Returns:**
```javascript
[
  {
    type: "added|removed|modified",
    path: "root.users[0].email",
    source: originalValue,
    target: newValue,
    sourceType: "string|number|etc",
    targetType: "string|number|etc"
  },
  ...
]
```

**Example:**
```javascript
import { deepDiffObjects, calculateSummary } from './utils/jsonDiffEngine';

const source = { id: 1, name: "Alice", email: "alice@old.com" };
const target = { id: 1, name: "Alice", email: "alice@new.com" };
const ignoreList = ["id"]; // Don't compare id

const diffs = deepDiffObjects(source, target, ignoreList);
const stats = calculateSummary(diffs);

console.log(stats);
// { added: 0, removed: 0, modified: 1, ignored: 1, total: 1 }
```

#### `parseJSONSafe(str)`

Safely parses JSON with error handling.

**Returns:**
```javascript
{
  success: boolean,
  data: object|null,
  error: string|null
}
```

#### `buildDiffTree(diffs)`

Converts flat diff array into hierarchical tree structure.

**Returns:**
```javascript
{
  path: "root",
  type: "root",
  children: [...],
  diffs: [...],
  stats: { added: 5, removed: 2, modified: 3, total: 10 }
}
```

#### `calculateSummary(diffs)`

Calculates statistics from differences.

**Returns:**
```javascript
{
  added: 5,
  removed: 2,
  modified: 3,
  ignored: 1,
  total: 10
}
```

### React Component

#### `<AdvancedJSONComparator theme="dark" />`

**Props:**
- `theme` (string): "dark" or "light" (optional, default: "dark")

**Usage:**
```javascript
import AdvancedJSONComparator from './common/AdvancedJSONComparator';

export default function App() {
  return <AdvancedJSONComparator theme={isDarkMode ? 'dark' : 'light'} />;
}
```

---

## Architecture

### Layered Design

```
┌─────────────────────────────────────────────────┐
│           User Interface Layer                   │
│   (AdvancedJSONComparator.jsx + CSS)            │
├─────────────────────────────────────────────────┤
│           Component Logic Layer                  │
│   (useState, useCallback, useMemo)              │
├─────────────────────────────────────────────────┤
│           Business Logic Layer                   │
│   (jsonDiffEngine.js - pure functions)          │
├─────────────────────────────────────────────────┤
│           Utility Layer                          │
│   (Tree building, value formatting)             │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
User Input (JSON)
    ↓
Parse & Validate
    ↓
deepDiffObjects() - Generate Diffs
    ↓
buildDiffTree() - Create Hierarchy
    ↓
calculateSummary() - Statistics
    ↓
Memoized React State
    ↓
Component Renders UI
    ↓
Visual Output (Dashboard, Tree, List)
```

### Component State Management

```javascript
// Input State
const [sourceJson, setSourceJson] = useState("");
const [targetJson, setTargetJson] = useState("");
const [ignoreKeys, setIgnoreKeys] = useState("timestamp,id,uuid");

// Results State (memoized)
const [diffs, setDiffs] = useState([]);

// UI State
const [expandedPaths, setExpandedPaths] = useState(new Set(["root"]));
const [viewMode, setViewMode] = useState("tree"); // "tree" | "diff-list"

// Status State
const [isComparing, setIsComparing] = useState(false);
const [error, setError] = useState("");
```

### Memoization Strategy

```javascript
// Parse once from string
const ignoreList = useMemo(() => {
  return ignoreKeys.split(",").map(k => k.trim()).filter(Boolean);
}, [ignoreKeys]);

// Recalculate only when diffs change
const summary = useMemo(() => {
  return calculateSummary(diffs);
}, [diffs]);

// Rebuild tree structure on diff changes
const treeData = useMemo(() => {
  return buildDiffTree(diffs);
}, [diffs]);
```

---

## Performance

### Algorithm Complexity
- **Time**: O(n) where n = total keys in objects
- **Space**: O(d) where d = depth of nesting

### Optimization Techniques
1. **useMemo** prevents unnecessary recalculation
2. **useCallback** maintains stable function references
3. **Lazy tree rendering** renders only visible nodes
4. **Set data structure** for O(1) key lookups

### Tested File Sizes
- ✅ Small (< 10 keys)
- ✅ Medium (100-1000 keys)
- ✅ Large (10,000+ keys)
- ✅ Deeply nested (20+ levels)
- ✅ Large arrays (1000+ items)

**No performance degradation** observed in normal use cases.

---

## Development

### Project Statistics

| Component | Lines | Purpose |
|-----------|-------|---------|
| jsonDiffEngine.js | 450+ | Core logic |
| AdvancedJSONComparator.jsx | 550+ | React component |
| AdvancedJSONComparator.css | 450+ | Styling |
| jsonComparatorTestCases.js | 400+ | Test cases |
| **Total** | **1,850+** | - |

### Theme Support

The component automatically detects and syncs with app-wide theme:
- **Dark theme** (default): Dark backgrounds, light text
- **Light theme**: Light backgrounds, dark text
- **Smooth transitions** between themes

### Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

### Tips & Tricks

1. **Preview mode**: Compare without ignore list, then with to see impact
2. **View switching**: Use Tree view for structure, List view for overview
3. **Type debugging**: Check type badges if unexpected modifications appear
4. **Large files**: Use Tree view with collapsed nodes
5. **JSON validation**: Use JSONFormatter tool if getting "Invalid JSON" error

### Extending the Comparator

#### Add Custom Diff Type
```javascript
// In deepDiffObjects(), add new type
diffs.push({
  type: "custom",
  path: newPath,
  ...customProperties
});

// In CSS, add styling
.diff-item.diff-custom {
  background-color: rgba(76, 175, 80, 0.1);
  border-left-color: #4caf50;
}
```

#### Add Export Functionality
```javascript
export const exportDiffs = (diffs, format) => {
  switch(format) {
    case 'json':
      return JSON.stringify(diffs, null, 2);
    case 'csv':
      return convertToCSV(diffs);
    case 'patch':
      return generateJSONPatch(diffs);
  }
};
```

#### Add Custom Comparison Rules
```javascript
const comparisonRules = [
  {
    pattern: /timestamp/,
    action: 'ignore'
  },
  {
    pattern: /price/,
    compare: (a, b) => Math.abs(a - b) < 0.01 // Allow 1% difference
  }
];
```

---

## FAQ

### Q: Why is `100` different from `"100"`?
**A:** Type strictness by design. Numbers and strings are different types. Use ignore list if this is expected.

### Q: Can I compare arrays in different order?
**A:** Array comparison is index-based (0, 1, 2...). Different order = different indices. Sort first if needed.

### Q: What about `null` vs `undefined`?
**A:** They're treated as different. `null` is a JSON value; `undefined` is not valid JSON.

### Q: Can I save/export results?
**A:** Currently, take screenshots or copy values. Export feature planned for future versions.

### Q: How do I handle circular references?
**A:** JSON doesn't support circular references. Remove them before comparing.

### Q: Can I compare more than 2 files?
**A:** Currently supports 2 files. Compare first two, then compare result with third.

### Q: Is comparison case-sensitive?
**A:** Yes. `"Name"` ≠ `"name"`. Keys and values are case-sensitive.

### Q: What's the maximum file size?
**A:** No hard limit, but performance best under 1MB of JSON.

### Q: How do I ignore nested keys?
**A:** Ignore list excludes all keys with that name at any level. Specify only the key name, not the path.

### Q: Can I use regex for ignore list?
**A:** Not currently, but it's in the roadmap for future versions.

---

## Troubleshooting

### "Invalid JSON" Error
- Use JSONFormatter tool first
- Check for trailing commas
- Verify all quotes are double quotes (`"`)
- Ensure all brackets/braces match

### Unexpected Modifications
- Check type badges (string, number, object, etc.)
- Remember: `100 ≠ "100"` (type strictness)
- Use browser console: `typeof value`

### Performance Issues
- Try List View instead of Tree View
- Use ignore list to reduce diff count
- Collapse nodes you don't need
- Consider splitting large files

### Ignore List Not Working
- Check key spelling (case-sensitive)
- Verify comma separation
- No extra spaces in key names
- Reload after changing ignore list

### Can't Find a Difference
- Switch between Tree and List views
- Use browser Find (Ctrl+F)
- Check if it's in an ignored key
- Expand all nodes to see full structure

---

## Learning Path

```
1. START HERE ← Read this README
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
8. Review API Reference for code usage
```

---

## Future Features

Planned enhancements:
- [ ] Side-by-side synchronized scrolling
- [ ] Copy-to-clipboard for JSONPath
- [ ] Export as JSON/CSV/PDF
- [ ] Diff history/undo
- [ ] Regex-based key filtering
- [ ] Custom comparison rules engine
- [ ] Batch file comparison
- [ ] JSON Patch format export
- [ ] Multi-file comparison
- [ ] Performance profiling tools

---

## Code Quality

- ✅ ESLint compliant
- ✅ React best practices
- ✅ Proper error handling
- ✅ Performance optimized
- ✅ Accessible (a11y)
- ✅ Responsive design
- ✅ No console errors

---

## Dependencies

### Core Dependencies
- react ^19.0.0
- react-dom ^19.0.0
- react-bootstrap ^2.10.10
- react-bootstrap-icons ^1.11.6
- react-router-dom ^7.3.0

### Build Tools
- react-scripts 5.0.1
- webpack (via react-scripts)

### Optional
- xlsx ^0.18.5 (for word converter)

---

## Available Scripts (Generated)

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view in your browser. The page reloads when you make changes and shows any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready to be deployed! See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

---

## Learn More

### About This Project
- This is a React app built with [Create React App](https://github.com/facebook/create-react-app)
- Uses React Router for navigation
- Bootstrap 5 for UI components
- Custom CSS for styling

### External Links
- [React Documentation](https://reactjs.org/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [React Bootstrap Icons](https://react-bootstrap-icons.js.org/)

---

## License

This project is part of the PS-formsqc suite.

---

## Support & Contact

For issues, questions, or suggestions:
1. Review appropriate section in this README
2. Check test cases for usage examples
3. Verify JSON validity with JSONFormatter tool
4. Check browser console for error details

---

**Built with ❤️ for form quality control and JSON comparison**

*Last Updated: March 27, 2026*  
*Version: 1.0.0*
