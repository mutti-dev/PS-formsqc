import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Container,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  deepDiffObjects,
  parseJSONSafe,
} from "../utils/jsonDiffEngine";
import {
  compareFormKeys,
} from "../utils/keyComparisonUtil";
import "../css/AdvancedJSONComparator.css";

const STORAGE_KEYS = {
  source: "AdvancedJSONComparatorSource",
  target: "AdvancedJSONComparatorTarget",
};

export default function AdvancedJSONComparator({ theme = "dark" }) {
  const [sourceJson, setSourceJson] = useState("");
  const [targetJson, setTargetJson] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState("");
  // const [hoveredPath, setHoveredPath] = useState(null);
  const [diffs, setDiffs] = useState([]);
  const [keyComparison, setKeyComparison] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [selectedKeyTypes, setSelectedKeyTypes] = useState([]);

  useEffect(() => {
    try {
      const savedSource = localStorage.getItem(STORAGE_KEYS.source);
      const savedTarget = localStorage.getItem(STORAGE_KEYS.target);
      if (savedSource) setSourceJson(savedSource);
      if (savedTarget) setTargetJson(savedTarget);
    } catch (err) {
      console.warn("Unable to load comparator draft", err);
    }
  }, []);

  useEffect(() => {
    try {
      if (sourceJson) {
        localStorage.setItem(STORAGE_KEYS.source, sourceJson);
      } else {
        localStorage.removeItem(STORAGE_KEYS.source);
      }
    } catch (err) {
      console.warn("Unable to save source draft", err);
    }
  }, [sourceJson]);

  useEffect(() => {
    try {
      if (targetJson) {
        localStorage.setItem(STORAGE_KEYS.target, targetJson);
      } else {
        localStorage.removeItem(STORAGE_KEYS.target);
      }
    } catch (err) {
      console.warn("Unable to save target draft", err);
    }
  }, [targetJson]);

  const clearDraft = () => {
    setSourceJson("");
    setTargetJson("");
    setDiffs([]);
    setKeyComparison(null);
    setSelectedKeyTypes([]);
    setError("");
    try {
      localStorage.removeItem(STORAGE_KEYS.source);
      localStorage.removeItem(STORAGE_KEYS.target);
    } catch (err) {
      console.warn("Unable to clear comparator draft", err);
    }
  };




  const performComparison = useCallback(async () => {
    setError("");
    setDiffs([]);
    setKeyComparison(null);
    setSelectedKeyTypes([]);

    if (!sourceJson.trim() || !targetJson.trim()) {
      setError("Please fill both JSON inputs (Source and Target)");
      return;
    }

    setIsComparing(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const sourceResult = parseJSONSafe(sourceJson);
      const targetResult = parseJSONSafe(targetJson);

      if (!sourceResult.success) {
        setError(`Source JSON Error: ${sourceResult.error}`);
        setIsComparing(false);
        return;
      }

      if (!targetResult.success) {
        setError(`Target JSON Error: ${targetResult.error}`);
        setIsComparing(false);
        return;
      }

      const differences = deepDiffObjects(
        sourceResult.data,
        targetResult.data,
        // ignoreList
      );

      const keyComparationResult = compareFormKeys(
        targetResult.data,
        sourceResult.data
      );
      setKeyComparison(keyComparationResult);

      const initialTypes = [
        ...new Set(
          [
            ...(keyComparationResult?.removedKeys || []).map((item) => item.oldType || item.type || "unknown"),
            ...(keyComparationResult?.addedKeys || []).map((item) => item.oldType || item.type || "unknown"),
            ...(keyComparationResult?.changedKeys || []).map((item) => item.oldType || item.type || "unknown"),
          ].filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b));
      setSelectedKeyTypes(initialTypes);

      setDiffs(differences);
      // setExpandedPaths(new Set(["root"]));
    } catch (err) {
      setError(`Comparison Error: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  }, [sourceJson, targetJson]);


  // ---------------------------------------------------------------------------
  // Key Analysis section
  // ---------------------------------------------------------------------------
  const buildKeyAnalysisRows = (comparisonData = keyComparison) => {
    if (!comparisonData) return [];

    const rows = [];

    const getOptionDetails = (optionDiff) => {
      if (!optionDiff) return [];

      const { removedOptions = [], addedOptions = [], changedOptions = [] } = optionDiff;
      const detailParts = [];

      if (removedOptions.length) {
        detailParts.push(
          `removed: ${removedOptions
            .map((option) => `${option.value} (${option.oldLabel || "(no label)"})`)
            .join(", ")}`
        );
      }

      if (addedOptions.length) {
        detailParts.push(
          `added: ${addedOptions
            .map((option) => `${option.value} (${option.newLabel || "(no label)"})`)
            .join(", ")}`
        );
      }

      if (changedOptions.length) {
        detailParts.push(
          `changed: ${changedOptions
            .map(
              (option) =>
                `${option.value} (${option.oldLabel || "(no label)"} → ${option.newLabel || "(no label)"})`
            )
            .join(", ")}`
        );
      }

      return detailParts;
    };

    const pushRows = (status, items) => {
      items.forEach((item) => {
        let label = "";

        if (status === "Removed") {
          label = item.oldLabel || "(no label)";
        } else if (status === "Added") {
          label = item.newLabel || "(no label)";
        } else {
          label =
            item.oldLabel !== item.newLabel
              ? `${item.oldLabel || "(no label)"} → ${item.newLabel || "(no label)"}`
              : item.oldLabel || "(no label)";
        }

        const detailParts = [];
        if (item.issue) detailParts.push(item.issue);
        if (item.hasTypeChange) {
          detailParts.push(
            `Type: ${item.oldType || "unknown"} → ${item.newType || "unknown"}`
          );
        }

        const optionDetails = getOptionDetails(item.optionDiff);
        if (optionDetails.length) detailParts.push(...optionDetails);

        rows.push({
          status,
          label,
          key: item.key,
          type: item.oldType || item.type || "unknown",
          details: detailParts.join(" • "),
        });
      });
    };

    pushRows("Removed", comparisonData.removedKeys || []);
    pushRows("Added", comparisonData.addedKeys || []);
    pushRows("Modified", comparisonData.changedKeys || []);

    return rows;
  };

  const copyKeyAnalysisRows = async () => {
    const rows = buildKeyAnalysisRows();
    const filteredRows =
      selectedKeyTypes.length === 0
        ? []
        : rows.filter((row) => selectedKeyTypes.includes(row.type));

    if (!filteredRows.length) return;

    const content = [
      ["Status", "Label", "Key", "Type"].join("\t"),
      ...filteredRows.map(({ status, label, key, type, details }) => {
        const labelWithDetails = details ? `${label} | ${details}` : label;
        return [status, labelWithDetails, key, type].join("\t");
      }),
    ].join("\n");

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        setCopyFeedback("Copied to clipboard");
      } else {
        throw new Error("Clipboard unavailable");
      }
    } catch (err) {
      console.warn("Unable to copy key analysis", err);
      setCopyFeedback("Copy failed");
    }

    window.setTimeout(() => setCopyFeedback(""), 1600);
  };

  const renderKeyComparisonSection = () => {
    if (!keyComparison) return null;

    const rows = buildKeyAnalysisRows();
    const filteredRows =
      selectedKeyTypes.length === 0
        ? []
        : rows.filter((row) => selectedKeyTypes.includes(row.type));
    const totalIssues = filteredRows.length;

    if (!rows.length) {
      return (
        <Alert variant="success" className="mb-4">
          All keys are safe - no removed or renamed keys detected
        </Alert>
      );
    }

    if (totalIssues === 0) {
      return (
        <Alert variant="secondary" className="mb-4">
          No rows match the selected types.
        </Alert>
      );
    }

    return (
      <Card className="mb-4 border border-warning">
        <Card.Header className="bg-warning bg-opacity-10 d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Key Analysis</Card.Title>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="small text-muted">{filteredRows.length} rows</span>
            <Button size="sm" variant="outline-secondary" onClick={copyKeyAnalysisRows}>
              {copyFeedback || "Copy to Excel"}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning" className="small mb-3">
            Copy the table below into Excel or Sheets. The values are tab-separated and ready to paste.
          </Alert>
          <div className="d-flex flex-wrap gap-3 mb-3">
            <Form.Check
              type="checkbox"
              id="key-type-all"
              label="All types"
              checked={selectedKeyTypes.length > 0 && selectedKeyTypes.length === [...new Set(rows.map((row) => row.type).filter(Boolean))].length}
              onChange={(e) => {
                const allTypes = [...new Set(rows.map((row) => row.type).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                setSelectedKeyTypes(e.target.checked ? allTypes : []);
              }}
              inline
            />
            {[...new Set(rows.map((row) => row.type).filter(Boolean))]
              .sort((a, b) => a.localeCompare(b))
              .map((type) => (
                <Form.Check
                  key={type}
                  type="checkbox"
                  id={`key-type-${type}`}
                  label={type}
                  checked={selectedKeyTypes.includes(type)}
                  onChange={(e) => {
                    setSelectedKeyTypes((current) => {
                      if (e.target.checked) {
                        return [...new Set([...current, type])].sort((a, b) => a.localeCompare(b));
                      }
                      return current.filter((item) => item !== type);
                    });
                  }}
                  inline
                />
              ))}
          </div>
          {filteredRows.length === 0 ? (
            <Alert variant="secondary" className="mb-0">
              No rows match the selected type.
            </Alert>
          ) : (
            <div className="table-responsive">
            <Table striped bordered hover size="sm" className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>Status</th>
                  <th>Label</th>
                  <th>Key</th>
                  <th style={{ width: "120px" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={`${row.status}-${row.key}-${idx}`}>
                    <td>
                      <Badge
                        bg={
                          row.status === "Removed"
                            ? "danger"
                            : row.status === "Added"
                            ? "success"
                            : "warning"
                        }
                        text={row.status === "Modified" ? "dark" : undefined}
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                      <div>{row.label}</div>
                      {row.details && (
                        <div className="text-muted small mt-1">{row.details}</div>
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--bs-font-monospace), monospace",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {row.key}
                    </td>
                    <td className="text-muted small">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Container fluid className={`advanced-json-comparator theme-${theme}`}>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="py-4">
          <h1 className="display-5 fw-bold text-center text-primary mb-0">
            Advanced JSON Comparator
          </h1>
        </Card.Header>
      </Card>

      <Card className="mb-4 border">
        <Card.Body>
          <Row className="g-3">
            <Col lg={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Production JSON</Form.Label>
                <textarea
                  className="form-control font-monospace"
                  value={sourceJson}
                  onChange={(e) => setSourceJson(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  style={{
                    backgroundColor: theme === "dark" ? "var(--bs-tertiary-bg)" : "#f8f9fa",
                    color: theme === "dark" ? "var(--bs-body-color)" : "#000",
                    borderColor: theme === "dark" ? "var(--bs-border-color)" : "#ddd",
                  }}
                />
              </Form.Group>
            </Col>

            <Col lg={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Sandbox JSON</Form.Label>
                <textarea
                  className="form-control font-monospace"
                  value={targetJson}
                  onChange={(e) => setTargetJson(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  style={{
                    backgroundColor: theme === "dark" ? "var(--bs-tertiary-bg)" : "#f8f9fa",
                    color: theme === "dark" ? "var(--bs-body-color)" : "#000",
                    borderColor: theme === "dark" ? "var(--bs-border-color)" : "#ddd",
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 d-flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={performComparison}
              disabled={isComparing}
            >
              {isComparing ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Comparing...
                </>
              ) : (
                "Compare JSONs"
              )}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={clearDraft}
              disabled={isComparing && !sourceJson && !targetJson}
            >
              Clear Draft
            </Button>
          </div>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="mt-3 mb-0"
            >
              <strong>Error:</strong> {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {!isComparing && keyComparison && renderKeyComparisonSection()}

      {!isComparing && diffs.length === 0 && !error && !keyComparison && (
        <Card className="text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">
              Enter JSON in both fields and click "Compare JSONs" to see differences
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}