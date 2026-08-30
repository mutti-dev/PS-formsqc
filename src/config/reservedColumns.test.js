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

  test("checkReservedColumnMatch only checks datagrid reserved columns when insideGrid is true", () => {
    // Reserved in datagrid
    expect(checkReservedColumnMatch("status", "Intake", true)).toBe("Status");
    expect(checkReservedColumnMatch("Status", "Form", true)).toBe("Status");
    expect(checkReservedColumnMatch("id", "Form", true)).toBe("Id");
    expect(checkReservedColumnMatch("Id", "Intake", true)).toBe("Id");
    expect(checkReservedColumnMatch("statusId", "Form", true)).toBe("StatusId");
    expect(checkReservedColumnMatch("status_id", "Intake", true)).toBe("StatusId");
    expect(checkReservedColumnMatch("parentId", "Form", true)).toBe("ParentId");
    expect(checkReservedColumnMatch("parent_id", "Intake", true)).toBe("ParentId");
    expect(checkReservedColumnMatch("creationTime", "Form", true)).toBe("CreationTime");
    expect(checkReservedColumnMatch("creation_time", "Intake", true)).toBe("CreationTime");
    expect(checkReservedColumnMatch("updationTime", "Form", true)).toBe("UpdationTime");
    expect(checkReservedColumnMatch("updation_time", "Intake", true)).toBe("UpdationTime");

    // Allowed under datagrid (not reserved)
    expect(checkReservedColumnMatch("name", "Form", true)).toBeNull();
    expect(checkReservedColumnMatch("Name", "Form", true)).toBeNull();
    expect(checkReservedColumnMatch("email", "Form", true)).toBeNull();
    expect(checkReservedColumnMatch("Email", "Intake", true)).toBeNull();
    expect(checkReservedColumnMatch("FirstName", "Intake", true)).toBeNull();
    expect(checkReservedColumnMatch("LastName", "Intake", true)).toBeNull();
    expect(checkReservedColumnMatch("DOB", "Intake", true)).toBeNull();
  });

  test("getReservedColumnsForFormType returns appropriate lists", () => {
    expect(getReservedColumnsForFormType("Intake")).toBe(INTAKE_RESERVED_COLUMNS);
    expect(getReservedColumnsForFormType("Form")).toBe(FORM_RESERVED_COLUMNS);
  });
});
