import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import {
  deepParse,
  formatJsonString,
  searchKeysInObject,
  isValidJson,

  extractJsonKeys,
  countJsonElements,
} from "../utils/jsonUtils";

function JsonFormatter() {
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState("");
  const [searchKeys, setSearchKeys] = useState("");

  const resetState = () => {
    setError("");


  };

  const calculateJsonDepth = (obj, depth = 0) => {
    if (obj === null || typeof obj !== "object") return depth;
    if (Array.isArray(obj)) {
      return Math.max(
        depth,
        ...obj.map((i) => calculateJsonDepth(i, depth + 1))
      );
    }
    return Math.max(
      depth,
      ...Object.values(obj).map((v) => calculateJsonDepth(v, depth + 1))
    );
  };

  const handleFormat = () => {
    resetState();

    if (!isValidJson(rawJson)) {
      setError("Invalid JSON format. Please check your input.");
      return;
    }

    try {
      const parsed = deepParse(JSON.parse(rawJson));
      const formatted = formatJsonString(parsed);

      // ✅ format INSIDE same textarea
      setRawJson(formatted);

      const stats = {
        totalElements: countJsonElements(parsed),
        uniqueKeys: extractJsonKeys(parsed).length,
        isArray: Array.isArray(parsed),
        depth: calculateJsonDepth(parsed),
      };
      setJsonStats(stats);

      if (searchKeys.trim()) {
        const keys = searchKeys
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        setKeyResults(searchKeysInObject(parsed, keys));
      }
    } catch (err) {
      setError("Error processing JSON: " + err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
  };

  const handleClear = () => {
    setRawJson("");
    setSearchKeys("");
    resetState();
  };



  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col xxl={10} xl={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="border-0 py-4 text-center">
              <h1 className="display-5 fw-bold text-primary mb-2">
                JSON Formatter & Beautifier
              </h1>
              <p className="text-muted fs-5">
                Format, validate and analyze JSON data
              </p>
            </Card.Header>

            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              <Row className="g-4 mb-4">
                <Col lg={12}>
                  <Card className="h-100">
                    <Card.Header className="d-flex justify-content-between">
                      <Card.Title className="mb-0">JSON Input</Card.Title>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleFormat}
                          disabled={!rawJson.trim()}
                        >
                          Format JSON
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={handleClear}
                        >
                          Clear
                        </Button>
                        {rawJson && (
                          <OverlayTrigger
                            overlay={<Tooltip>Copy JSON</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={handleCopy}
                            >
                              Copy
                            </Button>
                          </OverlayTrigger>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Form.Control
                        as="textarea"
                        rows={14}
                        value={rawJson}
                        onChange={(e) => setRawJson(e.target.value)}
                        placeholder="Paste JSON here..."
                        className="font-monospace border-0"
                      />
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between">
                      <small className="text-muted">
                        Characters: {rawJson.length}
                      </small>
                      {isValidJson(rawJson) && rawJson.trim() && (
                        <Badge bg="success">Valid JSON</Badge>
                      )}
                    </Card.Footer>
                  </Card>
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default JsonFormatter;
