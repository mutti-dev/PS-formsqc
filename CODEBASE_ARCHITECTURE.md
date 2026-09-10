# Form QC Tool (PS-formsqc) - Codebase Architecture & Flowcharts

This document provides a comprehensive technical overview of the **PS-formsqc** application, illustrating how all screens, components, configuration files, and utility engines interact and connect with each other.

---

## Table of Contents
1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [End-to-End System Flowchart](#2-end-to-end-system-flowchart)
3. [Screen-Level Data Flow & Utility Connections](#3-screen-level-data-flow--utility-connections)
   - [3.1 Form Review (JSONExtractor)](#31-form-review-jsonextractor)
   - [3.2 Bulk Form Review (BulkJSONValidator)](#32-bulk-form-review-bulkjsonvalidator)
   - [3.3 Compare JSON (AdvancedJSONComparator)](#33-compare-json-advancedjsoncomparator)
   - [3.4 Data Analyzer (DataAnalyzer)](#34-data-analyzer-dataanalyzer)
   - [3.5 Text & Word Converter (WordConverter)](#35-text--word-converter-wordconverter)
4. [Utility Engine Interdependence Graph](#4-utility-engine-interdependence-graph)
5. [Complete File Directory & Responsibility Matrix](#5-complete-file-directory--responsibility-matrix)

---

## 1. High-Level System Architecture

The application is built on **React 19**, **React Router v7**, **Bootstrap 5 / React-Bootstrap**, and **TanStack Table v8**. It processes complex Form.io JSON schemas and tabular dataset exports to perform Quality Control (QC), schema normalization, structural diffing, complexity estimation, and data profiling.

```mermaid
graph TD
    User([User Browser]) --> Index[src/index.js]
    Index --> App[src/App.js]

    subgraph Core_Shell [Global Application Shell]
        App --> Drawer[src/common/SideDrawer.jsx]
        App --> ThemeState[(Theme State: Dark / Light)]
        App --> Router[React Router Routes]
        App --> BackToTop[src/common/BackToTop.jsx]
        App --> VercelAnalytics[Vercel Analytics]
    end

    subgraph Screens [Main Module Screens]
        Router --> S1[JSONExtractor.js\nForm Review]
        Router --> S2[BulkJSONValidator.jsx\nBulk Form Review]
        Router --> S3[AdvancedJSONComparator.jsx\nCompare JSON]
        Router --> S4[DataAnalyzer.jsx\nData Analyzer]
        Router --> S5[WordConverter.js\nText & Word Converter]
        Router --> S6[AIPrompt.js\nAI System Prompt]
    end

    subgraph Engines [Core Processing Engines & Utils]
        E1[jsonUtils.js\nJSON Sanitization & Extraction]
        E2[utils.js\nSchema & Option Extractors]
        E3[bulkQcEngine.js & bulkJsonParser.js\nBatch QC Engine]
        E4[jsonDiffEngine.js & keyComparisonUtil.js\nDiff & Comparison Engine]
        E5[dataAnalyzerEngine.js\nData Profiling Engine]
        E6[formEstimationEngine.js\nComplexity & Effort Estimator]
        E7[exportUtils.js & importutils.js\nExcel I/O Bridge]
    end

    Screens --> Engines
```

---

## 2. End-to-End System Flowchart

This flowchart outlines the entire lifecycle: from entering JSON or uploading an Excel file, through parsing, validation, automated remediation (patching), complexity scoring, and export.

```mermaid
flowchart TD
    %% Inputs
    Start([User Interaction]) --> ChooseScreen{Select Tool}

    %% JSONExtractor Branch
    ChooseScreen -->|Form Review| JE_Input[Input Form.io JSON or Upload Excel]
    JE_Input -->|Import Excel| JE_Import[importutils.js\nimportFromExcel]
    JE_Import --> JE_Raw[Raw JSON State]
    JE_Input -->|Direct Paste| JE_Raw

    JE_Raw --> JE_ValidateSyntax{isValidJson?}
    JE_ValidateSyntax -->|No| JE_Error[Display Syntax Error]
    JE_ValidateSyntax -->|Yes| JE_Parse[extractFormJson / deepParse\njsonUtils.js]

    JE_Parse --> JE_ExtractParallel[Parallel Schema Extraction\nutils.js]
    JE_ExtractParallel --> JE_Labels[extractLabelsFromJSON]
    JE_ExtractParallel --> JE_Select[extractSelectValues / Radio / Survey]
    JE_ExtractParallel --> JE_Conditions[extractConditions]

    JE_Labels & JE_Select & JE_Conditions --> JE_QC[validateFormStructure\nutils.js]
    JE_QC --> JE_Reserved[checkReservedColumnMatch\nreservedColumns.js]
    JE_QC --> JE_Complexity[calculateFormComplexity\nformEstimationEngine.js]

    JE_QC --> JE_Sections[Render Section Cards\ncommon/sections]
    JE_Sections --> JE_AutoFix{User clicks Fix Issue / Fix All?}
    JE_AutoFix -->|Yes| JE_Patch[updateConditionalsInJson / applyJsonUpdate\nSync JSON, UI, & LocalStorage]
    JE_Patch --> JE_Parse
    JE_Sections -->|Export| JE_Excel[exportToExcel\nexportUtils.js]

    %% Bulk Validator Branch
    ChooseScreen -->|Bulk Form Review| BV_Input[Paste TSV/CSV or Upload File]
    BV_Input --> BV_Parse[bulkJsonParser.js\nparseBulkInput]
    BV_Parse --> BV_Run[bulkQcEngine.js\nrunBulkQc]
    BV_Run --> BV_Results[Render Batch Table, Scores, Error Badges]

    %% JSON Comparator Branch
    ChooseScreen -->|Compare JSON| JC_Input[Input Base JSON + Target JSON]
    JC_Input --> JC_Diff[jsonDiffEngine.js & keyComparisonUtil.js\ndiffForms]
    JC_Diff --> JC_View[Render Added, Removed, Modified, Type Discrepancies]

    %% Data Analyzer Branch
    ChooseScreen -->|Data Analyzer| DA_Input[Upload CSV/Excel/JSON File]
    DA_Input --> DA_Engine[dataAnalyzerEngine.js\nanalyzeDataset]
    DA_Engine --> DA_View[Compute Summary, Null Counts, Frequency, Histograms]

    %% Converter Branch
    ChooseScreen -->|Text Converter| WC_Input[Input Raw Text or Labels]
    WC_Input --> WC_Engine[convertLabelToKey\nutils.js]
    WC_Engine --> WC_View[Output CamelCase / Snake_Case / Truncated Keys]
```

---

## 3. Screen-Level Data Flow & Utility Connections

### 3.1 Form Review (`JSONExtractor.js`)
`JSONExtractor.js` is the central screen of the application. It processes single Form.io schemas, detects errors, suggests automated fixes, scores form building complexity, and outputs Excel review books.

```mermaid
graph LR
    subgraph UI_Components [JSONExtractor View Components]
        Header[ScreenHeader.jsx]
        InputCard[JSON Textarea + Clear All]
        ActionToolbar[Form Type, Extract, Format, Key Limit]
        SectionManager[common/sections/index.jsx]
    end

    subgraph Sections [Sub-Section Components]
        SectionManager --> S_Val[ValidationSection.jsx]
        SectionManager --> S_Comp[FormComplexitySection.jsx]
        SectionManager --> S_Stats[JsonStatsSection.jsx]
        SectionManager --> S_DupL[DuplicateLabelsSection.jsx]
        SectionManager --> S_DupK[DuplicateAPISection.jsx]
        SectionManager --> S_Opt[SelectComponentsSection.jsx\nRadioComponentsSection.jsx\nSurveyComponentsSection.jsx]
        SectionManager --> S_Cond[ConditionsSection.jsx]
    end

    subgraph Utilities_Used [Underlying Utilities & Configs]
        JU[src/utils/jsonUtils.js]
        U[src/utils/utils.js]
        FE[src/utils/formEstimationEngine.js]
        RC[src/config/reservedColumns.js]
        IU[src/utils/importutils.js]
        EU[src/utils/exportUtils.js]
        AI[src/config/aiPrompt.js]
    end

    Header -.->|Action: AI Prompt| AI
    Header -.->|Action: Import File| IU
    InputCard -.->|Format JSON| JU
    ActionToolbar -.->|Trigger QC| U

    S_Val -->|Auto-Patch Logic| U
    S_Val -->|Reserved Word QC| RC
    S_Comp -->|Complexity Scoring| FE
    S_Opt -->|Inline Option Edit| U
    SectionManager -->|Export Workbook| EU
```

#### Key Functional Logic:
- **`jsonUtils.js`**: `extractFormJson` identifies whether the pasted JSON is a raw Form.io component tree or wrapped inside metadata (e.g., API payloads with `config` or `components` wrappers).
- **`utils.js`**:
  - `extractLabelsFromJSON`: Recursively traverses layout containers (`columns`, `panel`, `fieldset`, `well`) and captures nested components, tracking whether fields are inside `datagrid` or `editgrid`.
  - `extractConditions`: Builds dependency graphs where field visibility depends on another component's key.
  - `updateConditionReferencesInJson`: When an API key is fixed, this function patches all conditional logic expressions (`when`, JavaScript calculations) referencing the old key to prevent broken conditional dependencies.
- **`formEstimationEngine.js`**: Evaluates form development complexity (Simple, Medium, Complex, Tier 4) based on weighted formula calculation (grid nesting, custom conditionals, logic handlers, dynamic URLs).

---

### 3.2 Bulk Form Review (`BulkJSONValidator.jsx`)
`BulkJSONValidator.jsx` validates dozens or hundreds of Form.io forms in a single batch, typically generated by database export scripts.

```mermaid
graph TD
    Input[Pasted TSV/CSV or Uploaded .txt/.tsv/.csv/.json] --> Parser[src/utils/bulkJsonParser.js]
    
    subgraph Parser_Internals [bulkJsonParser.js]
        Parser --> Detect[detectDelimiter]
        Detect --> Split[Extract FormId, Caption, Description/JSON]
        Split --> Sanitize[sanitizeJsonPayload]
    end

    Sanitize --> Engine[src/utils/bulkQcEngine.js]

    subgraph QC_Engine [bulkQcEngine.js]
        Engine --> ValidateEach[Process Each Form]
        ValidateEach --> RunChecks[Check Rules:\n- Missing Labels\n- Reserved Columns\n- Duplicate Keys\n- Truncation > Limit\n- Orphaned Components]
        RunChecks --> Score[Calculate Form QC Pass Rate]
    end

    Score --> View[BulkJSONValidator.jsx View]
    View --> SummaryCards[Summary Cards: Total, Clean, Warning, Error]
    View --> TanStackTable[TanStack Table with Filtering & Column Resizing]
    View --> ExportExcel[Export Audit Summary to XLSX]
```

---

### 3.3 Compare JSON (`AdvancedJSONComparator.jsx`)
`AdvancedJSONComparator.jsx` takes two Form.io JSON objects (e.g., Version A vs. Version B) and highlights all schema evolutions.

```mermaid
graph TD
    subgraph Inputs
        A[Base Form JSON]
        B[Target Form JSON]
    end

    Inputs --> DiffEngine[src/utils/jsonDiffEngine.js]
    Inputs --> KeyEngine[src/utils/keyComparisonUtil.js]

    DiffEngine --> FlatA[Flatten & Index Components A]
    DiffEngine --> FlatB[Flatten & Index Components B]

    FlatA & FlatB --> Comparator{Compare Schemas}

    Comparator --> Added[Added Components]
    Comparator --> Removed[Removed Components]
    Comparator --> Modified[Modified Labels & Settings]
    Comparator --> TypeChanged[Component Type Mutations]
    Comparator --> OptionDiff[Select / Radio Option Value Drift]

    Added & Removed & Modified & TypeChanged & OptionDiff --> ResultView[AdvancedJSONComparator.jsx UI]
    ResultView --> HierarchicalDiff[Tree Diff View]
    ResultView --> SummaryBadges[Change Stats Badges]
    ResultView --> CopyClipboard[TSV Copy for Documentation]
```

---

### 3.4 Data Analyzer (`DataAnalyzer.jsx`)
`DataAnalyzer.jsx` profiles raw datasets, inspecting schema integrity, data distribution, and missing value patterns.

```mermaid
graph TD
    File[CSV / TSV / Excel / JSON Dataset] --> Profiler[src/utils/dataAnalyzerEngine.js]

    subgraph Analysis_Phases [dataAnalyzerEngine.js]
        Profiler --> DetectTypes[Infer Column Data Types\nString, Number, Boolean, Date, Email, Phone]
        DetectTypes --> Stats[Compute Statistics:\nMean, Median, Min, Max, Nulls, Distinct]
        Stats --> Freq[Calculate Value Frequencies & Top Categories]
        Stats --> Anomaly[Identify Format Anomalies & Outliers]
    end

    Analysis_Phases --> Dashboard[DataAnalyzer.jsx Dashboard]
    Dashboard --> OverviewGrid[Dataset Overview Cards]
    Dashboard --> QualityReport[Data Quality & Null % Bars]
    Dashboard --> ColumnInspector[Interactive Column Inspector & Histograms]
```

---

### 3.5 Text & Word Converter (`WordConverter.js`)
Provides immediate utility helpers for sanitizing and generating compliant database columns and API keys from raw human labels.

```mermaid
graph LR
    RawLabel[Input Text / Label List] --> Converter[src/screens/WordConverter.js]
    Converter --> Logic[convertLabelToKey\nsrc/utils/utils.js]
    Logic --> Casing[Format as camelCase / PascalCase / snake_case]
    Logic --> Limit[Enforce 110 / 128 Char Key Limits]
    Limit --> Output[Copyable API Key Output]
```

---

## 4. Utility Engine Interdependence Graph

This diagram illustrates how utility files depend on or feed data to each other:

```mermaid
graph TD
    jsonUtils[jsonUtils.js\nLow-level JSON parse, sanitize, format]
    utils[utils.js\nForm.io Component extraction & validation]
    reservedColumns[config/reservedColumns.js\nDB reserved words list]
    formEstimationEngine[formEstimationEngine.js\nComplexity formulas & tiers]
    exportUtils[exportUtils.js\nXLSX multi-sheet formatting]
    importutils[importutils.js\nExcel to Form.io JSON parser]
    bulkJsonParser[bulkJsonParser.js\nTabular row splitter & cleaner]
    bulkQcEngine[bulkQcEngine.js\nMulti-form audit engine]
    jsonDiffEngine[jsonDiffEngine.js\nTree & component diffing]
    keyComparisonUtil[keyComparisonUtil.js\nKey difference matrix]
    dataAnalyzerEngine[dataAnalyzerEngine.js\nDataset profiling & metrics]

    %% Dependencies
    utils --> jsonUtils
    utils --> reservedColumns
    formEstimationEngine --> utils
    exportUtils --> formEstimationEngine
    importutils --> jsonUtils
    bulkQcEngine --> utils
    bulkQcEngine --> jsonUtils
    bulkQcEngine --> reservedColumns
    jsonDiffEngine --> jsonUtils
    keyComparisonUtil --> jsonUtils
```

---

## 5. Complete File Directory & Responsibility Matrix

| File Path | Layer | Responsibility / Purpose |
| :--- | :--- | :--- |
| **`src/index.js`** | Root Entry | React DOM rendering & bootstrap entry point. |
| **`src/App.js`** | Routing Shell | Houses theme state (dark/light), main layout shell, navigation routes, and Vercel Analytics. |
| **`src/App.css`** | Global Styles | Root background variables, layout styling, and dark theme tooltip enhancements. |
| **`src/common/SideDrawer.jsx`** | Navigation Shell | Collapsible navigation sidebar with route links, icon-only collapsed hover tooltips, and theme toggle. |
| **`src/common/ScreenHeader.jsx`** | Layout UI | Unified header with glowing blue icon badge, title, subtitle, and top-right action slots. |
| **`src/common/BackToTop.jsx`** | Layout UI | Floating smooth scroll-to-top button. |
| **`src/common/sections/`** | UI Widgets | Dedicated modular cards for Form Review results: |
| - `ValidationSection.jsx` | UI Widget | Displays validation issues with auto-fix single/all action buttons. |
| - `FormComplexitySection.jsx` | UI Widget | Visualizes form complexity points, tier badges, and developer hour estimates. |
| - `JsonStatsSection.jsx` | UI Widget | Summary cards for JSON elements, unique keys, and tree depth. |
| - `DuplicateLabelsSection.jsx` | UI Widget | Warns of identical labels that could confuse form respondents. |
| - `DuplicateAPISection.jsx` | UI Widget | Critical warning for duplicate API keys that cause data collisions in Form.io. |
| - `KeyLengthWarningsSection.jsx`| UI Widget | Warns about keys exceeding the designated threshold (e.g., 128 characters). |
| - `SelectComponentsSection.jsx` | UI Widget | Interactive list of select boxes with inline option value editing and auto-key generation. |
| - `RadioComponentsSection.jsx`  | UI Widget | Interactive list of radio groups with inline value editing. |
| - `SurveyComponentsSection.jsx` | UI Widget | Survey question/value inspection and discrepancy alerts. |
| - `ConditionsSection.jsx`       | UI Widget | Visual map of conditional visibility rules (`when` triggers). |
| **`src/screens/JSONExtractor.js`** | Screen | Main screen for Form Review, single form analysis, auto-remediation, and Excel generation. |
| **`src/screens/BulkJSONValidator.jsx`** | Screen | Bulk QC validator for database query outputs (hundreds of forms at once). |
| **`src/screens/AdvancedJSONComparator.jsx`** | Screen | Structural diff engine comparing Base vs. Target Form.io JSONs. |
| **`src/screens/DataAnalyzer.jsx`** | Screen | Dataset profiler for CSV, TSV, and JSON datasets with summary statistics and anomaly detection. |
| **`src/screens/WordConverter.js`** | Screen | Converts user labels into sanitized API keys with various casing transformations. |
| **`src/screens/AIPrompt.js`** | Screen | Interactive reference copy modal for Excel AI generation system prompts. |
| **`src/utils/jsonUtils.js`** | Core Engine | JSON syntax validation, extraction from API wrappers, deep parsing, and formatting. |
| **`src/utils/utils.js`** | Core Engine | Schema element traversal, option extractions, conditional reference patching, and QC rules. |
| **`src/utils/bulkJsonParser.js`** | Core Engine | Delimiter detection and parsing for multi-row database dumps. |
| **`src/utils/bulkQcEngine.js`** | Core Engine | Multi-form QC batch runner checking reserved words, duplicates, and key limits. |
| **`src/utils/jsonDiffEngine.js`** | Core Engine | Recursive tree diffing detecting added, removed, changed components and option drift. |
| **`src/utils/keyComparisonUtil.js`** | Core Engine | Key audit list comparison between two forms. |
| **`src/utils/dataAnalyzerEngine.js`** | Core Engine | Statistical calculation, type inference, and distribution profiling for datasets. |
| **`src/utils/formEstimationEngine.js`** | Core Engine | Form development effort estimation algorithms and tier classifications. |
| **`src/utils/importutils.js`** | Bridge | Parses uploaded Excel spreadsheets and converts rows back into Form.io JSON structures. |
| **`src/utils/exportUtils.js`** | Bridge | Exports analyzed schema tables and metrics into styled multi-tab Excel files. |
| **`src/config/reservedColumns.js`** | Config | Database reserved keywords (SQL, Oracle, Postgres) that cannot be used as API keys. |
| **`src/config/componentTemplates.js`** | Config | Form.io component definitions and default configurations. |
| **`src/config/aiPrompt.js`** | Config | Master prompt template for external LLMs to convert forms to structured tables. |
