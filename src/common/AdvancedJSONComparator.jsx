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
import "./AdvancedJSONComparator.css";

/**
 * Advanced JSON Comparator Component
 * High-performance semantic JSON comparison with tree navigation and sync scrolling
 */
export default function AdvancedJSONComparator({ theme = "dark" }) {
  // State Management
  const [sourceJson, setSourceJson] = useState("");
  const [targetJson, setTargetJson] = useState("");
  const [ignoreKeys, setIgnoreKeys] = useState("timestamp,id,uuid");
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState("");
  const [hoveredPath, setHoveredPath] = useState(null);

  // Results State (memoized to prevent unnecessary recalculations)
  const [diffs, setDiffs] = useState([]);
  const [tree, setTree] = useState(null);

  console.log(tree);


  // UI State
//   const leftScrollRef = useRef(null);
//   const rightScrollRef = useRef(null);
  const [expandedPaths, setExpandedPaths] = useState(new Set(["root"]));
  const [viewMode, setViewMode] = useState("tree"); // tree or diff-list

  // Calculate summary and filter ignore list (memoized)
  const ignoreList = useMemo(() => {
    return ignoreKeys
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }, [ignoreKeys]);

  const summary = useMemo(() => {
    return calculateSummary(diffs);
  }, [diffs]);

  const treeData = useMemo(() => {
    return buildDiffTree(diffs);
  }, [diffs]);

  // ========================================================================
  // Core Comparison Logic
  // ========================================================================

  const performComparison = useCallback(async () => {
    setError("");
    setDiffs([]);
    setTree(null);

    if (!sourceJson.trim() || !targetJson.trim()) {
      setError("Please fill both JSON inputs (Source and Target)");
      return;
    }

    setIsComparing(true);

    // Simulate async for large datasets
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

      // Perform deep diff
      const differences = deepDiffObjects(
        sourceResult.data,
        targetResult.data,
        ignoreList
      );

      setDiffs(differences);
      setExpandedPaths(new Set(["root"]));
    } catch (err) {
      setError(`Comparison Error: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  }, [sourceJson, targetJson, ignoreList]);

  // ========================================================================
  // Synchronized Scrolling
  // ========================================================================

//   const handleLeftScroll = useCallback((e) => {
//     if (rightScrollRef.current) {
//       rightScrollRef.current.scrollTop = e.target.scrollTop;
//     }
//   }, []);

//   const handleRightScroll = useCallback((e) => {
//     if (leftScrollRef.current) {
//       leftScrollRef.current.scrollTop = e.target.scrollTop;
//     }
//   }, []);

  // ========================================================================
  // Tree Navigation
  // ========================================================================

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

  const expandAll = useCallback(() => {
    const allPaths = new Set();
    const traverse = (node) => {
      allPaths.add(node.path);
      node.children?.forEach(traverse);
    };
    traverse(treeData);
    setExpandedPaths(allPaths);
  }, [treeData]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(["root"]));
  }, []);

  // ========================================================================
  // Utility Functions
  // ========================================================================

//   const _copyToClipboard = useCallback((text, notify = true) => {
//     navigator.clipboard.writeText(text);
//     if (notify) alert("Copied to clipboard!");
//   }, []);

  const resetComparison = useCallback(() => {
    setSourceJson("");
    setTargetJson("");
    setDiffs([]);
    setError("");
    setHoveredPath(null);
  }, []);

  // ========================================================================
  // Render Summary Dashboard
  // ========================================================================

  const renderSummaryDashboard = () => (
    <div className={`summary-dashboard theme-${theme}`}>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon added">➕</div>
          <div className="summary-content">
            <div className="summary-value">{summary.added}</div>
            <div className="summary-label">Added</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon removed">❌</div>
          <div className="summary-content">
            <div className="summary-value">{summary.removed}</div>
            <div className="summary-label">Removed</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon modified">✏️</div>
          <div className="summary-content">
            <div className="summary-value">{summary.modified}</div>
            <div className="summary-label">Modified</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon total">📊</div>
          <div className="summary-content">
            <div className="summary-value">{summary.total}</div>
            <div className="summary-label">Total Changes</div>
          </div>
        </div>

        {summary.ignored > 0 && (
          <div className="summary-card">
            <div className="summary-icon ignored">👁️‍🗨️</div>
            <div className="summary-content">
              <div className="summary-value">{summary.ignored}</div>
              <div className="summary-label">Ignored</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ========================================================================
  // Render Tree Node
  // ========================================================================

  const renderTreeNode = (node, depth = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const hasDiffs = node.diffs && node.diffs.length > 0;
    const isRoot = node.type === "root";

    return (
      <div key={node.path} className={`tree-node depth-${depth}`}>
        <div
          className={`tree-node-header ${
            hoveredPath === node.path ? "hovered" : ""
          }`}
          onMouseEnter={() => setHoveredPath(node.path)}
          onMouseLeave={() => setHoveredPath(null)}
        >
          {hasChildren && (
            <button
              className="tree-toggle"
              onClick={() => toggleExpanded(node.path)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {!hasChildren && <span className="tree-toggle-spacer"></span>}

          <span className="tree-key">{isRoot ? "root" : node.key}</span>

          {node.stats.total > 0 && (
            <span className="tree-stats">
              {node.stats.added > 0 && (
                <Badge bg="success" className="ms-1">
                  +{node.stats.added}
                </Badge>
              )}
              {node.stats.removed > 0 && (
                <Badge bg="danger" className="ms-1">
                  -{node.stats.removed}
                </Badge>
              )}
              {node.stats.modified > 0 && (
                <Badge bg="warning" className="ms-1">
                  ~{node.stats.modified}
                </Badge>
              )}
            </span>
          )}
        </div>

        {isExpanded && hasDiffs && (
          <div className="tree-diffs">
            {node.diffs.map((diff, idx) => (
              <DiffItemDisplay key={`${node.path}-${idx}`} diff={diff} />
            ))}
          </div>
        )}

        {isExpanded && hasChildren && (
          <div className="tree-children">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // Render Diff Item Display
  // ========================================================================

  const DiffItemDisplay = ({ diff }) => {
    // const [_showFullValues, _setShowFullValues] = useState(false);

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

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <Container fluid className={`advanced-json-comparator theme-${theme}`}>
      {/* Header */}
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
          {/* Ignore Keys Config */}
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

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <strong>Error:</strong> {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* JSON Inputs Section */}
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

      {/* Results Section */}
      {diffs.length > 0 && (
        <>
          {/* Summary Dashboard */}
          {renderSummaryDashboard()}

          {/* Results Controls */}
          <Card className="mb-4 border">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="mb-0">Comparison Results</Card.Title>
              </div>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "tree" ? "primary" : "outline-primary"}
                  onClick={() => setViewMode("tree")}
                >
                  Tree View
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "diff-list" ? "primary" : "outline-primary"}
                  onClick={() => setViewMode("diff-list")}
                >
                  List View
                </Button>
              </div>
            </Card.Header>

            {viewMode === "tree" && (
              <Card.Body>
                <div className="mb-3 d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={expandAll}
                  >
                    Expand All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={collapseAll}
                  >
                    Collapse All
                  </Button>
                </div>

                <div className={`tree-view theme-${theme}`}>
                  {treeData && renderTreeNode(treeData)}
                </div>
              </Card.Body>
            )}

            {viewMode === "diff-list" && (
              <Card.Body>
                <div className={`diff-list theme-${theme}`}>
                  {diffs
                    .filter((d) => d.type !== "ignored")
                    .map((diff, idx) => (
                      <DiffItemDisplay key={idx} diff={diff} />
                    ))}
                </div>
              </Card.Body>
            )}
          </Card>
        </>
      )}

      {/* Empty State */}
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
