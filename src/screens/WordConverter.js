import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import { copyToClipboard, convertText, limitText } from "../utils/utils";
import { CodeSlash, FileWord } from "react-bootstrap-icons";

export default function WordConverter({ theme = "dark" }) {
  // ── Tab 1: API Key / Text Converter State ──
  const [apiInputText, setApiInputText] = useState("");
  const [apiConvertedText, setApiConvertedText] = useState("");
  const [apiAlertMessage, setApiAlertMessage] = useState("");
  const [showApiAlert, setShowApiAlert] = useState(false);

  // ── Tab 2: Word to Options JSON State ──
  const [wordInputText, setWordInputText] = useState("");
  const [wordResult, setWordResult] = useState([]);
  const [wordCopied, setWordCopied] = useState(false);

  // Handlers for Tab 1
  const handleApiConvert = () => {
    if (!apiInputText.trim()) return;
    const converted = convertText(apiInputText);
    setApiConvertedText(converted);
    copyToClipboard(converted);
    setApiAlertMessage("Text converted and copied to clipboard!");
    setShowApiAlert(true);
    setTimeout(() => setShowApiAlert(false), 3000);
  };

  const handleApiLimited = () => {
    if (!apiInputText.trim()) return;
    const converted = limitText(apiInputText, 110);
    setApiConvertedText(converted);
    copyToClipboard(converted);
    setApiAlertMessage("Limited text copied to clipboard!");
    setShowApiAlert(true);
    setTimeout(() => setShowApiAlert(false), 3000);
  };

  const handleApiCopyResult = () => {
    if (apiConvertedText) {
      copyToClipboard(apiConvertedText);
      setApiAlertMessage("Converted text copied to clipboard!");
      setShowApiAlert(true);
      setTimeout(() => setShowApiAlert(false), 3000);
    }
  };

  // Handlers for Tab 2
  const convertWords = () => {
    const words = wordInputText
      .split(/\r?\n/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) {
      setWordResult([]);
      return;
    }

    const converted = words.map((word) => ({
      label: word,
      value: word
        .replace(/\s+/g, "_")
        .replace(/[^A-Za-z0-9_]/g, ""),
    }));

    setWordResult(converted);
  };

  const handleWordCopy = () => {
    if (wordResult.length === 0) return;
    const json = JSON.stringify(wordResult, null, 2);
    navigator.clipboard.writeText(json);
    setWordCopied(true);
    setTimeout(() => setWordCopied(false), 2000);
  };

  return (
    <Container fluid className="min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col>
          {/* Header Card */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="py-4 text-center">
              <h1 className="display-5 fw-bold text-primary mb-1">
                Text & Option Tools
              </h1>
              <p className="text-body-secondary mb-0">
                Convert raw text into Form.io API keys or formatted dropdown option JSON objects.
              </p>
            </Card.Header>
          </Card>

          {/* Main Tabbed Card */}
          <Card className="shadow-sm border">
            <Card.Body className="p-4">
              <Tabs defaultActiveKey="apiKey" id="converter-tools-tabs" className="mb-4">
                {/* ── Tab 1: API Key / Text Converter ── */}
                <Tab
                  eventKey="apiKey"
                  title={
                    <span className="d-flex align-items-center gap-2 fw-semibold">
                      <CodeSlash /> API Maker & Text Converter
                    </span>
                  }
                >
                  {showApiAlert && (
                    <Alert variant="success" onClose={() => setShowApiAlert(false)} dismissible>
                      {apiAlertMessage}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Input Text</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={apiInputText}
                      onChange={(e) => setApiInputText(e.target.value)}
                      placeholder="Enter text to convert into programmatic keys..."
                      className="font-monospace"
                      style={{ resize: "vertical" }}
                    />
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-body-secondary">
                        Character count: <Badge bg="secondary">{apiInputText.length}</Badge>
                      </small>
                      {apiInputText.length > 110 && (
                        <Badge bg="warning" text="dark">
                          Exceeds 110 characters
                        </Badge>
                      )}
                    </div>
                  </Form.Group>

                  <div className="d-flex gap-2 flex-wrap mb-4">
                    <Button
                      variant="primary"
                      onClick={handleApiConvert}
                      disabled={!apiInputText.trim()}
                    >
                      Convert Text
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={handleApiLimited}
                      disabled={!apiInputText.trim()}
                    >
                      Limit to 110 Characters
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setApiInputText("")}
                      disabled={!apiInputText.trim()}
                    >
                      Clear Input
                    </Button>
                  </div>

                  {apiConvertedText && (
                    <Card className="border">
                      <Card.Header className="d-flex justify-content-between align-items-center py-2 bg-body-tertiary">
                        <span className="fw-semibold small">Converted Result</span>
                        <div className="d-flex gap-2 align-items-center">
                          <small className="text-body-secondary">
                            Length: <Badge bg="info">{apiConvertedText.length}</Badge>
                          </small>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={handleApiCopyResult}
                          >
                            Copy
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <div className="p-3 rounded font-monospace bg-body-tertiary border text-break">
                          {apiConvertedText}
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </Tab>

                {/* ── Tab 2: Word to Dropdown Options ── */}
                <Tab
                  eventKey="wordOptions"
                  title={
                    <span className="d-flex align-items-center gap-2 fw-semibold">
                      <FileWord /> Word to Dropdown Converter
                    </span>
                  }
                >
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Input Words / Options</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={wordInputText}
                      onChange={(e) => setWordInputText(e.target.value)}
                      placeholder="Enter one word or phrase per line..."
                      className="font-monospace"
                      style={{ resize: "vertical" }}
                    />
                    <div className="mt-2 text-body-secondary small">
                      {wordInputText ? `${wordInputText.split(/\n/).filter(Boolean).length} lines` : "No input"}
                    </div>
                  </Form.Group>

                  <div className="d-flex gap-2 flex-wrap mb-4">
                    <Button
                      variant="primary"
                      onClick={convertWords}
                      disabled={!wordInputText.trim()}
                    >
                      Convert to Options
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setWordInputText("");
                        setWordResult([]);
                      }}
                      disabled={!wordInputText.trim()}
                    >
                      Clear Input
                    </Button>
                  </div>

                  {wordCopied && (
                    <Alert variant="success" className="text-center">
                      Copied JSON to clipboard!
                    </Alert>
                  )}

                  {wordResult.length > 0 && (
                    <Card className="border">
                      <Card.Header className="d-flex justify-content-between align-items-center py-2 bg-body-tertiary">
                        <span className="fw-semibold small">Ready-to-Use Options JSON ({wordResult.length} items)</span>
                        <Button variant="success" size="sm" onClick={handleWordCopy}>
                          Copy JSON
                        </Button>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <pre className="mb-0 font-monospace small bg-dark text-success p-3 rounded" style={{ maxHeight: "300px", overflowY: "auto" }}>
                          {JSON.stringify(wordResult, null, 2)}
                        </pre>
                      </Card.Body>
                    </Card>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}