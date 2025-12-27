import React, { useState } from "react";
import {
  extractLabelsFromJSON,
  extractSelectValues,
  extractSurveyValues,
} from "../utils/utils";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Alert,
  Spinner,
  Tabs,
  Tab,
  ProgressBar,
} from "react-bootstrap";
import {
  extractFormJson,
  deepParse,
  isValidJson,
  extractJsonKeys,
  countJsonElements,
  searchKeysInObject,
  formatJsonString,
} from "../utils/jsonUtils";

import { exportToExcel, exportJsonData } from "../utils/exportUtils";

import {
  DuplicateLabelsSection,
  DuplicateAPISection,
  DuplicateValuesSection,
  SelectComponentsSection,
  SurveyComponentsSection,
  KeyLengthWarningsSection,
  DuplicateSurveyValuesSection,
  TypeFilterSection,
  JsonStatsSection
} from "../common/sections";



export default function JSONExtractor() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState([
    "columns",
    "content",
    "container",
    "panel",
    "button"
  ]);
  const [keyLengthThreshold, setKeyLengthThreshold] = useState(110);
  const [searchKeys, setSearchKeys] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [jsonStats, setJsonStats] = useState(null);
  const [activeTab, setActiveTab] = useState("extraction");
  const [parsingSteps, setParsingSteps] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const resetState = () => {
    setError("");
  };

  const calculateJsonDepth = (obj, currentDepth = 0) => {
    if (!obj || typeof obj !== "object") return currentDepth;

    if (Array.isArray(obj)) {
      return Math.max(
        currentDepth,
        ...obj.map((item) => calculateJsonDepth(item, currentDepth + 1))
      );
    }

    const depths = Object.values(obj).map((value) =>
      calculateJsonDepth(value, currentDepth + 1)
    );
    return Math.max(currentDepth, ...depths);
  };


  // TODO I will write steps here to review the form
  const addParsingStep = (step, success = true, details = "") => {
    setParsingSteps((prev) => [
      ...prev,
      {
        step,
        success,
        details,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleExtract = () => {
    if (!jsonInput.trim()) {
      setError("Please paste your JSON data");
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchResults([]);
    setJsonStats(null);
    setData([]);
    setParsingSteps([]);

    try {
      addParsingStep("Starting JSON extraction");

      // Step 1: Basic validation
      if (!isValidJson(jsonInput)) {
        setError("Invalid JSON format. Please check your input.");
        addParsingStep("JSON validation", false, "Input is not valid JSON");
        return;
      }
      addParsingStep("JSON validation", true, "Input is valid JSON");

      // Step 2: Extract form JSON using specialized function
      addParsingStep("Extracting form structure");
      const formConfig = extractFormJson(jsonInput);


      if (!formConfig) {
        setError("Could not extract form configuration from JSON");
        addParsingStep("Form extraction", false, "No form components found");
        return;
      }
      addParsingStep(
        "Form extraction",
        true,
        `Found form structure with ${
          formConfig.components?.length || 0
        } components`
      );

      // Step 3: Extract labels from form config
      addParsingStep("Extracting labels from form");
      const extracted = extractLabelsFromJSON(formConfig);

      if (!extracted || extracted.length === 0) {
        setError("No labels found in the form configuration");
        addParsingStep("Label extraction", false, "No labels found");
        return;
      }
      addParsingStep(
        "Label extraction",
        true,
        `Extracted ${extracted.length} labels`
      );

      setData(extracted);

      // Step 4: Calculate statistics
      addParsingStep("Calculating statistics");
      const parsedJson = deepParse(jsonInput);
      const stats = {
        totalElements: countJsonElements(parsedJson),
        uniqueKeys: extractJsonKeys(parsedJson).length,
        isArray: Array.isArray(parsedJson),
        depth: calculateJsonDepth(parsedJson),
        formElements: extracted.length,
        originalJsonSize: jsonInput.length,
        parsedJsonSize: JSON.stringify(parsedJson).length,
      };
      setJsonStats(stats);
      addParsingStep(
        "Statistics calculation",
        true,
        `Found ${stats.formElements} form elements`
      );

      // Step 5: Process search keys if any
      if (searchKeys.trim()) {
        addParsingStep("Processing search keys");
        const keysToSearch = searchKeys
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        const results = searchKeysInObject(parsedJson, keysToSearch);
        setSearchResults(results);
        addParsingStep(
          "Key search",
          true,
          `Found ${results.filter((r) => r.found).length} of ${
            keysToSearch.length
          } keys`
        );
      }

      addParsingStep(
        "Extraction completed successfully",
        true,
        `Total: ${extracted.length} items`
      );
    } catch (err) {
      console.error("Extraction error:", err);
      addParsingStep("Extraction failed", false, err.message);
      setError(
        `Error processing JSON: ${err.message}. Please check the JSON structure.`
      );

 
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setData([]);
    setError("");
    setFilter("");
    setSearchKeys("");
    setSearchResults([]);
    setJsonStats(null);
    setParsingSteps([]);
  };

  const toggleTypeVisibility = (type) => {
    setHiddenTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };



  



  const handleFormat = () => {
    resetState();

    if (!isValidJson(jsonInput)) {
      setError("Invalid JSON format. Please check your input.");
      return;
    }

    try {
      const parsed = deepParse(JSON.parse(jsonInput));
      const formatted = formatJsonString(parsed);
      setJsonInput(formatted);
    } catch (err) {
      setError("Error processing JSON: " + err.message);
    }
  };

  const filteredData = data.filter((entry) => {
    if (hiddenTypes.includes(entry.type)) return false;
    const lowerFilter = filter.toLowerCase();
    return (
      entry.label?.toLowerCase().includes(lowerFilter) ||
      entry.key?.toLowerCase().includes(lowerFilter) ||
      entry.type?.toLowerCase().includes(lowerFilter) ||
      (entry.type === "panel" &&
        entry.title?.toLowerCase().includes(lowerFilter))
    );
  });

  const longKeys = data.filter(
    (entry) => entry.key && entry.key.length > keyLengthThreshold
  );

  const labelCounts = {};
  const keyCounts = {};

  data.forEach((entry) => {
    if (entry.type === "columns" || entry.type === "content") return;
    const labelKey = entry.type === "panel" ? entry.title : entry.label;
    if (!labelKey) return;
    labelCounts[labelKey] = (labelCounts[labelKey] || 0) + 1;

    const key = entry.key;
    if (key) {
      keyCounts[key] = (keyCounts[key] || 0) + 1;
    }
  });

  const duplicateLabels = Object.entries(labelCounts)
    .filter(([_, count]) => count > 1)
    .map(([label, count]) => ({ label, count }));

  const duplicateKeys = Object.entries(keyCounts)
    .filter(([_, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));

  const uniqueTypes = [...new Set(data.map((entry) => entry.type))];
  const selectValues = jsonInput ? extractSelectValues(jsonInput) : [];
  const surveyValues = jsonInput ? extractSurveyValues(jsonInput) : [];
  console.log("survey", surveyValues);

  return (
    <Container fluid className="min-vh-100 ">
      <Card className="mb-4 border shadow-sm">
        <Card.Header className="bg-dark border-bottom">
          <h1 className="display-5 fw-bold text-primary mb-2 text-center">
            JSON Extractor
          </h1>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0 fs-5 fw-semibold">
              JSON Input
            </Card.Title>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleFormat}
                disabled={!jsonInput.trim()}
              >
                Format JSON
              </Button>
              <Button variant="outline-danger" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Form.Group controlId="jsonInput">
            <Form.Control
              as="textarea"
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON data here..."
              className="font-monospace"
            />
          </Form.Group>

          <div className="mt-2 d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Characters: {jsonInput.length} | Lines:{" "}
              {jsonInput.split("\n").length}
            </small>
       
          </div>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {parsingSteps.length > 0 && (
            <Card className="mt-3 border">
              <Card.Header className="bg-dark">
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title className="mb-0 fs-6 fw-semibold">
                    Parsing Steps
                  </Card.Title>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    {showDebug ? "Hide Details" : "Show Details"}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <ProgressBar
                  now={
                    (parsingSteps.filter((s) => s.success).length /
                      Math.max(parsingSteps.length, 1)) *
                    100
                  }
                  variant={
                    parsingSteps[parsingSteps.length - 1]?.success
                      ? "success"
                      : "danger"
                  }
                  className="mb-2"
                />
                {showDebug && (
                  <div className="mt-2">
                    {parsingSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`d-flex align-items-center mb-1 ${
                          step.success ? "text-success" : "text-danger"
                        }`}
                      >
                        <span className="me-2">{step.success ? "✓" : "✗"}</span>
                        <small>
                          <strong>{step.step}:</strong> {step.details}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          <Row className="mt-3 align-items-center">
            <Col md={4}>
              <Button
                variant="primary"
                onClick={handleExtract}
                disabled={isLoading || !jsonInput.trim()}
                className="w-100"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Extracting...
                  </>
                ) : (
                  "Extract"
                )}
              </Button>
            </Col>
            
            <Col md={4}>
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="mb-0 fw-medium">Key Length:</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={keyLengthThreshold}
                  onChange={(e) =>
                    setKeyLengthThreshold(Number(e.target.value))
                  }
                  style={{ width: "100px" }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {data.length > 0 && (
        <Card className="border shadow-sm">
          <Card.Header className="bg-dark border-bottom">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0 border-0"
            >
              <Tab
                eventKey="extraction"
                title={`Extracted Labels (${data.length})`}
              />
              <Tab eventKey="statistics" title="JSON Statistics" />
             
            </Tabs>
            <div className="d-flex gap-2 mt-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => exportToExcel(data, hiddenTypes)}
              >
                Export Excel
              </Button>
             
            </div>
          </Card.Header>

          <Card.Body>
            {activeTab === "extraction" && (
              <>
                <Row>
                  <Col>
                    <DuplicateLabelsSection duplicateLabels={duplicateLabels} />
                    <DuplicateAPISection duplicateKeys={duplicateKeys} />
                    <DuplicateValuesSection selectValues={selectValues} />
                    <DuplicateSurveyValuesSection surveyValues={surveyValues} />
                    <SelectComponentsSection selectValues={selectValues} />
                    <SurveyComponentsSection surveyValues={surveyValues} />
                    <KeyLengthWarningsSection
                      longKeys={longKeys}
                      threshold={keyLengthThreshold}
                    />
                    <TypeFilterSection
                      uniqueTypes={uniqueTypes}
                      hiddenTypes={hiddenTypes}
                      onToggle={toggleTypeVisibility}
                    />
                   
                  </Col>
                </Row>

                <Card className="mt-4 border">
                  <Card.Body>
                    <Row className="mb-3 align-items-center">
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          placeholder="Search labels, keys, or types..."
                        />
                      </Col>
                      <Col md={6}>
                        <div className="text-md-end text-muted">
                          Showing {filteredData.length} of {data.length} items
                          {hiddenTypes.length > 0 && (
                            <Badge bg="danger" className="ms-2">
                              {hiddenTypes.length} type
                              {hiddenTypes.length > 1 ? "s" : ""} hidden
                            </Badge>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <div className="table-responsive">
                      <Table striped bordered hover className="mb-0">
                        <thead className="table-dark">
                          <tr>
                            <th>Label</th>
                            <th>Key</th>
                            <th>Key Length</th>
                            <th>Type</th>
                            <th>Format</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((entry, idx) => (
                            <tr key={idx}>
                              <td className="fw-medium">
                                {entry.type === "panel"
                                  ? entry.title
                                  : entry.label}
                              </td>
                              <td>
                                <code className="d-block text-break">
                                  {entry.key}
                                </code>
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    entry.key &&
                                    entry.key.length > keyLengthThreshold
                                      ? "danger"
                                      : "success"
                                  }
                                >
                                  {entry.key ? entry.key.length : 0}
                                  {entry.key &&
                                    entry.key.length > keyLengthThreshold &&
                                    " ⚠"}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg="primary">{entry.type}</Badge>
                              </td>
                              <td>{entry.format || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}

            {activeTab === "statistics" && jsonStats && (
              <Row>
                <Col>
                  <JsonStatsSection
                    jsonStats={jsonStats}
                    searchResults={searchResults}
                  />

                  <Card className="mt-4 border">
                    <Card.Header className="bg-dark">
                      <Card.Title className="mb-0 fs-5 fw-semibold">
                        JSON Structure Analysis
                      </Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Row className="text-center">
                        <Col md={4}>
                          <Card className="border">
                            <Card.Body>
                              <div className="display-4 fw-bold text-primary">
                                {jsonStats.totalElements}
                              </div>
                              <p className="text-muted mb-0">
                                Total JSON Elements
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="border">
                            <Card.Body>
                              <div className="display-4 fw-bold text-success">
                                {jsonStats.uniqueKeys}
                              </div>
                              <p className="text-muted mb-0">
                                Unique Property Keys
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="border">
                            <Card.Body>
                              <div className="display-4 fw-bold text-info">
                                {jsonStats.depth}
                              </div>
                              <p className="text-muted mb-0">
                                Maximum Nesting Depth
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      <Row className="mt-3 text-center">
                        <Col md={4}>
                          <Card className="border">
                            <Card.Body>
                              <div className="display-4 fw-bold text-warning">
                                {jsonStats.formElements}
                              </div>
                              <p className="text-muted mb-0">
                                Form Fields Extracted
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="border">
                            <Card.Body>
                              <div className="display-4 fw-bold text-info">
                                {jsonStats.isArray ? "Array" : "Object"}
                              </div>
                              <p className="text-muted mb-0">Structure Type</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="border">
                            <Card.Body>
                              <div className="display-4 fw-bold text-dark">
                                {duplicateKeys.length}
                              </div>
                              <p className="text-muted mb-0">Duplicate Keys</p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {activeTab === "search" && (
              <Row>
                <Col>
                  {searchResults.length > 0 ? (
                    <Card className="border">
                      <Card.Header className="bg-dark">
                        <Card.Title className="mb-0 fs-5 fw-semibold">
                          Key Search Results (
                          {searchResults.filter((r) => r.found).length} found)
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Row className="g-3">
                          {searchResults.map((result, idx) => (
                            <Col md={6} key={idx}>
                              <Card className="border h-100">
                                <Card.Header
                                  className={`py-2 ${
                                    result.found
                                      ? "bg-success bg-opacity-10"
                                      : "bg-danger bg-opacity-10"
                                  }`}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <code className="fw-semibold">
                                      {result.key}
                                    </code>
                                    <Badge
                                      bg={result.found ? "success" : "danger"}
                                    >
                                      {result.found ? "Found" : "Not Found"}
                                    </Badge>
                                  </div>
                                </Card.Header>
                                <Card.Body className="p-3">
                                  {result.found ? (
                                    <>
                                      <div className="mb-2">
                                        <small className="text-muted">
                                          Path:
                                        </small>
                                        <div className="font-monospace small text-truncate">
                                          {result.path}
                                        </div>
                                      </div>
                                      <div>
                                        <small className="text-muted">
                                          Value:
                                        </small>
                                        <div className="font-monospace small">
                                          {typeof result.value === "string"
                                            ? `"${result.value}"`
                                            : JSON.stringify(
                                                result.value,
                                                null,
                                                2
                                              )}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center text-muted py-2">
                                      Key not found in JSON structure
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Alert variant="info">
                      No search results yet. Enter keys to search in the input
                      above and click "Search".
                    </Alert>
                  )}
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
