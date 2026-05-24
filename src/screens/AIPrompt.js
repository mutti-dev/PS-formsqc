import React, { useState } from "react";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { ClipboardCheck, Clipboard } from "react-bootstrap-icons";

const PROMPT = `I'm attaching a form document. Please analyze it and create an Excel file with the following exact columns in this order:

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

Please note that no field have same label and Key. make it meaningful according to document uploaded

`;




export default function AIPrompt() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Container fluid className="min-vh-100 py-4">

      {/* Page header */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="py-4">
          <h1 className="display-5 fw-bold text-center text-primary mb-1">
            AI Prompt — Excel Generator
          </h1>
          <p className="text-center text-muted mb-0">
            Copy this prompt, open any AI (Claude, ChatGPT, etc.), attach your PDF or Word form, and paste.
            The AI will produce an Excel file you can import directly in <strong>Form Review</strong>.
          </p>
        </Card.Header>
      </Card>

      {/* How to use */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header>
          <h5 className="fw-semibold mb-0">How to use</h5>
        </Card.Header>
        <Card.Body>
          <ol className="mb-0" style={{ lineHeight: "2" }}>
            <li>Click <strong>Copy Prompt</strong> below.</li>
            <li>Open your AI tool and start a new chat.</li>
            <li>Attach your <strong>PDF or Word</strong> form document.</li>
            <li>Paste the prompt and send.</li>
            <li>Download the <code>.xlsx</code> file the AI produces.</li>
            <li>Go to <strong>Form Review</strong> and click <strong>Import from Excel</strong>.</li>
          </ol>
        </Card.Body>
      </Card>

      {/* Prompt box */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="fw-semibold mb-0">Prompt</h5>
          <Button
            variant={copied ? "success" : "primary"}
            onClick={handleCopy}
            className="d-flex align-items-center gap-2"
          >
            {copied ? (
              <><ClipboardCheck size={16} /> Copied!</>
            ) : (
              <><Clipboard size={16} /> Copy Prompt</>
            )}
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <pre
            className="mb-0 p-4 font-monospace"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.85rem",
              borderRadius: "0 0 0.375rem 0.375rem",
            }}
          >
            {PROMPT}
          </pre>
        </Card.Body>
      </Card>

      {/* Type reference */}
      

      {/* Excel format reference */}
      

      {copied && (
        <Alert
          variant="success"
          className="position-fixed bottom-0 end-0 m-3"
          style={{ zIndex: 9999, width: "260px" }}
        >
          <ClipboardCheck className="me-2" />
          Prompt copied to clipboard!
        </Alert>
      )}

    </Container>
  );
}
