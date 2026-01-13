import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
} from "react-bootstrap";

export default function WordConverter() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState([]);
  const [copied, setCopied] = useState(false);

  const convertWords = () => {
    const words = inputText
      .split(/\r?\n/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) {
      setResult([]);
      return;
    }

    const converted = words.map((word) => ({
      label: word,
      value: word
        .replace(/\s+/g, "_")        // spaces → underscores
        .replace(/[^A-Za-z0-9_]/g, "") // remove special chars, keep case
    }));

    setResult(converted);
  };

  const copyToClipboard = () => {
    if (result.length === 0) return;

    const json = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputText("");
    setResult([]);
  };

  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="text-primary text-center py-4">
              <h1 className="display-6 fw-bold mb-0">Word to Dropdown Converter</h1>

            </Card.Header>

            <Card.Body className="p-4">
              {/* Input */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Input Words</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter one word or phrase per line"
                  className="font-monospace"
                  style={{ resize: "vertical" }}
                />
                <div className="mt-2 text-muted small">
                  {inputText ? `${inputText.split(/\n/).filter(Boolean).length} lines` : "No input"}
                </div>
              </Form.Group>

              {/* Actions */}
              <div className="d-flex gap-3 mb-4 justify-content-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={convertWords}
                  disabled={!inputText.trim()}
                >
                  Convert to Options
                </Button>
                <Button variant="outline-secondary" onClick={clearAll}>
                  Clear
                </Button>
              </div>

              {/* Success Alert */}
              {copied && (
                <Alert variant="success" className="text-center">
                  Copied JSON to clipboard!
                </Alert>
              )}

              {/* Results */}
              {result.length > 0 && (
                <>
                  <div className="text-center mb-3">
                    <Button variant="success" onClick={copyToClipboard}>
                      Copy JSON to Clipboard
                    </Button>
                  </div>

                  <h5 className="text-center text-muted mb-3">
                    {result.length} options generated
                  </h5>

                  <div className="table-responsive mb-4">
                    <Table striped bordered hover size="sm">
                      <thead className="table-dark">
                        <tr>
                          <th>#</th>
                          <th>Label (Original)</th>
                          <th>Value (Converted)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.map((item, i) => (
                          <tr key={i}>
                            <td className="text-center">{i + 1}</td>
                            <td>{item.label}</td>
                            <td>
                              <code>{item.value || "(empty)"}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <Card>
                    <Card.Header className="fw-semibold">Ready-to-Use JSON</Card.Header>
                    <Card.Body>
                      <pre className="mb-0 font-monospace small text-success">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}