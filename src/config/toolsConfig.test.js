import {
  APP_CONFIG,
  FEATURE_FLAGS,
  JSON_EXTRACTOR_CONFIG,
  BULK_VALIDATOR_CONFIG,
  TOOLS_REGISTRY,
  getEnabledTools,
  getDefaultRoute,
  isToolEnabled,
} from "./toolsConfig";

describe("toolsConfig and feature visibility system", () => {
  test("APP_CONFIG defines siteTitle and sidebarTitle", () => {
    expect(APP_CONFIG).toHaveProperty("siteTitle");
    expect(APP_CONFIG).toHaveProperty("sidebarTitle");
    expect(typeof APP_CONFIG.siteTitle).toBe("string");
    expect(typeof APP_CONFIG.sidebarTitle).toBe("string");
  });

  test("FEATURE_FLAGS contains expected tool keys", () => {
    expect(FEATURE_FLAGS).toHaveProperty("FORM_REVIEW");
    expect(FEATURE_FLAGS).toHaveProperty("BULK_VALIDATOR");
    expect(FEATURE_FLAGS).toHaveProperty("JSON_COMPARATOR");
    expect(FEATURE_FLAGS).toHaveProperty("WORD_CONVERTER");
    expect(FEATURE_FLAGS).toHaveProperty("DATA_ANALYZER");
    expect(FEATURE_FLAGS).toHaveProperty("AI_PROMPT");
    expect(FEATURE_FLAGS).toHaveProperty("TEXT_CONVERTER");
  });

  test("JSON_EXTRACTOR_CONFIG contains Excel, reserved column, autofix, and button toggles", () => {
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableExcelImport");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableExcelExport");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableReservedColumnCheck");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableAutoFix");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableAutoFixAll");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableQuickFix");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableTableFixKeyColumn");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("enableOptionKeyFix");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showAiPromptButton");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showClearAllButton");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showFormatJsonButton");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showCopyColumnButtons");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showCopySelectedButton");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showFormComplexity");
    expect(JSON_EXTRACTOR_CONFIG).toHaveProperty("showConditionsAnalysis");
  });

  test("BULK_VALIDATOR_CONFIG contains expected controls", () => {
    expect(BULK_VALIDATOR_CONFIG).toHaveProperty("enableExcelExport");
    expect(BULK_VALIDATOR_CONFIG).toHaveProperty("enableAutoFixAll");
    expect(BULK_VALIDATOR_CONFIG).toHaveProperty("enableAutoFixSingle");
    expect(BULK_VALIDATOR_CONFIG).toHaveProperty("enableReservedColumnCheck");
  });

  test("TOOLS_REGISTRY defines required attributes for all tools", () => {
    expect(TOOLS_REGISTRY.length).toBeGreaterThan(0);
    TOOLS_REGISTRY.forEach((tool) => {
      expect(tool.id).toBeDefined();
      expect(tool.name).toBeDefined();
      expect(tool.path).toBeDefined();
      expect(tool.icon).toBeDefined();
      expect(typeof tool.render).toBe("function");
    });
  });

  test("getEnabledTools filters tools according to feature flags", () => {
    const mockFlags = {
      FORM_REVIEW: true,
      BULK_VALIDATOR: false,
      JSON_COMPARATOR: true,
      WORD_CONVERTER: false,
      DATA_ANALYZER: false,
      AI_PROMPT: false,
      TEXT_CONVERTER: false,
    };

    const activeTools = getEnabledTools(mockFlags);
    const activeIds = activeTools.map((t) => t.id);

    expect(activeIds).toEqual(["FORM_REVIEW", "JSON_COMPARATOR"]);
  });

  test("getDefaultRoute returns default route when default tool is active", () => {
    const mockFlags = {
      FORM_REVIEW: true,
      BULK_VALIDATOR: true,
    };
    expect(getDefaultRoute(mockFlags)).toBe("/JsonExtractor");
  });

  test("getDefaultRoute falls back to first enabled tool if default tool is disabled", () => {
    const mockFlags = {
      FORM_REVIEW: false,
      BULK_VALIDATOR: true,
      JSON_COMPARATOR: true,
    };
    expect(getDefaultRoute(mockFlags)).toBe("/BulkValidator");
  });

  test("getDefaultRoute falls back to /JsonExtractor if no tools are enabled", () => {
    const emptyFlags = {};
    expect(getDefaultRoute(emptyFlags)).toBe("/JsonExtractor");
  });

  test("isToolEnabled correctly checks tool flag", () => {
    const flags = { FORM_REVIEW: true, BULK_VALIDATOR: false };
    expect(isToolEnabled("FORM_REVIEW", flags)).toBe(true);
    expect(isToolEnabled("BULK_VALIDATOR", flags)).toBe(false);
    expect(isToolEnabled("UNKNOWN_TOOL", flags)).toBe(false);
  });
});
