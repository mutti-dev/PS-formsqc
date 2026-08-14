import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  ProgressBar,
  Table,
  Tabs,
  Tab,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  Upload,
  BarChartFill,
  Download,
  Search,
  FileEarmarkSpreadsheet,
  ArrowRepeat,
  InfoCircle,
} from "react-bootstrap-icons";
import {
  parseDataFile,
  evaluateDataQuality,
  exportIssueReport,
} from "../utils/dataAnalyzerEngine";

const SAMPLE_DATASET = [
  { ID: "1001", Name: "Alice Smith", Email: "alice@example.com", Phone: "555-0192", Age: 34, SignupDate: "2024-01-15" },
  { ID: "1002", Name: "Bob Jones", Email: "bob-at-example.com", Phone: "555-0193", Age: 29, SignupDate: "2024-02-20" },
  { ID: "1003", Name: "Charlie Brown", Email: "charlie@example.com", Phone: "555-0194", Age: null, SignupDate: "invalid-date" },
  { ID: "1004", Name: "Diana Prince", Email: "diana@example.com", Phone: "555-0195", Age: 42, SignupDate: "2024-04-10" },
  { ID: "1001", Name: "Alice Smith", Email: "alice@example.com", Phone: "555-0192", Age: 34, SignupDate: "2024-01-15" }, // duplicate
  { ID: "1005", Name: "", Email: "eve@domain.com", Phone: "123", Age: "thirty", SignupDate: "2024-05-01" },
];

