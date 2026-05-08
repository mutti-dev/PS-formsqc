import React, { useState } from "react";
import { Container, Card, Button, Badge, Alert } from "react-bootstrap";
import { ClipboardCheck, Clipboard } from "react-bootstrap-icons";

const PROMPT = `I'm attaching a form document. Please analyze it and create an Excel file with the following exact columns in this order:

Label | Key | KeyLength | Type | Format | Option Labels | Option Values

Column rules:
- Label — the human-readable field name as it appears on the form (e.g. "Date of Birth")
- Key — a programmatic key derived from the Label: replace spaces with underscores, remove all special characters except letters/numbers/underscores (e.g. "Date_of_Birth")
- KeyLength — the character count of the Key (e.g. 13)
- Type — the Form.io field type. Use only these values: textfield, textarea, number, checkbox, datetime, select, radio, email, phoneNumber, currency, signature, content, panel, button
- Format — only fill this for datetime fields (e.g. MM/dd/yyyy), leave blank for all other types
- Option Labels — for select and radio fields only: the display options separated by " || " (e.g. Yes || No || Maybe). Leave blank for all other types.
- Option Values — for select and radio fields only: the data values separated by " || " (e.g. yes || no || maybe). If values are the same as labels, repeat them. Leave blank for all other types.

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
- Submit or action button → button

Output: Produce the result as a downloadable .xlsx file with one row per field, in the order the fields appear in the document. Do not include any extra columns or sheets.`;

const TYPE_EXAMPLES = [
  { type: "textfield",   description: "Single-line text input" },
  { type: "textarea",    description: "Multi-line / paragraph text" },
  { type: "number",      description: "Numeric input" },
  { type: "checkbox",    description: "Single yes/no tick box" },
  { type: "datetime",    description: "Date or date+time picker" },
  { type: "select",      description: "Dropdown with multiple choices" },
  { type: "radio",       description: "Pick-one button group" },
  { type: "email",       description: "Email address field" },
  { type: "phoneNumber", description: "Phone number field" },
  { type: "currency",    description: "Dollar / currency amount" },
  { type: "signature",   description: "Signature box" },
  { type: "content",     description: "Section heading or instructions" },
  { type: "panel",       description: "Collapsible group of fields" },
  { type: "button",      description: "Submit or action button" },
];

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
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header>
          <h5 className="fw-semibold mb-0">Supported Field Types</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            {TYPE_EXAMPLES.map(({ type, description }) => (
              <div
                key={type}
                className="d-flex align-items-center gap-2 rounded px-3 py-2 border"
                style={{ minWidth: "220px" }}
                title={description}
              >
                <Badge bg="info" className="font-monospace">{type}</Badge>
                <span className="small text-muted">{description}</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Excel format reference */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header>
          <h5 className="fw-semibold mb-0">Expected Excel Format</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-sm mb-0 font-monospace small">
              <thead className="table-dark">
                <tr>
                  <th>Label</th>
                  <th>Key</th>
                  <th>KeyLength</th>
                  <th>Type</th>
                  <th>Format</th>
                  <th>Option Labels</th>
                  <th>Option Values</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Full Name</td>
                  <td>Full_Name</td>
                  <td>9</td>
                  <td>textfield</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Date of Birth</td>
                  <td>Date_of_Birth</td>
                  <td>13</td>
                  <td>datetime</td>
                  <td>MM/dd/yyyy</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>Gender</td>
                  <td>6</td>
                  <td>radio</td>
                  <td></td>
                  <td>Male || Female || Other</td>
                  <td>Male || Female || Other</td>
                </tr>
                <tr>
                  <td>Program Type</td>
                  <td>Program_Type</td>
                  <td>12</td>
                  <td>select</td>
                  <td></td>
                  <td>Option A || Option B</td>
                  <td>option_a || option_b</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

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