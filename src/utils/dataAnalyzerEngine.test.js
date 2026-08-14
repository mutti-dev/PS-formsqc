import {
  detectColumnType,
  profileColumn,
  evaluateDataQuality,
} from "./dataAnalyzerEngine";

describe("dataAnalyzerEngine", () => {
  const sampleRows = [
    { id: 1, name: "Alice", email: "alice@example.com", age: 30 },
    { id: 2, name: "Bob", email: "invalid-email", age: 25 },
    { id: 3, name: "Charlie", email: "charlie@example.com", age: null },
    { id: 1, name: "Alice", email: "alice@example.com", age: 30 }, // exact duplicate of row 1
  ];
  const sampleColumns = ["id", "name", "email", "age"];

  it("detects column data types correctly", () => {
    const emailValues = sampleRows.map((r) => r.email);
    const ageValues = sampleRows.map((r) => r.age);

    const emailType = detectColumnType(emailValues);
    expect(emailType.inferredType).toBe("email");

    const ageType = detectColumnType(ageValues);
    expect(ageType.inferredType).toBe("number");
  });

  it("profiles column null percentage and unique counts", () => {
    const profile = profileColumn("age", sampleRows);

    expect(profile.columnName).toBe("age");
    expect(profile.nullCount).toBe(1);
    expect(profile.nullPercentage).toBe(25); // 1 out of 4 is null = 25%
    expect(profile.numericStats).not.toBeNull();
    expect(profile.numericStats.min).toBe(25);
    expect(profile.numericStats.max).toBe(30);
  });

  it("evaluates data quality across completeness, validity, uniqueness, and consistency", () => {
    const result = evaluateDataQuality(sampleRows, sampleColumns, {
      requiredColumns: ["name"],
      keyColumns: ["id"],
    });

    expect(result.scores).toBeDefined();
    expect(result.scores.overall).toBeGreaterThan(0);
    expect(result.scores.overall).toBeLessThanOrEqual(100);

    // Verify format error detected for invalid-email
    const emailValidityIssue = result.issues.find(
      (i) => i.columnName === "email" && i.dimension === "Validity"
    );
    expect(emailValidityIssue).toBeDefined();
    expect(emailValidityIssue.value).toBe("invalid-email");

    // Verify duplicate row detected
    const dupRowIssue = result.issues.find(
      (i) => i.dimension === "Uniqueness" && i.issueType === "duplicate_row"
    );
    expect(dupRowIssue).toBeDefined();
  });
});
