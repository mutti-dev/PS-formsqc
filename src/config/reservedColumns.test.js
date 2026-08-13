import {
  INTAKE_RESERVED_COLUMNS,
  FORM_RESERVED_COLUMNS,
  getReservedColumnsForFormType,
  checkReservedColumnMatch,
} from "./reservedColumns";

describe("reservedColumns configuration", () => {
  test("INTAKE_RESERVED_COLUMNS includes expected columns", () => {
    expect(INTAKE_RESERVED_COLUMNS).toContain("SSN");
    expect(INTAKE_RESERVED_COLUMNS).toContain("FirstName");
    expect(INTAKE_RESERVED_COLUMNS).toContain("LastName");
  });

  test("checkReservedColumnMatch performs case-insensitive matching for Intake", () => {
    expect(checkReservedColumnMatch("ssn", "Intake")).toBe("SSN");
    expect(checkReservedColumnMatch("SSN", "Intake")).toBe("SSN");
    expect(checkReservedColumnMatch("firstname", "Intake")).toBe("FirstName");
    expect(checkReservedColumnMatch("FIRSTNAME", "Intake")).toBe("FirstName");
    expect(checkReservedColumnMatch("street_address", "Intake")).toBe("Street_Address");
  });

  test("checkReservedColumnMatch returns null for unreserved keys", () => {
    expect(checkReservedColumnMatch("My_Custom_Field", "Intake")).toBeNull();
    expect(checkReservedColumnMatch("CustomField", "Form")).toBeNull();
  });

  test("getReservedColumnsForFormType returns appropriate lists", () => {
    expect(getReservedColumnsForFormType("Intake")).toBe(INTAKE_RESERVED_COLUMNS);
    expect(getReservedColumnsForFormType("Form")).toBe(FORM_RESERVED_COLUMNS);
  });
});