export default function DataAnalyzer({ theme = "dark" }) {
  const [dataState, setDataState] = useState(null); // { rows, columns, fileName }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Rule configuration options
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [keyColumns, setKeyColumns] = useState([]);

  // Search & Issue Filters
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState("all");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState("all");

  const fileInputRef = React.useRef(null);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsLoading(true);
    setError("");

    try {
      const parsed = await parseDataFile(file);
      setDataState(parsed);
      setRequiredColumns([]);
      setKeyColumns([]);
    } catch (err) {
      setError(err.message || "Failed to load data file");
    } finally {
      setIsLoading(false);
    }
  };

  // Load Sample Dataset
  const handleLoadSample = () => {
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setDataState({
        rows: SAMPLE_DATASET,
        columns: Object.keys(SAMPLE_DATASET[0]),
        fileName: "Sample_Customer_Dataset.json",
        totalRows: SAMPLE_DATASET.length,
        totalCols: Object.keys(SAMPLE_DATASET[0]).length,
      });
      setRequiredColumns(["Name", "Email"]);
      setKeyColumns(["ID"]);
      setIsLoading(false);
    }, 400);
  };

  // Run Data Quality Evaluation
  const qualityResult = useMemo(() => {
    if (!dataState || !dataState.rows || dataState.rows.length === 0) return null;

    return evaluateDataQuality(dataState.rows, dataState.columns, {
      requiredColumns,
      keyColumns,
    });
  }, [dataState, requiredColumns, keyColumns]);

  // Filtered Row-Level Issues
  const filteredIssues = useMemo(() => {
    if (!qualityResult || !qualityResult.issues) return [];

    return qualityResult.issues.filter((issue) => {
      if (selectedDimensionFilter !== "all" && issue.dimension !== selectedDimensionFilter) {
        return false;
      }
      if (selectedSeverityFilter !== "all" && issue.severity !== selectedSeverityFilter) {
        return false;
      }
      if (issueSearchTerm.trim()) {
        const query = issueSearchTerm.toLowerCase();
        const msgMatch = (issue.message || "").toLowerCase().includes(query);
        const colMatch = (issue.columnName || "").toLowerCase().includes(query);
        const valMatch = (issue.value || "").toLowerCase().includes(query);
        return msgMatch || colMatch || valMatch;
      }
      return true;
    });
  }, [qualityResult, selectedDimensionFilter, selectedSeverityFilter, issueSearchTerm]);

  // Export Issue Report
  const handleExportReport = () => {
    if (!qualityResult || !qualityResult.issues) return;
    const exportName = dataState?.fileName
      ? `Data_Quality_Report_${dataState.fileName.replace(/\.[^/.]+$/, "")}.csv`
      : "Data_Quality_Report.csv";
    exportIssueReport(qualityResult.issues, exportName);
  };

  const toggleRequiredColumn = (col) => {
    setRequiredColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const toggleKeyColumn = (col) => {
    setKeyColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <Container fluid className="py-4 min-vh-100">
      {/* ── Page Title Bar ── */}
      <div className="mb-4">


        <Card.Header className="py-4 ">
          <h2 className="fw-bold d-flex align-items-center gap-2 text-primary">
            <BarChartFill /> Data Quality Analyzer
          </h2>
        </Card.Header>


        <div className="d-flex gap-2 align-items-center mt-2">
          <input
            type="file"
            accept=".csv, .xlsx, .xls, .json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <Button
            variant="primary"
            size="sm"
            className="d-flex align-items-center gap-1 shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : <Upload />}
            Upload Dataset
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={handleLoadSample}
            disabled={isLoading}
          >
            <ArrowRepeat /> Sample Data
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      {/* ── Empty State / Ingestion Banner ── */}
      {!dataState && (
        <Card className="text-center p-5 border-dashed shadow-sm mb-4 bg-body-tertiary">
          <Card.Body>
            <FileEarmarkSpreadsheet className="text-primary display-3 mb-3 opacity-75" />
            <h4 className="fw-bold text-body">No Dataset Loaded</h4>
            <p className="text-body-secondary mb-4 mx-auto" style={{ maxWidth: "500px" }}>
              Upload your CSV, Excel spreadsheet, or JSON file to run instant automated profiling, data type detection, format validation, and duplicate row discovery.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Dataset File
              </Button>
              <Button
                variant="outline-primary"
                size="lg"
                onClick={handleLoadSample}
              >
                Try Sample Dataset
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ── Active Analysis Dashboard ── */}
      {dataState && qualityResult && (
        <>
          {/* ── Executive Stat Cards ── */}
          <Row className="g-3 mb-4">
            {/* Overall Score */}
            <Col xs={12} sm={6} md={3}>
              <Card className="border shadow-sm h-100 bg-body-tertiary">
                <Card.Body className="text-center p-3">
                  <div className="text-uppercase small fw-bold text-body-secondary mb-1">
                    Overall Data Quality
                  </div>
                  <div
                    className={`display-5 fw-bold ${qualityResult.scores.overall >= 85
                        ? "text-success"
                        : qualityResult.scores.overall >= 65
                          ? "text-warning"
                          : "text-danger"
                      }`}
                  >
                    {qualityResult.scores.overall}%
                  </div>
                  <small className="text-body-secondary">
                    {dataState.fileName} ({dataState.totalRows} rows, {dataState.totalCols} cols)
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Completeness */}
            <Col xs={6} sm={3} md={2}>
              <Card className="border shadow-sm h-100 bg-body-tertiary">
                <Card.Body className="text-center p-3">
                  <div className="small fw-bold text-body-secondary mb-1">Completeness</div>
                  <div className="fs-3 fw-bold text-primary">
                    {qualityResult.scores.completeness}%
                  </div>
                  <ProgressBar
                    now={qualityResult.scores.completeness}
                    variant="primary"
                    style={{ height: "4px" }}
                    className="mt-2"
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Validity */}
            <Col xs={6} sm={3} md={2}>
              <Card className="border shadow-sm h-100 bg-body-tertiary">
                <Card.Body className="text-center p-3">
                  <div className="small fw-bold text-body-secondary mb-1">Validity</div>
                  <div className="fs-3 fw-bold text-info">
                    {qualityResult.scores.validity}%
                  </div>
                  <ProgressBar
                    now={qualityResult.scores.validity}
                    variant="info"
                    style={{ height: "4px" }}
                    className="mt-2"
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Uniqueness */}
            <Col xs={6} sm={3} md={2}>
              <Card className="border shadow-sm h-100 bg-body-tertiary">
                <Card.Body className="text-center p-3">
                  <div className="small fw-bold text-body-secondary mb-1">Uniqueness</div>
                  <div className="fs-3 fw-bold text-success">
                    {qualityResult.scores.uniqueness}%
                  </div>
                  <ProgressBar
                    now={qualityResult.scores.uniqueness}
                    variant="success"
                    style={{ height: "4px" }}
                    className="mt-2"
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Total Issues Flagged */}
            <Col xs={6} sm={3} md={3}>
              <Card className="border shadow-sm h-100 bg-body-tertiary">
                <Card.Body className="text-center p-3">
                  <div className="small fw-bold text-body-secondary mb-1">Total Issues Flagged</div>
                  <div className="fs-3 fw-bold text-danger">
                    {qualityResult.issues.length}
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1 py-0 px-2 small"
                      onClick={handleExportReport}
                      disabled={qualityResult.issues.length === 0}
                    >
                      <Download size={12} /> Export Issue Report
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── Main Tabbed Section ── */}
          <Card className="shadow-sm border">
            <Card.Body className="p-3 p-md-4">
              <Tabs defaultActiveKey="profiling" id="data-analyzer-tabs" className="mb-4">
                {/* ── Tab 1: Column Health & Profiling ── */}
                <Tab eventKey="profiling" title="📊 Column Profiling & Health">
                  <div className="table-responsive">
                    <Table hover align="middle" className="border mb-0">
                      <thead className="bg-body-tertiary">
                        <tr>
                          <th>Column Name</th>
                          <th>Inferred Type</th>
                          <th>Null %</th>
                          <th>Unique Values</th>
                          <th>Stats / Summary</th>
                          <th>Frequent Values</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qualityResult.profiles.map((p, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold">
                              {p.columnName}
                              {p.isMistypedNumber && (
                                <Badge bg="warning" text="dark" className="ms-2 small">
                                  Mistyped Number
                                </Badge>
                              )}
                            </td>
                            <td>
                              <Badge bg="secondary" className="text-uppercase bg-opacity-75">
                                {p.inferredType}
                              </Badge>
                            </td>
                            <td style={{ minWidth: "140px" }}>
                              <div className="d-flex justify-content-between small mb-1">
                                <span>{p.nullPercentage}%</span>
                                <span className="text-body-secondary">({p.nullCount} nulls)</span>
                              </div>
                              <ProgressBar
                                now={p.nullPercentage}
                                variant={p.nullPercentage > 20 ? "danger" : p.nullPercentage > 0 ? "warning" : "success"}
                                style={{ height: "6px" }}
                              />
                            </td>
                            <td>
                              <span className="fw-medium">{p.uniqueCount}</span>{" "}
                              <small className="text-body-secondary">({p.uniquePercentage}%)</small>
                            </td>
                            <td>
                              {p.numericStats ? (
                                <small className="font-monospace text-body-secondary">
                                  Min: {p.numericStats.min} | Max: {p.numericStats.max} | Mean: {p.numericStats.mean}
                                </small>
                              ) : (
                                <small className="text-body-secondary">N/A (Non-numeric)</small>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {p.topValues.slice(0, 3).map((tv, i) => (
                                  <Badge key={i} bg="body-tertiary" text="body" className="border font-monospace small">
                                    {tv.value} ({tv.count})
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>

                {/* ── Tab 2: Rule Configuration ── */}
                <Tab eventKey="rules" title="⚙️ Quality Rules & Filters">
                  <Alert variant="info" className="d-flex align-items-center gap-2 mb-4">
                    <InfoCircle /> Select required columns and key columns to refine validity and uniqueness checks.
                  </Alert>

                  <Row className="g-4">
                    <Col md={6}>
                      <Card className="h-100 border">
                        <Card.Header className="fw-bold bg-body-tertiary">
                          Required Columns (Completeness Rule)
                        </Card.Header>
                        <Card.Body>
                          <p className="small text-body-secondary">
                            Select columns that MUST NOT contain null/missing values. Flagged missing values in these columns will count as critical errors.
                          </p>
                          <div className="d-flex flex-wrap gap-2">
                            {dataState.columns.map((col) => {
                              const active = requiredColumns.includes(col);
                              return (
                                <Button
                                  key={col}
                                  variant={active ? "primary" : "outline-secondary"}
                                  size="sm"
                                  onClick={() => toggleRequiredColumn(col)}
                                >
                                  {col} {active ? "✓" : ""}
                                </Button>
                              );
                            })}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 border">
                        <Card.Header className="fw-bold bg-body-tertiary">
                          Unique Key Columns (Uniqueness Rule)
                        </Card.Header>
                        <Card.Body>
                          <p className="small text-body-secondary">
                            Select column(s) that form a unique key identifier. Duplicate values in key columns will be flagged as critical errors.
                          </p>
                          <div className="d-flex flex-wrap gap-2">
                            {dataState.columns.map((col) => {
                              const active = keyColumns.includes(col);
                              return (
                                <Button
                                  key={col}
                                  variant={active ? "success" : "outline-secondary"}
                                  size="sm"
                                  onClick={() => toggleKeyColumn(col)}
                                >
                                  {col} {active ? "✓" : ""}
                                </Button>
                              );
                            })}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                {/* ── Tab 3: Row-Level Failed Issues & Remediation ── */}
                <Tab eventKey="issues" title={`🚩 Row-Level Issues (${qualityResult.issues.length})`}>
                  {/* Search and Filters */}
                  <Row className="g-2 mb-3 align-items-center">
                    <Col md={4}>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-body-tertiary text-body border-secondary border-opacity-25">
                          <Search />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search issues by column, message, or value..."
                          value={issueSearchTerm}
                          onChange={(e) => setIssueSearchTerm(e.target.value)}
                        />
                        {issueSearchTerm && (
                          <Button variant="outline-secondary" onClick={() => setIssueSearchTerm("")}>
                            Clear
                          </Button>
                        )}
                      </InputGroup>
                    </Col>

                    <Col md={8} className="d-flex flex-wrap justify-content-md-end gap-2">
                      <Form.Select
                        size="sm"
                        style={{ width: "auto" }}
                        value={selectedDimensionFilter}
                        onChange={(e) => setSelectedDimensionFilter(e.target.value)}
                      >
                        <option value="all">All Dimensions</option>
                        <option value="Completeness">Completeness</option>
                        <option value="Validity">Validity</option>
                        <option value="Uniqueness">Uniqueness</option>
                        <option value="Consistency">Consistency</option>
                      </Form.Select>

                      <Form.Select
                        size="sm"
                        style={{ width: "auto" }}
                        value={selectedSeverityFilter}
                        onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                      >
                        <option value="all">All Severities</option>
                        <option value="error">Errors Only</option>
                        <option value="warning">Warnings Only</option>
                      </Form.Select>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleExportReport}
                        disabled={filteredIssues.length === 0}
                      >
                        <Download /> Export Report
                      </Button>
                    </Col>
                  </Row>

                  {/* Issues Table */}
                  {filteredIssues.length === 0 ? (
                    <div className="text-center py-4 bg-body-tertiary rounded text-body-secondary border">
                      No quality issues found matching your current filters.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover align="middle" className="border mb-0">
                        <thead className="bg-body-tertiary">
                          <tr>
                            <th>#</th>
                            <th>Row Num</th>
                            <th>Column</th>
                            <th>Dimension</th>
                            <th>Severity</th>
                            <th>Description</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIssues.map((issue) => (
                            <tr key={issue.id}>
                              <td className="text-body-secondary small">{issue.id}</td>
                              <td className="fw-semibold">
                                {issue.rowIndex > 0 ? `Row ${issue.rowIndex}` : "N/A"}
                              </td>
                              <td className="fw-medium">{issue.columnName}</td>
                              <td>
                                <Badge bg="info" className="bg-opacity-75">
                                  {issue.dimension}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={issue.severity === "error" ? "danger" : "warning"} text={issue.severity === "warning" ? "dark" : "white"}>
                                  {issue.severity.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="text-break">{issue.message}</td>
                              <td>
                                <code className="bg-body-tertiary p-1 rounded border small text-break">
                                  {issue.value}
                                </code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
