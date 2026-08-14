import React, { useState, useMemo } from "react";
import {
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  ProgressBar,
  Row,
  Col,
} from "react-bootstrap";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  XCircleFill,
  LightningChargeFill,
  Search,
  ArrowRight,
  BugFill,
  ShieldCheck,
} from "react-bootstrap-icons";

function ValidationSection({
  validationIssues = [],
  parsingSteps = [],
  onFixIssue,
  onFixAll,
  theme = "dark",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDebug, setShowDebug] = useState(false);
  const [showIssues, setShowIssues] = useState(true);

  // Compute issue statistics
  const errorCount = useMemo(
    () => validationIssues.filter((i) => i.severity === "error").length,
    [validationIssues]
  );
  const warningCount = useMemo(
    () => validationIssues.filter((i) => i.severity === "warning").length,
    [validationIssues]
  );
  const passedStepsCount = useMemo(
    () => parsingSteps.filter((s) => s.success).length,
    [parsingSteps]
  );
  const totalStepsCount = parsingSteps.length;

  const fixableIssuesCount = useMemo(
    () =>
      validationIssues.filter(
        (i) =>
          (i.type === "label_key_mismatch" || i.type === "key_length_exceeded") &&
          i.expected &&
          i.path
      ).length,
    [validationIssues]
  );

  // Health Score Calculation (100 - (errors * 25 + warnings * 5))
  const healthScore = useMemo(() => {
    if (validationIssues.length === 0) return 100;
    const penalty = errorCount * 25 + warningCount * 5;
    return Math.max(0, 100 - penalty);
  }, [validationIssues, errorCount, warningCount]);

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set();
    validationIssues.forEach((issue) => {
      if (issue.type) cats.add(issue.type);
    });
    return Array.from(cats);
  }, [validationIssues]);

  // Map category code to human-readable label
  const getCategoryLabel = (type) => {
    switch (type) {
      case "label_key_mismatch":
        return "Label / Key Mismatch";
      case "key_length_exceeded":
        return "Key Length Exceeded";
      case "reserved_column":
        return "Reserved Column Conflict";
      case "grid_key_missing_keyword":
        return "Grid Naming Rule";
      case "duplicate_select_option":
        return "Select Option Duplicate";
      case "duplicate_radio_option":
        return "Radio Option Duplicate";
      default:
        return type ? type.replace(/_/g, " ") : "General Quality";
    }
  };

  // Filter issues based on search, severity, and category
  const filteredIssues = useMemo(() => {
    return validationIssues.filter((issue) => {
      // Severity filter
      if (severityFilter !== "all" && issue.severity !== severityFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "all" && issue.type !== categoryFilter) {
        return false;
      }
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const msgMatch = (issue.message || "").toLowerCase().includes(query);
        const fieldMatch = (issue.field || "").toLowerCase().includes(query);
        const keyMatch = (issue.key || "").toLowerCase().includes(query);
        const expectedMatch = (issue.expected || "").toLowerCase().includes(query);
        return msgMatch || fieldMatch || keyMatch || expectedMatch;
      }
      return true;
    });
  }, [validationIssues, severityFilter, categoryFilter, searchTerm]);

  return (
    <Card className="mb-4 shadow-sm border">
      {/* ── Header Bar ── */}
      <Card.Header className="bg-body-tertiary border-bottom py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-2">
          {errorCount > 0 ? (
            <XCircleFill className="text-danger fs-4" />
          ) : warningCount > 0 ? (
            <ExclamationTriangleFill className="text-warning fs-4" />
          ) : (
            <ShieldCheck className="text-success fs-4" />
          )}
          <div>
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-body">
              Validation & Quality Control
              {validationIssues.length === 0 && (
                <Badge bg="success" className="px-2 py-1 fs-6 fw-normal">
                  Passed All Checks
                </Badge>
              )}
            </h5>
           
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {fixableIssuesCount > 0 && onFixAll && (
            <Button
              variant="outline-success"
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={onFixAll}
            >
              <LightningChargeFill />
              Auto-Fix All ({fixableIssuesCount})
            </Button>
          )}

          {validationIssues.length > 0 && (
            <Button
              variant={theme === "dark" ? "outline-light" : "outline-secondary"}
              size="sm"
              onClick={() => setShowIssues(!showIssues)}
            >
              {showIssues ? "Hide Issues" : "Show Issues"}
            </Button>
          )}

          <Button
            variant="outline-info"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={() => setShowDebug(!showDebug)}
          >
            <BugFill />
            {showDebug ? "Hide Trace" : "Execution Trace"}
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {/* ── Executive QC Overview Cards ── */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <div className="p-3 rounded bg-body-tertiary border text-center h-100">
              <div className="text-uppercase small fw-bold text-body-secondary mb-1">
                QC Health Score
              </div>
              <div
                className={`fs-3 fw-bold ${
                  healthScore === 100
                    ? "text-success"
                    : healthScore >= 70
                    ? "text-warning"
                    : "text-danger"
                }`}
              >
                {healthScore}%
              </div>
              <small className="text-body-secondary">Form Compliance</small>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div
              className={`p-3 rounded border text-center h-100 ${
                errorCount > 0
                  ? "bg-danger bg-opacity-10 border-danger border-opacity-25"
                  : "bg-body-tertiary"
              }`}
            >
              <div className="text-uppercase small fw-bold text-body-secondary mb-1">
                Critical Errors
              </div>
              <div
                className={`fs-3 fw-bold ${
                  errorCount > 0 ? "text-danger" : "text-body-secondary"
                }`}
              >
                {errorCount}
              </div>
              <small className="text-body-secondary">Must be resolved</small>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div
              className={`p-3 rounded border text-center h-100 ${
                warningCount > 0
                  ? "bg-warning bg-opacity-10 border-warning border-opacity-25"
                  : "bg-body-tertiary"
              }`}
            >
              <div className="text-uppercase small fw-bold text-body-secondary mb-1">
                Warnings
              </div>
              <div
                className={`fs-3 fw-bold ${
                  warningCount > 0 ? "text-warning" : "text-body-secondary"
                }`}
              >
                {warningCount}
              </div>
              <small className="text-body-secondary">Recommended fixes</small>
            </div>
          </Col>

          <Col xs={6} md={3}>
            <div className="p-3 rounded bg-body-tertiary border text-center h-100">
              <div className="text-uppercase small fw-bold text-body-secondary mb-1">
                Passed Checks
              </div>
              <div className="fs-3 fw-bold text-success">
                {passedStepsCount}{" "}
                <span className="fs-6 text-body-secondary">/ {totalStepsCount}</span>
              </div>
              <small className="text-body-secondary">Execution steps</small>
            </div>
          </Col>
        </Row>

        {/* ── Progress Bar ── */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small fw-semibold text-body-secondary">
              Form Quality Verification Status
            </span>
            <span className="small text-body-secondary">{healthScore}% Ready</span>
          </div>
          <ProgressBar
            now={healthScore}
            variant={
              healthScore === 100
                ? "success"
                : healthScore >= 70
                ? "warning"
                : "danger"
            }
            style={{ height: "8px" }}
          />
        </div>

        {/* ── Validation Issues Section ── */}
        {showIssues && validationIssues.length > 0 && (
          <div>
            {/* Filter & Search Toolbar */}
            <Row className="g-2 mb-3 align-items-center">
              <Col md={5}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-body-tertiary text-body border-secondary border-opacity-25">
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search issues by field, key, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                      Clear
                    </Button>
                  )}
                </InputGroup>
              </Col>

              <Col md={7} className="d-flex flex-wrap justify-content-md-end gap-2">
                {/* Severity Filter */}
                <Form.Select
                  size="sm"
                  style={{ width: "auto" }}
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities ({validationIssues.length})</option>
                  <option value="error">Errors Only ({errorCount})</option>
                  <option value="warning">Warnings Only ({warningCount})</option>
                </Form.Select>

                {/* Category Filter */}
                {categories.length > 1 && (
                  <Form.Select
                    size="sm"
                    style={{ width: "auto" }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Col>
            </Row>

            {/* Issue Cards */}
            {filteredIssues.length === 0 ? (
              <div className="text-center py-4 bg-body-tertiary rounded text-body-secondary border">
                No issues match your current filters.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredIssues.map((issue, idx) => {
                  const isError = issue.severity === "error";
                  const canFix =
                    (issue.type === "label_key_mismatch" || issue.type === "key_length_exceeded") &&
                    issue.expected &&
                    issue.path;

                  return (
                    <Card
                      key={idx}
                      className={`border-0 border-start border-4 ${
                        isError
                          ? "border-danger bg-danger bg-opacity-10 text-body"
                          : "border-warning bg-warning bg-opacity-10 text-body"
                      }`}
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2">
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                              <Badge
                                bg={isError ? "danger" : "warning"}
                                text={isError ? "white" : "dark"}
                              >
                                {isError ? "ERROR" : "WARNING"}
                              </Badge>
                              <Badge
                                bg="secondary"
                                className="bg-opacity-50 text-body border border-secondary border-opacity-25"
                              >
                                {getCategoryLabel(issue.type)}
                              </Badge>
                              {issue.field && (
                                <Badge
                                  bg="body-tertiary"
                                  text="body"
                                  className="border border-secondary border-opacity-25"
                                >
                                  Field: {issue.field}
                                </Badge>
                              )}
                            </div>

                            <div
                              className={`fw-bold mb-1 text-break ${
                                isError ? "text-danger" : "text-body"
                              }`}
                              style={{ wordBreak: "break-word" }}
                            >
                              {issue.message}
                            </div>

                            {/* Key Mismatch / Key Length Visual Diff View */}
                            {issue.expected && issue.key && (
                              <div className="d-flex flex-wrap align-items-center gap-2 p-2 rounded border bg-body-tertiary my-2 small mw-100">
                                <span className="text-body-secondary text-nowrap">
                                  Current Key ({issue.key.length} chars):
                                </span>
                                <code
                                  className="text-danger fw-bold bg-danger bg-opacity-10 px-2 py-1 rounded text-break mw-100"
                                  style={{ wordBreak: "break-all" }}
                                >
                                  {issue.key}
                                </code>
                                <ArrowRight className="text-body-secondary flex-shrink-0" />
                                <span className="text-body-secondary text-nowrap">
                                  Fixed Key ({issue.expected.length} chars):
                                </span>
                                <code
                                  className="text-success fw-bold bg-success bg-opacity-10 px-2 py-1 rounded text-break mw-100"
                                  style={{ wordBreak: "break-all" }}
                                >
                                  {issue.expected}
                                </code>
                              </div>
                            )}
                          </div>

                          {/* Quick Fix Button */}
                          {canFix && onFixIssue && (
                            <Button
                              variant="success"
                              size="sm"
                              className="d-flex align-items-center gap-1 text-nowrap align-self-md-center ms-md-2"
                              onClick={() => onFixIssue(issue)}
                            >
                              <LightningChargeFill /> Quick Fix
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Success State when no issues exist ── */}
        {validationIssues.length === 0 && (
          <div className="text-center py-4 bg-success bg-opacity-10 rounded border border-success border-opacity-25">
            <CheckCircleFill className="text-success fs-1 mb-2" />
            <h6 className="fw-bold text-success mb-1">
              All Quality Control Checks Passed!
            </h6>
            <p className="small text-body-secondary mb-0">
              No label mismatches, key length violations, reserved column conflicts, or duplicate options were found.
            </p>
          </div>
        )}

        {/* ── Technical Execution Trace / Debug Section ── */}
        {showDebug && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-bold text-body-secondary mb-3 d-flex align-items-center gap-2">
              <BugFill /> System Parsing Execution Trace ({parsingSteps.length} steps)
            </h6>
            <div
              className="bg-dark text-light p-3 rounded font-monospace small border border-secondary border-opacity-50"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {parsingSteps.map((step, i) => (
                <div key={i} className="mb-1 d-flex align-items-start gap-2">
                  <span
                    className={
                      step.success ? "text-success fw-bold" : "text-danger fw-bold"
                    }
                  >
                    {step.success ? "✓" : "✗"}
                  </span>
                  <div>
                    <span className={step.success ? "text-light" : "text-danger"}>
                      {step.step}
                    </span>
                    {step.details && (
                      <span className="text-secondary ms-2">— {step.details}</span>
                    )}
                    {step.timestamp && (
                      <span className="text-secondary ms-2 opacity-50">
                        [{new Date(step.timestamp).toLocaleTimeString()}]
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default ValidationSection;
