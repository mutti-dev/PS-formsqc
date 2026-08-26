import { parseBulkFormInput, parseDelimitedText } from "./bulkJsonParser";
import { analyzeBulkForms, autoFixBulkForms, exportBulkResultsToTSV } from "./bulkQcEngine";

describe("parseBulkFormInput", () => {
  it("parses tab-delimited text with FormId, Caption, and Description", () => {
    const rawTSV = `FormId\tCaption\tDescription
1\tForm One\t{"name":"Form One","config":"{\\"components\\":[{\\"label\\":\\"Container\\",\\"key\\":\\"container\\",\\"type\\":\\"container\\",\\"components\\":[]}]}"}
2\tForm Two\t{"name":"Form Two","config":"{\\"components\\":[{\\"label\\":\\"Container\\",\\"key\\":\\"Container\\",\\"type\\":\\"container\\",\\"components\\":[]}]}"}`;

    const parsed = parseBulkFormInput(rawTSV);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe("1");
    expect(parsed[0].name).toBe("Form One");
    expect(parsed[0].rawContent).toContain("Form One");
    expect(parsed[1].id).toBe("2");
    expect(parsed[1].name).toBe("Form Two");
  });

  it("parses JSON array format input", () => {
    const rawJsonArray = JSON.stringify([
      { FormId: "A1", Caption: "Alpha Form", Description: { components: [] } },
      { FormId: "B2", Caption: "Beta Form", Description: { components: [] } },
    ]);

    const parsed = parseBulkFormInput(rawJsonArray);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe("A1");
    expect(parsed[0].name).toBe("Alpha Form");
  });

  it("handles empty or whitespace strings gracefully", () => {
    expect(parseBulkFormInput("")).toEqual([]);
    expect(parseBulkFormInput("   \n\t  ")).toEqual([]);
    expect(parseBulkFormInput(null)).toEqual([]);
  });
});

describe("analyzeBulkForms and autoFixBulkForms", () => {
  const sampleTSV = `FormId\tCaption\tDescription
1\tForm With Container Error\t{"components":[{"label":"Container","key":"container","type":"container","components":[{"label":"First Name","key":"first_name","type":"textfield"}]}]}
2\tClean Form\t{"components":[{"label":"Container","key":"Container","type":"container","components":[{"label":"First Name","key":"First_Name","type":"textfield"}]}]}`;

  it("analyzes batch and identifies container key critical error and warnings", () => {
    const results = analyzeBulkForms(sampleTSV);
    expect(results.forms).toHaveLength(2);

    const form1 = results.forms[0];
    expect(form1.id).toBe("1");
    expect(form1.status).toBe("critical");
    expect(form1.errorCount).toBe(1); // container key error
    expect(form1.warningCount).toBe(1); // first_name mismatch warning

    const containerError = form1.validationIssues.find((i) => i.type === "container_key_invalid");
    expect(containerError).toBeDefined();
    expect(containerError.severity).toBe("error");

    const form2 = results.forms[1];
    expect(form2.id).toBe("2");
    expect(form2.status).toBe("clean");
    expect(form2.errorCount).toBe(0);
    expect(form2.warningCount).toBe(0);

    // Summary statistics
    expect(results.stats.totalForms).toBe(2);
    expect(results.stats.errorFormsCount).toBe(1);
    expect(results.stats.cleanFormsCount).toBe(1);
    expect(results.stats.totalCriticalErrors).toBe(1);
  });

  it("auto-fixes fixable issues across all forms in bulk", () => {
    const results = analyzeBulkForms(sampleTSV);
    expect(results.forms[0].status).toBe("critical");

    const fixed = autoFixBulkForms(results);
    expect(fixed.forms[0].status).toBe("clean");
    expect(fixed.forms[0].errorCount).toBe(0);
    expect(fixed.forms[0].warningCount).toBe(0);
    expect(fixed.stats.cleanFormsCount).toBe(2);
  });

  it("exports bulk results to TSV correctly", () => {
    const results = analyzeBulkForms(sampleTSV);
    const tsv = exportBulkResultsToTSV(results);
    expect(tsv).toContain("FormId\tCaption\tDescription");
    expect(tsv).toContain("1\tForm With Container Error\t");
    expect(tsv).toContain("2\tClean Form\t");
  });

  it("successfully parses and analyzes full bulkrawjsons.txt file", () => {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.resolve(__dirname, "../../bulkrawjsons.txt");

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const results = analyzeBulkForms(fileContent);

      expect(results.forms.length).toBe(12);
      expect(results.stats.totalForms).toBe(12);
      expect(results.forms[0].id).toBe("1");
      expect(results.forms[0].name).toContain("Healthy Homes");
    }
  });
});
