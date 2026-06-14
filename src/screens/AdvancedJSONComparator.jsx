import React, { useState, useCallback } from "react";
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
} from "react-bootstrap";
import {
  deepDiffObjects,
  parseJSONSafe,
} from "../utils/jsonDiffEngine";
import {
  compareFormKeys,
} from "../utils/keyComparisonUtil";
import "../css/AdvancedJSONComparator.css";

export default function AdvancedJSONComparator({ theme = "dark" }) {
  const [sourceJson, setSourceJson] = useState("");
  const [targetJson, setTargetJson] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState("");
  // const [hoveredPath, setHoveredPath] = useState(null);
  const [diffs, setDiffs] = useState([]);
  const [keyComparison, setKeyComparison] = useState(null);




  const performComparison = useCallback(async () => {
    setError("");
    setDiffs([]);
    setKeyComparison(null);

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

      setDiffs(differences);
      // setExpandedPaths(new Set(["root"]));
    } catch (err) {
      setError(`Comparison Error: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  }, [sourceJson, targetJson]);


  // ---------------------------------------------------------------------------
  // Option diff renderer — shown inside Modified items for select/radio fields
  // ---------------------------------------------------------------------------
  const renderOptionDiff = (optionDiff) => {
    if (!optionDiff) return null;
    const { removedOptions = [], addedOptions = [], changedOptions = [] } = optionDiff;
    if (!removedOptions.length && !addedOptions.length && !changedOptions.length) return null;

    return (
      <div
        className="mt-2 ps-3 border-start border-secondary"
        style={{ fontSize: "0.8rem" }}
      >
        <div className="text-muted fw-semibold mb-1">Options</div>

        {removedOptions.map((o, i) => (
          <div key={`rem-${i}`} className="d-flex gap-2 align-items-center mb-1">
            <Badge bg="danger" style={{ fontSize: "0.7rem" }}>Removed</Badge>
            <code className="text-danger">{o.value}</code>
            <span className="text-muted">"{o.oldLabel}"</span>
          </div>
        ))}

        {addedOptions.map((o, i) => (
          <div key={`add-${i}`} className="d-flex gap-2 align-items-center mb-1">
            <Badge bg="success" style={{ fontSize: "0.7rem" }}>Added</Badge>
            <code className="text-success">{o.value}</code>
            <span className="text-muted">"{o.newLabel}"</span>
          </div>
        ))}

        {changedOptions.map((o, i) => (
          <div key={`chg-${i}`} className="d-flex gap-2 align-items-center mb-1">
            <Badge bg="warning" text="dark" style={{ fontSize: "0.7rem" }}>Changed</Badge>
            <code className="text-warning">{o.value}</code>
            <span className="text-muted">"{o.oldLabel}" → "{o.newLabel}"</span>
          </div>
        ))}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Group items by their field type and render each group with badges
  // ---------------------------------------------------------------------------
  const renderTypeGroup = (title, items, variant) => {
    if (items.length === 0) return null;

    const typeGroups = {};
    items.forEach((item) => {
      // For changed items use oldType (production type) as the group label
      const type = item.oldType || item.type || "unknown";
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(item);
    });

    let alertMessage = "";
    if (title === "Removed") {
      alertMessage =
        "DANGER: These fields were removed from sandbox but exist in production. This is a critical issue and must be resolved!";
    } else if (title === "Added") {
      alertMessage =
        "SAFE: These are new fields added in sandbox. Safe to proceed with migration.";
    } else if (title === "Modified") {
      alertMessage =
        "WARNING: These fields have label, type, or option changes. Review to ensure the changes are intentional.";
    }

    return (
      <div key={title} className="mb-4">
        <h6 className={`text-${variant} fw-bold mb-3`}>
          {title} ({items.length})
        </h6>

        {alertMessage && (
          <Alert
            variant={
              title === "Removed"
                ? "danger"
                : title === "Added"
                ? "success"
                : "warning"
            }
            className="mb-3 py-2"
          >
            {alertMessage}
          </Alert>
        )}

        {Object.entries(typeGroups).map(([type, typeItems]) => (
          <div key={type} className="mb-3">
            <div className="small text-muted mb-2" style={{ fontSize: "0.85rem" }}>
              {type}
            </div>
            <div className="list-group">
              {typeItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`list-group-item bg-${variant} bg-opacity-10 py-2`}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {/* Field key */}
                      <code
                        className={`text-${variant} fw-bold`}
                        style={{ wordBreak: "break-word" }}
                      >
                        {item.key}
                      </code>

                      {/* Label line */}
                      <div
                        className="small text-muted mt-1"
                        style={{ wordBreak: "break-word" }}
                      >
                        {title === "Removed" &&
                          `"${item.oldLabel || "(no label)"}"`}
                        {title === "Added" &&
                          `"${item.newLabel || "(no label)"}"`}
                        {title === "Modified" &&
                          (item.oldLabel !== item.newLabel
                            ? `"${item.oldLabel || "(no label)"}" → "${item.newLabel || "(no label)"}"`
                            : `"${item.oldLabel || "(no label)"}" (label unchanged)`)}
                      </div>

                      {/* Type change — shown when field type changed between prod and sandbox */}
                      {title === "Modified" && item.hasTypeChange && (
                        <div
                          className="mt-2 ps-3 border-start border-danger"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <div className="text-muted fw-semibold mb-1">Field Type</div>
                          <div className="d-flex gap-2 align-items-center">
                            <Badge bg="danger" style={{ fontSize: "0.7rem" }}>Type Changed</Badge>
                            <code className="text-danger">{item.oldType}</code>
                            <span className="text-muted">→</span>
                            <code className="text-success">{item.newType}</code>
                          </div>
                        </div>
                      )}

                      {/* Option diff — only for Modified items that have select/radio options */}
                      {title === "Modified" &&
                        item.optionDiff &&
                        renderOptionDiff(item.optionDiff)}
                    </div>

                    {/* Right-side badges */}
                    <div className="d-flex flex-column align-items-end gap-1">
                      <Badge bg={variant}>
                        {title === "Removed"
                          ? "Removed"
                          : title === "Added"
                          ? "Added"
                          : "Changed"}
                      </Badge>
                      {/* Show specific issue type only when it adds information beyond the section title */}
                      {item.issue &&
                        item.issue !== "Label changed" &&
                        item.issue !== "Field removed from sandbox" &&
                        item.issue !== "New field added" && (
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}
                          >
                            {item.issue}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <hr className="my-3" />
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Key Analysis section
  // ---------------------------------------------------------------------------
  const renderKeyComparisonSection = () => {
    if (!keyComparison) return null;

    const totalIssues =
      keyComparison.removedKeys.length +
      keyComparison.changedKeys.length +
      keyComparison.addedKeys.length;

    if (totalIssues === 0) {
      return (
        <Alert variant="success" className="mb-4">
          All keys are safe - no removed or renamed keys detected
        </Alert>
      );
    }

    return (
      <Card className="mb-4 border border-warning">
        <Card.Header className="bg-warning bg-opacity-10">
          <Card.Title className="mb-0">Key Analysis</Card.Title>
        </Card.Header>
        <Card.Body>
          {renderTypeGroup("Removed", keyComparison.removedKeys, "danger")}
          {renderTypeGroup("Added", keyComparison.addedKeys, "success")}
          {renderTypeGroup("Modified", keyComparison.changedKeys, "warning")}
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
                    backgroundColor: theme === "dark" ? "#1e1e1e" : "#f8f9fa",
                    color: theme === "dark" ? "#e0e0e0" : "#000",
                    borderColor: theme === "dark" ? "#333" : "#ddd",
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
                    backgroundColor: theme === "dark" ? "#1e1e1e" : "#f8f9fa",
                    color: theme === "dark" ? "#e0e0e0" : "#000",
                    borderColor: theme === "dark" ? "#333" : "#ddd",
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 d-flex gap-2">
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