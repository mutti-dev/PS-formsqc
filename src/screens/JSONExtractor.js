import React, { useState, useMemo } from "react";
import {
  extractLabelsFromJSON,
  extractSelectValues,
  extractSurveyValues,
  extractRadioValues,
  extractConditions,
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
  Badge,
  InputGroup,
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
  ConditionsSection,
} from "../common/sections";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

  const [extractedData, setExtractedData] = useState(null);
  const [fullParsedJson, setFullParsedJson] = useState(null);

  const addStep = (step, success = true, details = "") => {
    setParsingSteps((prev) => [
      ...prev,
      { step, success, details, timestamp: new Date().toISOString() },
    ]);
  };

  const resetResults = () => {
    setExtractedData(null);
    setFullParsedJson(null);
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

      if (!isValidJson(jsonInput)) {
        throw new Error("Invalid JSON syntax. Check for missing commas, brackets, or quotes.");
      }
      addStep("JSON syntax validation", true, "Valid JSON format");

      addStep("Locating form configuration");
      const formConfig = extractFormJson(jsonInput);

      if (!formConfig) {
        throw new Error(
          "Could not find form configuration. Common causes:\n" +
            "• JSON is wrapped in { config: \"...escaped JSON...\" }\n" +
            "• It's inside a 'display' or 'submission' object\n" +
            "• The key is not 'components'"
        );
      }

      if (!formConfig.components || !Array.isArray(formConfig.components)) {
        throw new Error("Form configuration found but missing 'components' array.");
      }
      addStep("Form configuration located", true, `${formConfig.components.length} top-level components found`);

      // NON-BLOCKING VALIDATIONS
      addStep("Validating container structure");
      const containers = findComponentsByType(formConfig, "container");
      const containerErrors = [];

      if (containers.length !== 1) {
        containerErrors.push(`Expected exactly 1 container, found ${containers.length}`);
      } else {
        const mainContainer = containers[0];
        if (mainContainer.label !== "Container" || mainContainer.key !== "Container") {
          containerErrors.push(`Container must have label/key = 'Container'. Got: label="${mainContainer.label}", key="${mainContainer.key}"`);
        }
        if (formConfig !== mainContainer) {
          containerErrors.push("The root object should be the Container itself");
        }
      }

      if (containerErrors.length > 0) {
        addStep("Container validation", false, containerErrors.join("; "));
      } else {
        addStep("Container validation", true, "Single valid container found");
      }

      addStep("Checking for disallowed components");
      const surveys = findComponentsByType(formConfig, "survey");
      const datagrids = findComponentsByType(formConfig, "datagrid");
      const editgrids = findComponentsByType(formConfig, "editgrid");

      const disallowedErrors = [];
      if (surveys.length > 0) disallowedErrors.push(`${surveys.length} survey component(s)`);
      if (datagrids.length > 0) disallowedErrors.push(`${datagrids.length} datagrid(s)`);
      if (editgrids.length > 0) disallowedErrors.push(`${editgrids.length} editgrid(s)`);

      if (disallowedErrors.length > 0) {
        addStep("Disallowed components check", false, `Found: ${disallowedErrors.join(", ")}`);
      } else {
        addStep("Disallowed components check", true, "No disallowed components found");
      }

      // CONTINUE EXTRACTION
      addStep("Extracting field labels and keys");
      const labels = extractLabelsFromJSON(formConfig, [], []);
      addStep("Label extraction", true, `${labels.length} fields extracted`);

      addStep("Parsing full JSON for analysis");
      const parsedFull = deepParse(JSON.parse(jsonInput));
      setFullParsedJson(parsedFull);
      const depth = Math.max(1, ...Object.values(parsedFull).map(v => calculateDepth(v, 1)));

      addStep("Extracting dropdown/radio/survey options");
      const selectValues = extractSelectValues(formConfig);
      const radioValues = extractRadioValues(formConfig);
      const surveyValues = extractSurveyValues(formConfig);
      addStep(
        "Options extraction",
        true,
        `${selectValues.length} select, ${radioValues.length} radio, ${surveyValues.length} survey fields`
      );

      addStep("Analyzing conditions and logic");
      const conditions = extractConditions(formConfig);
      addStep("Conditions analysis", true, `${conditions.length} conditional components found`);

      let searchResults = [];
      if (searchKeys.trim()) {
        addStep("Searching for specified keys");
        const keys = searchKeys.split(",").map(k => k.trim()).filter(Boolean);
        searchResults = searchKeysInObject(parsedFull, keys);
        addStep(
          "Key search completed",
          true,
          `${searchResults.filter(r => r.found).length}/${keys.length} keys found`
        );
      }

      addStep("Extraction completed!", true, "Results ready below");

      setExtractedData({
        labels,
        selectValues,
        radioValues,
        surveyValues,
        conditions,
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
      console.error("Critical extraction failure:", err);
      addStep("Extraction failed critically", false, err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const findComponentsByType = (obj, type, results = []) => {
    if (obj.type === type) results.push(obj);
    if (obj.components) obj.components.forEach(comp => findComponentsByType(comp, type, results));
    if (obj.columns) obj.columns.forEach(col => col.components && col.components.forEach(comp => findComponentsByType(comp, type, results)));
    return results;
  };

  const updateJsonField = (path, field, newValue) => {
    const updatedJson = { ...fullParsedJson };
    let current = updatedJson;
    for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
    current[path[path.length - 1]][field] = newValue;
    setFullParsedJson(updatedJson);
    setJsonInput(formatJsonString(updatedJson));
    const newFormConfig = extractFormJson(JSON.stringify(updatedJson));
    const newLabels = extractLabelsFromJSON(newFormConfig, [], []);
    setExtractedData(prev => ({ ...prev, labels: newLabels }));
  };

  const calculateDepth = (obj, current = 0) => {
    if (!obj || typeof obj !== "object") return current;
    if (Array.isArray(obj)) return obj.length > 0 ? Math.max(...obj.map(item => calculateDepth(item, current + 1))) : current;
    return Object.values(obj).length > 0 ? Math.max(...Object.values(obj).map(v => calculateDepth(v, current + 1))) : current;
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
    setHiddenTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const {
    labels = [],
    selectValues = [],
    radioValues = [],
    surveyValues = [],
    conditions = [],
    searchResults = [],
    jsonStats = {},
  } = extractedData || {};

  const filteredLabels = useMemo(() => {
    return labels.filter(entry => {
      if (hiddenTypes.includes(entry.type)) return false;
      const term = searchKeys.toLowerCase();
      return (
        entry.label?.toLowerCase().includes(term) ||
        entry.key?.toLowerCase().includes(term) ||
        entry.type?.toLowerCase().includes(term) ||
        (entry.type === "panel" && entry.title?.toLowerCase().includes(term))
      );
    });
  }, [labels, hiddenTypes, searchKeys]);

  const longKeys = useMemo(() => labels.filter(e => e.key && e.key.length > keyLengthThreshold), [labels, keyLengthThreshold]);

  const duplicateLabels = useMemo(() => {
    const map = {};
    labels.forEach(entry => {
      if (entry.type === "content" || entry.type === "columns") return;
      const label = entry.type === "panel" ? entry.title : entry.label;
      if (label && label.trim() !== "") map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .filter(([_, count]) => count > 1)
      .map(([label, count]) => ({ label, count }));
  }, [labels]);

  const duplicateKeys = useMemo(() => {
    const map = {};
    labels.forEach(entry => {
      if (entry.type === "content" || entry.type === "columns") return;
      if (entry.key && entry.key.trim() !== "") map[entry.key] = (map[entry.key] || 0) + 1;
    });
    return Object.entries(map)
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));
  }, [labels]);

  const uniqueTypes = [...new Set(labels.map(e => e.type))];

  // TANSTACK TABLE SETUP
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      size: 50,
    },
    {
      accessorFn: row => row.type === "panel" ? row.title : row.label,
      id: "label",
      header: "Label / Title",
      enableSorting: true,
    },
    {
      accessorKey: "key",
      id: "key",
      header: "Key",
      enableSorting: true,
    },
    {
      accessorFn: row => row.key?.length || 0,
      id: "length",
      header: "Key Length",
      enableSorting: true,
    },
    {
      accessorKey: "type",
      id: "type",
      header: "Type",
      enableSorting: true,
    },
    {
      accessorFn: row => row.format || "-",
      id: "format",
      header: "Format",
      enableSorting: false,
    },
  ], []);

  const table = useReactTable({
    data: filteredLabels,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
  });

  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-dark text-white py-4">
              <h1 className="display-5 fw-bold text-center text-primary mb-0">
                Analyze Form JSON
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
                      now={(parsingSteps.filter(s => s.success).length / parsingSteps.length) * 100}
                      variant={parsingSteps.at(-1)?.success ? "success" : "danger"}
                      className="mb-3"
                    />
                    {showDebug &&
                      parsingSteps.map((step, i) => (
                        <div key={i} className={`small ${step.success ? "text-success" : "text-danger"}`}>
                          <strong>{step.success ? "✓" : "✗"} {step.step}</strong>
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
                  <ConditionsSection conditions={conditions} />
                  <TypeFilterSection uniqueTypes={uniqueTypes} hiddenTypes={hiddenTypes} onToggle={toggleType} />


                  {/* FEATURE-RICH TABLE */}
                  <Card className="mt-4">
                    <Card.Header className="bg-dark text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-semibold">
                          Extracted Fields ({table.getRowModel().rows.length} shown / {labels.length} total)
                        </span>
                        {table.getSelectedRowModel().rows.length > 0 && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => {
                              const selected = table.getSelectedRowModel().rows.map(r => r.original);
                              const json = JSON.stringify(
                                selected.map(r => ({
                                  label: r.type === "panel" ? r.title : r.label,
                                  key: r.key,
                                  type: r.type,
                                })),
                                null,
                                2
                              );
                              navigator.clipboard.writeText(json);
                              alert(`Copied ${selected.length} selected rows as JSON!`);
                            }}
                          >
                            Copy {table.getSelectedRowModel().rows.length} Selected
                          </Button>
                        )}
                      </div>

                      <InputGroup style={{ width: "320px" }}>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                          value={globalFilter ?? ""}
                          onChange={e => setGlobalFilter(e.target.value)}
                          placeholder="Search all columns..."
                        />
                        {globalFilter && (
                          <Button variant="outline-secondary" onClick={() => setGlobalFilter("")}>
                            ×
                          </Button>
                        )}
                      </InputGroup>
                    </Card.Header>

                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0 align-middle">
                          <thead className="table-dark">
                            {table.getHeaderGroups().map(headerGroup => (
                              <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                  <th
                                    key={header.id}
                                    style={{ width: header.getSize(), cursor: header.column.getCanSort() ? "pointer" : "default" }}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      {flexRender(header.column.columnDef.header, header.getContext())}
                                      {header.column.getIsSorted() && (
                                        <span>{header.column.getIsSorted() === "asc" ? "↑" : "↓"}</span>
                                      )}
                                    </div>
                                    {header.column.id !== "select" && (
                                      <Button
                                        size="sm"
                                        variant="outline-light"
                                        className="mt-2 w-100"
                                        onClick={() => {
                                          const values = table.getRowModel().rows
                                            .map(row => {
                                              if (header.column.id === "label")
                                                return row.original.type === "panel" ? row.original.title : row.original.label;
                                              return row.getValue(header.column.id);
                                            })
                                            .filter(v => v != null && v !== "")
                                            .join("\n");
                                          navigator.clipboard.writeText(values);
                                          alert(`Copied all "${header.column.columnDef.header}" values!`);
                                        }}
                                      >
                                        Copy Column
                                        <i class="bi bi-clipboard"></i>
                                      </Button>
                                    )}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                              <tr>
                                <td colSpan={columns.length} className="text-center py-4 text-muted">
                                  No fields match your search
                                </td>
                              </tr>
                            ) : (
                              table.getRowModel().rows.map(row => (
                                <tr key={row.id} className={row.getIsSelected() ? "table-primary" : ""}>
                                  {row.getVisibleCells().map(cell => (
                                    <td
                                      key={cell.id}
                                      onClick={() => {
                                        const value = cell.getValue();
                                        const text = typeof value === "string" ? value : String(value || "");
                                        if (text && text !== "-" && !cell.column.id === "select") {
                                          navigator.clipboard.writeText(text);
                                          alert(`Copied: ${text}`);
                                        }
                                      }}
                                      style={{ cursor: "pointer" }}
                                      title="Click to copy"
                                    >
                                      {cell.column.id === "label" ? (
                                        <Form.Control
                                          value={row.original.type === "panel" ? row.original.title : row.original.label}
                                          onChange={e => updateJsonField(row.original.path, row.original.type === "panel" ? "title" : "label", e.target.value)}
                                          onClick={e => e.stopPropagation()}
                                        />
                                      ) : cell.column.id === "key" ? (
                                        <Form.Control
                                          value={row.original.key || ""}
                                          onChange={e => updateJsonField(row.original.path, "key", e.target.value)}
                                          className="font-monospace small"
                                          onClick={e => e.stopPropagation()}
                                        />
                                      ) : cell.column.id === "length" ? (
                                        <Badge bg={row.original.key?.length > keyLengthThreshold ? "danger" : "success"}>
                                          {row.original.key?.length || 0}
                                          {row.original.key?.length > keyLengthThreshold && " ⚠️"}
                                        </Badge>
                                      ) : cell.column.id === "type" ? (
                                        <Badge bg="info">{row.original.type}</Badge>
                                      ) : (
                                        flexRender(cell.column.columnDef.cell, cell.getContext())
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
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