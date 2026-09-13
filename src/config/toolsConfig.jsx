import React from "react";
import {
  FileEarmarkText,
  Boxes,
  BarChart,
  FileWord,
  Database,
  Robot,
  FileText,
} from "react-bootstrap-icons";

import JSONExtractor from "../screens/JSONExtractor";
import BulkJSONValidator from "../screens/BulkJSONValidator";
import AdvancedJSONComparator from "../screens/AdvancedJSONComparator";
import WordConverter from "../screens/WordConverter";
import DataAnalyzer from "../screens/DataAnalyzer";
import AIPrompt from "../screens/AIPrompt";
import TextConverter from "../screens/TextConverter";

/**
 * =========================================================================
 * APPLICATION TOOLS & FEATURE CONFIGURATION
 * =========================================================================
 * Manage what tools and features are enabled/visible across branches.
 * Simply change any boolean to `true` or `false` below.
 */

// ── 0. App & Branding Configuration ───────────────────────────────────
export const APP_CONFIG = {
  siteTitle: "Form QC Tool Lite",      // Browser tab title (document.title)
  sidebarTitle: "Form QC Tool Lite",   // Sidebar header title when expanded
};

// ── 1. Top-Level Screen / Tool Visibility ──────────────────────────────
export const FEATURE_FLAGS = {
  FORM_REVIEW: true,          // /JsonExtractor (Single Form Review & QC)
  BULK_VALIDATOR: false,      // /BulkValidator (Bulk Form Review)
  JSON_COMPARATOR: false,      // /AdvancedJSONComparator (Compare JSON Schemas)
  WORD_CONVERTER: true,       // /Converter (Text & Word Converter)
  DATA_ANALYZER: false,        // /DataAnalyzer (Data Profiler & Dataset Analyzer)
  AI_PROMPT: false,           // /AIPrompt (AI System Prompt for Form Extraction)
  TEXT_CONVERTER: false,      // /TextConverter (Legacy Text Converter)
};

// ── 2. Form Review (JSONExtractor) Feature Toggles ────────────────────
export const JSON_EXTRACTOR_CONFIG = {
  // Excel Integration Features
  enableExcelImport: false,        // "Import from Excel" feature & header button
  enableExcelExport: false,        // "Export to Excel" feature & action button

  // Reserved Column Checking (detects conflicts with reserved database/grid column names)
  enableReservedColumnCheck: true,

  // Auto-Fix Features
  enableAutoFix: false,            // Master toggle for auto-fixing issues
  enableAutoFixAll: false,         // Show "Auto-Fix All" batch button in QC
  enableQuickFix: false,           // Show "Quick Fix" buttons next to individual issues
  enableTableFixKeyColumn: false,  // Show "Fix Key" action column in Extracted Fields table
  enableOptionKeyFix: false,       // Allow fixing option keys in Select / Radio sections

  // Toolbar & Header Buttons
  showAiPromptButton: false,       // "AI Excel Prompt" button in header
  showClearAllButton: true,       // "Clear All" trash button
  showFormatJsonButton: true,     // "Format JSON" button
  showCopyColumnButtons: true,    // "Copy" column buttons in table headers
  showCopySelectedButton: false,   // "Copy Selected" button in table header

  // Panels & Analysis Sections
  showFormComplexity: false,        // "Form Complexity & Page Estimation" panel
  showConditionsAnalysis: true,    // "Conditions & Logic Analysis" panel
};

// ── 3. Bulk Form Review (BulkJSONValidator) Feature Toggles ───────────
export const BULK_VALIDATOR_CONFIG = {
  enableExcelExport: true,        // "Export Excel Report" button
  enableAutoFixAll: true,         // "Auto-Fix All Forms" button
  enableAutoFixSingle: true,      // "Auto-Fix This Form" modal button
  enableReservedColumnCheck: true,// Reserved column conflicts in bulk QC
};

// ── 4. Central Tools Registry ─────────────────────────────────────────
export const TOOLS_REGISTRY = [
  {
    id: "FORM_REVIEW",
    name: "Form Review",
    path: "/JsonExtractor",
    icon: <FileEarmarkText />,
    render: (theme) => <JSONExtractor theme={theme} />,
    isDefault: true,
  },
  {
    id: "BULK_VALIDATOR",
    name: "Bulk Form Review",
    path: "/BulkValidator",
    icon: <Boxes />,
    render: (theme) => <BulkJSONValidator theme={theme} />,
  },
  {
    id: "JSON_COMPARATOR",
    name: "Compare Json",
    path: "/AdvancedJSONComparator",
    icon: <BarChart />,
    render: (theme) => <AdvancedJSONComparator theme={theme} />,
  },
  {
    id: "WORD_CONVERTER",
    name: "Text & Word Converter",
    path: "/Converter",
    icon: <FileWord />,
    render: (theme) => <WordConverter theme={theme} />,
  },
  {
    id: "DATA_ANALYZER",
    name: "Data Analyzer",
    path: "/DataAnalyzer",
    icon: <Database />,
    render: (theme) => <DataAnalyzer theme={theme} />,
  },
  {
    id: "AI_PROMPT",
    name: "AI Prompt Generator",
    path: "/AIPrompt",
    icon: <Robot />,
    render: () => <AIPrompt />,
  },
  {
    id: "TEXT_CONVERTER",
    name: "Text Converter",
    path: "/TextConverter",
    icon: <FileText />,
    render: () => <TextConverter />,
  },
];

/**
 * Returns list of tools that are enabled in FEATURE_FLAGS.
 */
export function getEnabledTools(flags = FEATURE_FLAGS) {
  return TOOLS_REGISTRY.filter((tool) => Boolean(flags[tool.id]));
}

/**
 * Returns the fallback route URL (either default tool or first active tool).
 */
export function getDefaultRoute(flags = FEATURE_FLAGS) {
  const enabledTools = getEnabledTools(flags);
  if (enabledTools.length === 0) {
    return "/JsonExtractor";
  }
  const defaultTool = enabledTools.find((t) => t.isDefault);
  return defaultTool ? defaultTool.path : enabledTools[0].path;
}

/**
 * Quick check if a tool is enabled by its ID.
 */
export function isToolEnabled(toolId, flags = FEATURE_FLAGS) {
  return Boolean(flags[toolId]);
}
