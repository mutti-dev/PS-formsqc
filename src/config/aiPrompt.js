export const AI_PROMPT_TEXT = `I'm attaching a form document. Please analyze it and create an Excel file with the following exact columns in this order:

Label | Key | KeyLength | Type | Format | Option Labels | Option Values | Parent

Column rules:
- Label — the human-readable field name as it appears on the form (e.g. "Date of Birth")
- Key — a programmatic key derived from the Label: replace spaces with underscores, remove all special characters except letters/numbers/underscores (e.g. "Date_of_Birth"). It should not be greater than 120 characters. the key of Datagrid should have the key word (Data_Grid). e.g('Child_Information_Data_Grid')
- KeyLength — the character count of the Key (e.g. 13)
- Type — the Form.io field type. Use only these values: textfield, textarea, number, checkbox, datetime, select, radio, email, phoneNumber, currency, signature, content, panel, datagrid
- Format — only fill this for datetime fields (e.g. MM-dd-yyyy), leave blank for all other types
- Option Labels — for select and radio fields only: the display options separated by " || " (e.g. Yes || No || Maybe). Leave blank for all other types.
- Option Values — for select and radio fields only: the data values separated by " || " (e.g. Yes || No || Maybe). If values are the same as labels, repeat them. replace spaces with underscores, remove all special characters except letters/numbers/underscores (e.g. "I_Agree_to_terms_and_Condition").Leave blank for all other types.
- Parent — the Key of the panel or datagrid this field belongs to. Leave blank for top-level components (panels, datagrids, content blocks, buttons). Every regular field must have a Parent.

Hierarchy rules:
- Panels and datagrids are top-level containers — their Parent column is blank.
- Every field inside a panel or datagrid must have the Parent column set to the Key of its parent panel/datagrid.
- Fields inside a panel will be automatically laid out in a 2-column grid (left + right, 6 width each).
- Fields inside a datagrid are placed directly as rows (no column layout).
- A datagrid can be a child of a panel — set its Parent to the panel's Key.

Type mapping guide:
- Single-line text input → textfield
- Multi-line / paragraph text → textarea
- Numeric input → number
- Yes/No tick box (single) → checkbox
- Date or date+time picker → datetime
- Dropdown with multiple choices → select
- Multiple choice (pick one, shown as buttons/dots) → radio
- Email address field → email
- Phone number field → phoneNumber
- Dollar/currency amount → currency
- Signature box → signature
- Section heading or instructional text → content
- A collapsible group/section of fields → panel
- A repeatable table of rows → datagrid
- Submit or action button → button

Output: Produce the result as a downloadable .xlsx file with one row per field, in the order the fields appear in the document. Do not include any extra columns or sheets.

Please note that no field have same label and Key. make it meaningful according to document uploaded`;
