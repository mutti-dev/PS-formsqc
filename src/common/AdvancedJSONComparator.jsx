import React, { useState, useCallback, useMemo } from "react";
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
  ChevronDown,
  ChevronRight,
  ArrowCounterclockwise,

} from "react-bootstrap-icons";
import {
  deepDiffObjects,
  parseJSONSafe,
  calculateSummary,
  buildDiffTree,
  formatValue,
  getTypeName,
} from "../utils/jsonDiffEngine";
import {
  compareFormKeys,
} from "../utils/keyComparisonUtil";
import "./AdvancedJSONComparator.css";

export default function AdvancedJSONComparator({ theme = "dark" }) {
  const [sourceJson, setSourceJson] = useState("");
  const [targetJson, setTargetJson] = useState("");
  const [ignoreKeys, setIgnoreKeys] = useState("timestamp,id,uuid");
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState("");
  const [hoveredPath, setHoveredPath] = useState(null);

  const [diffs, setDiffs] = useState([]);
  const [keyComparison, setKeyComparison] = useState(null);

  const [expandedPaths, setExpandedPaths] = useState(new Set(["root"]));
  const [filterChanges] = useState({
    added: true,
    removed: true,
    modified: true,
  });

  const ignoreList = useMemo(() => {
    return ignoreKeys
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }, [ignoreKeys]);

  const summary = useMemo(() => {
    return calculateSummary(diffs);
  }, [diffs]);



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
        ignoreList
      );

      const keyComparationResult = compareFormKeys(
        targetResult.data,
        sourceResult.data
      );
      setKeyComparison(keyComparationResult);

      setDiffs(differences);
      setExpandedPaths(new Set(["root"]));
    } catch (err) {
      setError(`Comparison Error: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  }, [sourceJson, targetJson, ignoreList]);

  const toggleExpanded = useCallback((path) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);



  const resetComparison = useCallback(() => {
    setSourceJson("");
    setTargetJson("");
    setDiffs([]);
    setError("");
    setHoveredPath(null);
    setKeyComparison(null);
  }, []);





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

    const groupByType = (items) => {
      const groups = {};
      items.forEach((item) => {
        const type = item.type || "unknown";
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(item);
      });
      return groups;
    };

    const renderTypeGroup = (title, items, variant) => {
      if (items.length === 0) return null;

      const typeGroups = groupByType(items);

      let alertMessage = "";
      if (title === "Removed") {
        alertMessage = "DANGER: These fields were removed from sandbox but exist in production. This is a critical issue and must be resolved!";
      } else if (title === "Added") {
        alertMessage = "SAFE: These are new fields added in sandbox. Safe to proceed with migration.";
      } else if (title === "Modified") {
        alertMessage = "WARNING: These fields have label changes. Review to ensure the changes are intentional.";
      }

      return (
        <div key={title} className="mb-4">
          <h6 className={`text-${variant} fw-bold mb-3`}>
            {title} ({items.length})
          </h6>

          {alertMessage && (
            <Alert
              variant={title === "Removed" ? "danger" : title === "Added" ? "success" : "warning"}
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
                        <code className={`text-${variant} fw-bold`} style={{ wordBreak: "break-word" }}>
                          {item.key}
                        </code>
                        <div className="small text-muted mt-1" style={{ wordBreak: "break-word" }}>
                          {title === "Removed" && `"${item.oldLabel || "(no label)"}"`}
                          {title === "Added" && `"${item.newLabel || "(no label)"}"`}
                          {title === "Modified" &&
                            `"${item.oldLabel || "(no label)"}" → "${item.newLabel || "(no label)"}""`}
                        </div>
                      </div>
                      <Badge bg={variant} className="ms-2">
                        {title === "Removed" ? "Removed" : title === "Added" ? "Added" : "Changed"}
                      </Badge>
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

  const renderGroupedChanges = () => {
    const grouped = {
      added: diffs.filter((d) => d.type === "added"),
      removed: diffs.filter((d) => d.type === "removed"),
      modified: diffs.filter((d) => d.type === "modified"),
      ignored: diffs.filter((d) => d.type === "ignored"),
    };

    return (
      <div className="grouped-changes">
        {filterChanges.added && grouped.added.length > 0 && (
          <div className="change-group change-group-added">
            <div className="change-group-header">
              <h5 className="change-group-title">
                <span className="change-icon">[ADD]</span>
                Added Fields ({grouped.added.length})
              </h5>
              <span className="change-group-badge">New</span>
            </div>
            <div className="change-items">
              {grouped.added.map((diff, idx) => (
                <div key={idx} className="change-item">
                  <div className="change-path-section">
                    <code className="change-path">{diff.path}</code>
                  </div>
                  <div className="change-value">
                    <span className="value-label">Value:</span>
                    <span className="value-content added-value">
                      {formatValue(diff.target, 100)}
                    </span>
                    <span className="value-type">{getTypeName(diff.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filterChanges.removed && grouped.removed.length > 0 && (
          <div className="change-group change-group-removed">
            <div className="change-group-header">
              <h5 className="change-group-title">
                <span className="change-icon">[REM]</span>
                Removed Fields ({grouped.removed.length})
              </h5>
              <span className="change-group-badge alert-danger">Removed</span>
            </div>
            <div className="change-items">
              {grouped.removed.map((diff, idx) => (
                <div key={idx} className="change-item">
                  <div className="change-path-section">
                    <code className="change-path">{diff.path}</code>
                  </div>
                  <div className="change-value">
                    <span className="value-label">Was:</span>
                    <span className="value-content removed-value">
                      {formatValue(diff.source, 100)}
                    </span>
                    <span className="value-type">{getTypeName(diff.source)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filterChanges.modified && grouped.modified.length > 0 && (
          <div className="change-group change-group-modified">
            <div className="change-group-header">
              <h5 className="change-group-title">
                <span className="change-icon">[MOD]</span>
                Modified Fields ({grouped.modified.length})
              </h5>
              <span className="change-group-badge alert-warning">Changed</span>
            </div>
            <div className="change-items">
              {grouped.modified.map((diff, idx) => (
                <div key={idx} className="change-item">
                  <div className="change-path-section">
                    <code className="change-path">{diff.path}</code>
                  </div>
                  <div className="change-comparison">
                    <div className="change-before">
                      <div className="comparison-label">From:</div>
                      <div className="comparison-value old-value">
                        {formatValue(diff.source, 100)}
                      </div>
                      <span className="value-type">{getTypeName(diff.source)}</span>
                    </div>
                    <div className="change-arrow">"---"</div>
                    <div className="change-after">
                      <div className="comparison-label">To:</div>
                      <div className="comparison-value new-value">
                        {formatValue(diff.target, 100)}
                      </div>
                      <span className="value-type">{getTypeName(diff.target)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.values(grouped)
          .slice(0, 3)
          .every((g) => g.length === 0) && (
          <div className="no-changes-alert">
            <p>No changes detected</p>
          </div>
        )}
      </div>
    );
  };

  const DiffItemDisplay = ({ diff }) => {
    return (
      <div className={`diff-item diff-${diff.type}`}>
        <div className="diff-path">
          <code>{diff.path}</code>
        </div>

        <div className="diff-values">
          {diff.type === "modified" && (
            <>
              <div className="diff-value-pair">
                <span className="diff-label">From:</span>
                <span className="diff-old-value">
                  {formatValue(diff.source, 50)}
                </span>
                <span className="diff-type-badge">
                  {getTypeName(diff.source)}
                </span>
              </div>
              <div className="diff-value-pair">
                <span className="diff-label">To:</span>
                <span className="diff-new-value">
                  {formatValue(diff.target, 50)}
                </span>
                <span className="diff-type-badge">
                  {getTypeName(diff.target)}
                </span>
              </div>
            </>
          )}

          {diff.type === "added" && (
            <div className="diff-value-pair">
              <span className="diff-label">Added:</span>
              <span className="diff-new-value">
                {formatValue(diff.target, 50)}
              </span>
              <span className="diff-type-badge">{getTypeName(diff.target)}</span>
            </div>
          )}

          {diff.type === "removed" && (
            <div className="diff-value-pair">
              <span className="diff-label">Removed:</span>
              <span className="diff-old-value">
                {formatValue(diff.source, 50)}
              </span>
              <span className="diff-type-badge">{getTypeName(diff.source)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container fluid className={`advanced-json-comparator theme-${theme}`}>
      <Card className="mb-4 border">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">
            Advanced JSON Comparator
          </Card.Title>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={resetComparison}
            title="Reset"
          >
            <ArrowCounterclockwise size={16} className="me-1" />
            Reset
          </Button>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Ignore Keys (comma-separated)
            </Form.Label>
            <Form.Control
              type="text"
              value={ignoreKeys}
              onChange={(e) => setIgnoreKeys(e.target.value)}
              placeholder="timestamp, id, uuid, etc."
              size="sm"
            />
            <Form.Text className="text-muted">
              Keys in this list will be excluded from comparison
            </Form.Text>
          </Form.Group>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <strong>Error:</strong> {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4 border">
        <Card.Header>
          <Card.Title className="mb-0">JSON Input</Card.Title>
        </Card.Header>
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

          <div className="mt-3">
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
        </Card.Body>
      </Card>

      {!isComparing && keyComparison && renderKeyComparisonSection()}

      {!isComparing && diffs.length === 0 && !error && (
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
