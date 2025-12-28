import React, { useState, useMemo } from "react";
import {
  extractLabelsFromJSON,
  extractSelectValues,
  extractSurveyValues,
  extractRadioValues,
} from "../utils/utils";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
  Badge
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

import { exportToExcel } from "../utils/exportUtils";

import {
  DuplicateLabelsSection,
  DuplicateAPISection,
  DuplicateValuesSection,
  SelectComponentsSection,
  SurveyComponentsSection,
  KeyLengthWarningsSection,
  DuplicateSurveyValuesSection,
  TypeFilterSection,
  JsonStatsSection,
  RadioComponentsSection,
  DuplicateRadioValuesSection,
} from "../common/sections";

export default function JSONExtractor() {
  const [jsonInput, setJsonInput] = useState("");
  const [searchKeys, setSearchKeys] = useState("");
  const [keyLengthThreshold, setKeyLengthThreshold] = useState(110);
  const [hiddenTypes, setHiddenTypes] = useState([
    "columns",
    "content",
    "container",
    "panel",
    "button",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsingSteps, setParsingSteps] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  // Results (only computed after successful extraction)
  const [extractedData, setExtractedData] = useState(null);

  const addStep = (step, success = true, details = "") => {
    setParsingSteps((prev) => [
      ...prev,
      { step, success, details, timestamp: new Date().toISOString() },
    ]);
  };

  const resetResults = () => {
    setExtractedData(null);
    setError("");
    setParsingSteps([]);
  };

  const handleExtract = async () => {
    if (!jsonInput.trim()) {
      setError("Please paste your JSON data first.");
      return;
    }

    resetResults();
    setIsLoading(true);

    try {
      addStep("Starting extraction process");

      // Step 1: Validate JSON syntax
      if (!isValidJson(jsonInput)) {
        throw new Error(
          "Invalid JSON syntax. Check for missing commas, brackets, or quotes."
        );
      }
      addStep("JSON syntax validation", true, "Valid JSON format");

      // Step 2: Extract actual form configuration
      addStep("Locating form configuration");
      const formConfig = extractFormJson(jsonInput);

      if (!formConfig) {
        throw new Error(
          "Could not find form configuration. Common causes:\n" +
            "• JSON is wrapped in { config: \"...escaped JSON...\" }\n" +
            "• It's inside a 'display' or 'submission' object\n" +
            "• The key is not 'components' (try checking your structure)"
        );
      }

      if (!formConfig.components || !Array.isArray(formConfig.components)) {
        throw new Error(
          "Form configuration found but missing 'components' array. " +
            "Expected structure: { components: [...] }"
        );
      }
      addStep(
        "Form configuration located",
        true,
        `${formConfig.components.length} top-level components found`
      );

      // Step 3: Extract labels
      addStep("Extracting field labels and keys");
      const labels = extractLabelsFromJSON(formConfig);
      if (labels.length === 0) {
        addStep("Label extraction", false, "No fields with label + key found");
        throw new Error(
          "No form fields detected. Possible reasons:\n" +
            "• Components use different structure (e.g., 'title' instead of 'label')\n" +
            "• All fields are containers without inputs"
        );
      }
      addStep("Label extraction", true, `${labels.length} fields extracted`);

      // Step 4: Full JSON parsing for stats and search
      addStep("Parsing full JSON for analysis");
      const parsedFull = deepParse(JSON.parse(jsonInput));
      const depth = Math.max(
        1,
        ...Object.values(parsedFull).map((v) =>
          calculateDepth(v, 1)
        )
      );

      // Step 5: Extract options for select/radio/survey
      addStep("Extracting dropdown/radio/survey options");
      const selectValues = extractSelectValues(formConfig);
      const radioValues = extractRadioValues(formConfig);
      const surveyValues = extractSurveyValues(formConfig);
      addStep(
        "Options extraction",
        true,
        `${selectValues.length} select, ${radioValues.length} radio, ${surveyValues.length} survey fields`
      );

      // Step 6: Key search (if provided)
      let searchResults = [];
      if (searchKeys.trim()) {
        addStep("Searching for specified keys");
        const keys = searchKeys.split(",").map((k) => k.trim()).filter(Boolean);
        searchResults = searchKeysInObject(parsedFull, keys);
        addStep(
          "Key search completed",
          true,
          `${searchResults.filter((r) => r.found).length}/${keys.length} keys found`
        );
      }

      // Final success
      addStep("Extraction completed successfully!", true);

      setExtractedData({
        labels,
        selectValues,
        radioValues,
        surveyValues,
        searchResults,
        jsonStats: {
          totalElements: countJsonElements(parsedFull),
          uniqueKeys: extractJsonKeys(parsedFull).length,
          depth,
          isArray: Array.isArray(parsedFull),
          formElements: labels.length,
        },
      });
    } catch (err) {
      console.error("Extraction failed:", err);
      addStep("Extraction failed", false, err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDepth = (obj, current = 0) => {
    if (!obj || typeof obj !== "object") return current;
    if (Array.isArray(obj)) {
      return obj.length > 0
        ? Math.max(...obj.map((item) => calculateDepth(item, current + 1)))
        : current;
    }
    return Object.values(obj).length > 0
      ? Math.max(...Object.values(obj).map((v) => calculateDepth(v, current + 1)))
      : current;
  };

  const handleFormat = () => {
    if (!isValidJson(jsonInput)) {
      setError("Cannot format: Invalid JSON syntax");
      return;
    }
    try {
      const parsed = deepParse(JSON.parse(jsonInput));
      setJsonInput(formatJsonString(parsed));
      setError("");
    } catch (err) {
      setError("Formatting failed: " + err.message);
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setSearchKeys("");
    resetResults();
  };

  const toggleType = (type) => {
    setHiddenTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Memoized derived data
  const {
    labels = [],
    selectValues = [],
    radioValues = [],
    surveyValues = [],
    searchResults = [],
    jsonStats = {},
  } = extractedData || {};

  const filteredLabels = useMemo(() => {
    return labels.filter((entry) => {
      if (hiddenTypes.includes(entry.type)) return false;
      const term = searchKeys.toLowerCase(); // reusing search input as filter for simplicity
      return (
        entry.label?.toLowerCase().includes(term) ||
        entry.key?.toLowerCase().includes(term) ||
        entry.type?.toLowerCase().includes(term) ||
        (entry.type === "panel" && entry.title?.toLowerCase().includes(term))
      );
    });
  }, [labels, hiddenTypes, searchKeys]);

  const longKeys = useMemo(() => {
    return labels.filter((e) => e.key && e.key.length > keyLengthThreshold);
  }, [labels, keyLengthThreshold]);



const duplicateLabels = useMemo(() => {
  const map = {};

  labels.forEach((entry) => {
    // Skip layout-only components that commonly repeat or have no meaningful label
    if (entry.type === "columns" || entry.type === "content") {
      return;
    }

    const label = entry.type === "panel" ? entry.title : entry.label;

    // Only count if there's an actual label/title to compare
    if (label && label.trim() !== "") {
      map[label] = (map[label] || 0) + 1;
    }
  });

  return Object.entries(map)
    .filter(([_, count]) => count > 1)
    .map(([label, count]) => ({ label, count }));
}, [labels]);



  const duplicateKeys = useMemo(() => {
    const map = {};
    labels.forEach((e) => {
      if (e.key) map[e.key] = (map[e.key] || 0) + 1;
    });
    return Object.entries(map)
      .filter(([_, c]) => c > 1)
      .map(([key, count]) => ({ key, count }));
  }, [labels]);

  const uniqueTypes = [...new Set(labels.map((e) => e.type))];

  return (
    <Container fluid className="min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xxl={12}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-dark text-white py-4">
              <h1 className="display-5 fw-bold text-center mb-0">
                Form JSON Extractor & Validator
              </h1>
            </Card.Header>

            <Card.Body className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Paste Form JSON</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste your Form.io JSON here..."
                  className="font-monospace"
                  style={{ resize: "vertical" }}
                />
                <div className="mt-2 text-muted small">
                  Characters: {jsonInput.length} | Lines: {jsonInput.split("\n").length}
                </div>
              </Form.Group>

              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <Button onClick={handleExtract} disabled={isLoading || !jsonInput.trim()}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Extracting...
                    </>
                  ) : (
                    "Extract & Validate"
                  )}
                </Button>
                <Button variant="outline-primary" onClick={handleFormat} disabled={!jsonInput.trim()}>
                  Format JSON
                </Button>
                <Button variant="outline-secondary" onClick={clearAll}>
                  Clear All
                </Button>
                <Form.Control
                  type="number"
                  min="50"
                  max="200"
                  value={keyLengthThreshold}
                  onChange={(e) => setKeyLengthThreshold(Number(e.target.value))}
                  style={{ width: "120px" }}
                  className="ms-auto"
                />
                <Form.Label className="mb-0 text-nowrap">Key Limit</Form.Label>
              </div>

              {parsingSteps.length > 0 && (
                <Card className="mb-3 border">
                  <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Validation Steps</span>
                    <Button variant="link" className="text-white" size="sm" onClick={() => setShowDebug(!showDebug)}>
                      {showDebug ? "Hide" : "Show"} Details
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <ProgressBar
                      now={(parsingSteps.filter((s) => s.success).length / parsingSteps.length) * 100}
                      variant={parsingSteps.at(-1)?.success ? "success" : "danger"}
                      className="mb-3"
                    />
                    {showDebug &&
                      parsingSteps.map((step, i) => (
                        <div key={i} className={`small ${step.success ? "text-success" : "text-danger"}`}>
                          <strong>{step.success ? "Success" : "Failed"} {step.step}</strong>
                          {step.details && <span className="ms-2 text-muted">— {step.details}</span>}
                        </div>
                      ))}
                  </Card.Body>
                </Card>
              )}

              {error && <Alert variant="danger">{error}</Alert>}
            </Card.Body>
          </Card>

          {extractedData && (
            <>
              <div className="d-flex justify-content-end mb-3">
                <Button variant="success" size="sm" onClick={() => exportToExcel(labels, hiddenTypes)}>
                  Export Labels to Excel
                </Button>
              </div>

              <Row>
                <Col>
                  <JsonStatsSection jsonStats={jsonStats} searchResults={searchResults.length > 0 ? searchResults : null} />

                  <DuplicateLabelsSection duplicateLabels={duplicateLabels} />
                  <DuplicateAPISection duplicateKeys={duplicateKeys} />
                  <KeyLengthWarningsSection longKeys={longKeys} threshold={keyLengthThreshold} />

                  <DuplicateValuesSection selectValues={selectValues} />
                  <DuplicateRadioValuesSection radioValues={radioValues} />
                  <DuplicateSurveyValuesSection surveyValues={surveyValues} />

                  <SelectComponentsSection selectValues={selectValues} />
                  <RadioComponentsSection radioValues={radioValues} />
                  <SurveyComponentsSection surveyValues={surveyValues} />

                  <TypeFilterSection uniqueTypes={uniqueTypes} hiddenTypes={hiddenTypes} onToggle={toggleType} />

                  {/* Main Labels Table */}
                  <Card className="mt-4">
                    <Card.Header className="bg-dark text-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Extracted Fields ({filteredLabels.length} shown)</span>
                        <Form.Control
                          type="text"
                          placeholder="Filter by label, key, or type..."
                          value={searchKeys}
                          onChange={(e) => setSearchKeys(e.target.value)}
                          style={{ width: "300px" }}
                        />
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0">
                          <thead className="table-dark">
                            <tr>
                              <th>Label / Title</th>
                              <th>Key</th>
                              <th>Length</th>
                              <th>Type</th>
                              <th>Format</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLabels.map((entry, i) => (
                              <tr key={i}>
                                <td className="fw-medium">
                                  {entry.type === "panel" ? entry.title : entry.label}
                                </td>
                                <td>
                                  <code className="text-break small">{entry.key || "-"}</code>
                                </td>
                                <td>
                                  <Badge bg={entry.key?.length > keyLengthThreshold ? "danger" : "success"}>
                                    {entry.key?.length || 0}
                                    {entry.key?.length > keyLengthThreshold && " Warning"}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg="info">{entry.type}</Badge>
                                </td>
                                <td>{entry.format || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}