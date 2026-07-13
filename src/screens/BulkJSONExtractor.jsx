import React, { useState } from "react";
import { Container, Card, Row, Col, Button, Form, Badge, Alert } from "react-bootstrap";
import { deepParse, countJsonElements, extractJsonKeys } from "../utils/jsonUtils";
import { extractLabelsFromJSON } from "../utils/utils";

// Simple helper to download an object as JSON file
const downloadJson = (obj, filename) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function BulkJSONExtractor() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleParse = () => {
    setError(null);
    const lines = inputText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setError("No JSON lines found in input");
      setResults([]);
      return;
    }

    const parsed = lines.map((line, idx) => {
      try {
        const obj = deepParse(line);
        const formName = obj?.title || obj?.name || `Form ${idx + 1}`;
        const extracted = extractLabelsFromJSON(obj || {});
        const jsonStats = {
          totalElements: countJsonElements(obj),
          uniqueKeys: extractJsonKeys(obj).length,
          isArray: Array.isArray(obj),
        };

        return { index: idx, formName, obj, extracted, jsonStats, error: null };
      } catch (e) {
        return { index: idx, formName: `Line ${idx + 1}`, obj: null, extracted: [], jsonStats: null, error: e.message };
      }
    });

    setResults(parsed);
  };

  const handleDownloadCombined = () => {
    const report = {};
    results.forEach((r) => {
      report[r.formName] = {
        error: r.error,
        jsonStats: r.jsonStats,
        extractedLabels: r.extracted,
        raw: r.obj,
      };
    });

    downloadJson(report, `bulk-json-report-${new Date().toISOString().split("T")[0]}.json`);
  };

  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col xl={10} lg={11} md={12} sm={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="py-3">
              <h3 className="mb-0">Bulk JSON Extractor</h3>
              <div className="small text-muted">Paste multiple JSON objects (one per line).</div>
            </Card.Header>

            <Card.Body>
              {error && <Alert variant="warning">{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Input (one JSON per line)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste newline-separated JSON objects here...`}
                  className="font-monospace"
                />
                <div className="mt-2 text-muted small">
                  {inputText ? `${inputText.split(/\r?\n/).filter(Boolean).length} lines` : "No input"}
                </div>
              </Form.Group>

              <div className="d-flex gap-2 mb-3">
                <Button variant="primary" onClick={handleParse} disabled={!inputText.trim()}>
                  Parse
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => { setInputText(""); setResults([]); setError(null); }}
                >
                  Clear
                </Button>
                <div className="ms-auto">
                  <Button variant="success" onClick={handleDownloadCombined} disabled={results.length === 0}>
                    Download Combined JSON
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div>
                {results.length === 0 && (
                  <div className="text-muted">No parsed forms yet.</div>
                )}

                {results.map((r) => (
                  <Card key={r.index} className="mb-2">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{r.formName}</h6>
                          {r.error ? (
                            <div className="small text-danger">Error: {r.error}</div>
                          ) : (
                            <div className="small text-muted">
                              Extracted labels: <Badge bg="info">{(r.extracted || []).length}</Badge>
                              <span className="ms-3">Elements: <Badge bg="secondary">{r.jsonStats?.totalElements ?? 0}</Badge></span>
                            </div>
                          )}
                        </div>
                        <div className="text-end small text-muted">
                          <div>Line {r.index + 1}</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
