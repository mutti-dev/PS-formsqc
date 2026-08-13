/**
 * Reserved Database Columns Configuration
 * 
 * Define reserved column names for Intake forms and General Forms.
 * Any component field key matching these columns (case-insensitively)
 * will trigger a validation error.
 */

// Reserved columns specific to Intake forms
export const INTAKE_RESERVED_COLUMNS = [
  "ProgramDesire",
  "CallTrackId",
  "Comments",
  "RawComments",
  "hdnSaveAsTemplates",
  "Caption",
  "VictimId",
  "FirstName",
  "MiddleName",
  "LastName",
  "DOB",
  "HiddenSSN",
  "SSN",
  "Street_Address",
  "Apartment",
  "City",
  "ZipCode",
  "County",
  "State",
  "StateShortName",
  "Country",
  "Mobile",
  "PhoneNo",
  "AlternateContactNo",
  "Email",
  "AlternateEmail",
  "EmergencyContactName",
  "EmergencyContactNo",
  "EmergencyContactRelationship",
  "EducationLevel",
  "Veteran",
  "Disabled",
  "strHouseholdMarketRent",
  "strHouseholdResidentRent",
  "strBalanceDue",
  "HouseholdLeasestart",
  "HouseholdLeaseEnd",
  "CareStartDate",
  "CareEndDate",
  "CareAmount",
  "CaseNumber",
  "ProjectPhaseId",
  "StartDate",
  "ProjectTemplateId",
  "cmbProjectCaseLead",
  "coLocation",
  "PublishedFlag",
  "CustomerId",
  "IsHouseHold",
  "RawStartDate",
  "ResourceId",
  "cmbProjectCategories",
  "cmbProjectTeams",
  "cmbProjectOwners",
  "cmbProgramsTemplates",
  "CaseId",
  "ProjectId",
  "IntakeStatusId",
  "CreationTime",
  "Creator",
  "Status"
];

// Reserved columns specific to General Forms (add reserved column names here if needed)
export const FORM_RESERVED_COLUMNS = [
  "Id",
"FormFilledId",
"FormLinkId",
"ProjectId",
"TaskId",
"ActivityName",
"ResourceId",
"FormName",
"FormFilled_Name",
"FormFilled_Email",
"FormFilled_ContactNo",
"Name",
"Email",
"ContactNo",
"IsSubmitted",
"FileId",
"IsFormWorkFlow",
"FormStatusId",
"submit",
"CreationTime",
"UpdationTime",
"DeletionTime",
"Creator",
"Updater",
"RemoteHost",
"Status"
];

/**
 * Returns the list of reserved columns for a given form type ("Intake" or "Form").
 *
 * @param {string} formType - "Intake" or "Form"
 * @returns {string[]} Array of reserved column names
 */
export const getReservedColumnsForFormType = (formType) => {
  if (formType === "Intake") {
    return INTAKE_RESERVED_COLUMNS;
  }
  if (formType === "Form") {
    return FORM_RESERVED_COLUMNS;
  }
  return [...INTAKE_RESERVED_COLUMNS, ...FORM_RESERVED_COLUMNS];
};

/**
 * Checks if a given field key matches any reserved column for the specified formType.
 * Comparison is case-insensitive.
 *
 * @param {string} fieldKey - The field key to validate
 * @param {string} formType - "Intake" or "Form"
 * @returns {string|null} The matching reserved column name if matched, or null if no match.
 */
export const checkReservedColumnMatch = (fieldKey, formType = "Form") => {
  if (!fieldKey || typeof fieldKey !== "string") return null;

  const reservedList = getReservedColumnsForFormType(formType);
  if (!Array.isArray(reservedList) || reservedList.length === 0) return null;

  const lowerKey = fieldKey.trim().toLowerCase();

  const match = reservedList.find(
    (col) => col && typeof col === "string" && col.trim().toLowerCase() === lowerKey
  );

  return match || null;
};
