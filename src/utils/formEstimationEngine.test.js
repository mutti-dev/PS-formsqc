import {
  calculateFormComplexity,
  calculateEquivalentPages,
  getPageBracketInfo,
  isCalculatedField,
  categorizeFieldType,
} from "./formEstimationEngine";

describe("formEstimationEngine", () => {
  describe("calculateEquivalentPages", () => {
    test("maps total weights to equivalent pages per standard brackets", () => {
      expect(calculateEquivalentPages(0)).toBe(0);
      expect(calculateEquivalentPages(1)).toBe(1);
      expect(calculateEquivalentPages(5)).toBe(1);
      expect(calculateEquivalentPages(10)).toBe(1);
      expect(calculateEquivalentPages(11)).toBe(2);
      expect(calculateEquivalentPages(20)).toBe(2);
      expect(calculateEquivalentPages(21)).toBe(3);
      expect(calculateEquivalentPages(30)).toBe(3);
      expect(calculateEquivalentPages(31)).toBe(4);
      expect(calculateEquivalentPages(40)).toBe(4);
      expect(calculateEquivalentPages(43)).toBe(5);
    });
  });

  describe("getPageBracketInfo", () => {
    test("returns correct bracket info with current highlight", () => {
      const bracketInfo = getPageBracketInfo(25);
      expect(bracketInfo.currentPages).toBe(3);
      const currentBracket = bracketInfo.brackets.find((b) => b.isCurrent);
      expect(currentBracket).toBeDefined();
      expect(currentBracket.pages).toBe(3);
      expect(currentBracket.rangeLabel).toBe("21 – 30");
    });
  });

  describe("PDF Standard Example Calculation", () => {
    test("matches PDF example: 20 text fields, 10 selects, 5 dates, 1 datagrid with 4 fields => weight 43, 5 pages", () => {
      const textFields = Array.from({ length: 20 }, (_, i) => ({
        type: "textfield",
        label: `Text Field ${i + 1}`,
        key: `textField_${i + 1}`,
      }));

      const selectFields = Array.from({ length: 10 }, (_, i) => ({
        type: "select",
        label: `Select Dropdown ${i + 1}`,
        key: `selectDropdown_${i + 1}`,
      }));

      const dateFields = Array.from({ length: 5 }, (_, i) => ({
        type: "datetime",
        label: `Date Field ${i + 1}`,
        key: `dateField_${i + 1}`,
      }));

      const datagrid = {
        type: "datagrid",
        label: "Sample Datagrid",
        key: "sample_datagrid",
        components: [
          { type: "textfield", label: "Inner Field 1", key: "inner1" },
          { type: "number", label: "Inner Field 2", key: "inner2" },
          { type: "select", label: "Inner Field 3", key: "inner3" },
          { type: "datetime", label: "Inner Field 4", key: "inner4" },
        ],
      };

      const formConfig = {
        label: "Container",
        key: "Container",
        type: "container",
        components: [
          ...textFields,
          ...selectFields,
          ...dateFields,
          datagrid,
        ],
      };

      const result = calculateFormComplexity(formConfig);

      expect(result.totalWeight).toBe(43);
      expect(result.equivalentPages).toBe(5);
      expect(result.totalDataFields).toBe(39); // 20 + 10 + 5 + 4

      // Check breakdown items
      const textGroup = result.breakdown.find((b) => b.key === "textfield");
      expect(textGroup.count).toBe(20);
      expect(textGroup.totalWeight).toBe(20);

      const selectGroup = result.breakdown.find((b) => b.key === "select");
      expect(selectGroup.count).toBe(10);
      expect(selectGroup.totalWeight).toBe(10);

      const dateGroup = result.breakdown.find((b) => b.key === "datetime");
      expect(dateGroup.count).toBe(5);
      expect(dateGroup.totalWeight).toBe(5);

      const gridItem = result.breakdown.find((b) => b.isDatagrid);
      expect(gridItem.internalCount).toBe(4);
      expect(gridItem.totalWeight).toBe(8); // 4 x 2 = 8
    });
  });

  describe("Calculated & File Upload Fields", () => {
    test("correctly applies weight 3 for calculated fields and weight 2 for file upload", () => {
      const formConfig = {
        components: [
          {
            type: "number",
            label: "Total Score",
            key: "totalScore",
            calculateValue: "value = data.score1 + data.score2;",
          },
          {
            type: "file",
            label: "Upload Resume",
            key: "uploadResume",
          },
        ],
      };

      const result = calculateFormComplexity(formConfig);
      // Calculated: 3, File: 2 => Total: 5 => 1 page
      expect(result.totalWeight).toBe(5);
      expect(result.equivalentPages).toBe(1);

      const calcGroup = result.breakdown.find((b) => b.key === "calculated");
      expect(calcGroup.count).toBe(1);
      expect(calcGroup.totalWeight).toBe(3);

      const fileGroup = result.breakdown.find((b) => b.key === "file");
      expect(fileGroup.count).toBe(1);
      expect(fileGroup.totalWeight).toBe(2);
    });
  });

  describe("Layout exclusion & Content tracking", () => {
    test("excludes panels, columns, containers from field weight and tracks content sections separately", () => {
      const formConfig = {
        type: "container",
        label: "Container",
        components: [
          {
            type: "content",
            label: "Form Instructions",
            html: "<p>Please fill out this form carefully.</p>",
          },
          {
            type: "panel",
            title: "Section 1",
            components: [
              {
                type: "columns",
                columns: [
                  {
                    components: [
                      { type: "textfield", label: "First Name", key: "firstName" },
                    ],
                  },
                  {
                    components: [
                      { type: "textfield", label: "Last Name", key: "lastName" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "button",
            label: "Submit",
            key: "submit",
          },
        ],
      };

      const result = calculateFormComplexity(formConfig);
      expect(result.totalWeight).toBe(2); // 2 text fields
      expect(result.equivalentPages).toBe(1);
      expect(result.contentSectionsCount).toBe(1);
      expect(result.contentSections.length).toBe(1);
    });
  });
});
