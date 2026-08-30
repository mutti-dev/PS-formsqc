import React, { useState, useMemo, useRef } from "react";
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
  Nav,
  InputGroup,
  Alert,
  Spinner,
  Pagination,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  Upload,
  BarChartFill,
  Download,
  Search,
  ArrowRepeat,
  InfoCircle,
  CheckCircleFill,
  ExclamationTriangleFill,
  XCircleFill,
  Table as TableIcon,
  LightningFill,
  Magic,
  Clipboard,
  ClipboardCheck,
  GearFill,
  FiletypeCsv,
  FiletypeJson,
  FiletypeXlsx,
  Sliders,
  ShieldCheck,
  ArrowDownUp,
  Database,
} from "react-bootstrap-icons";
import {
  parseDataFile,
  parseRawText,
  evaluateDataQuality,
  exportIssueReport,
  cleanDataset,
  exportCleanedData,
} from "../utils/dataAnalyzerEngine";
import ScreenHeader from "../common/ScreenHeader";
import "../css/DataAnalyzer.css";

export default function DataAnalyzer({ theme = "dark" }) {
  // Main dataset state
  const [dataState, setDataState] = useState(null); // { rows, columns, fileName, totalRows, totalCols }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Ingestion Mode ('upload' | 'paste')
  const [inputMode, setInputMode] = useState("upload");
  const [rawTextInput, setRawTextInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState("grid"); // 'grid' | 'profiling' | 'issues' | 'clean' | 'rules'

  // Rules Configuration
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [keyColumns, setKeyColumns] = useState([]);

  // Data Grid Interactive State
  const [gridSearch, setGridSearch] = useState("");
  const [gridFilterMode, setGridFilterMode] = useState("all"); // 'all' | 'issuesOnly' | 'cleanOnly'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Profiling View Mode ('cards' | 'table')
  const [profileViewMode, setProfileViewMode] = useState("cards");

  // Issue Inspector Filters
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState("all");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState("all");
  const [selectedColumnFilter, setSelectedColumnFilter] = useState("all");
  const [copiedIssueId, setCopiedIssueId] = useState(null);

  // Auto-Clean Studio State
  const [cleanOptions, setCleanOptions] = useState({
    removeDuplicates: true,
    trimWhitespace: true,
    coerceNumbers: true,
    fillNulls: false,
    fillNullValue: "N/A",
    dropEmptyCols: false,
    standardizeCasing: "none",
  });
  const [cleanSuccessSummary, setCleanSuccessSummary] = useState(null);

  const fileInputRef = useRef(null);

  // Handle File Upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    setCleanSuccessSummary(null);

    try {
      const parsed = await parseDataFile(file);
      setDataState(parsed);
      setRequiredColumns([]);
      setKeyColumns([]);
      setCurrentPage(1);
      setActiveTab("grid");
    } catch (err) {
      setError(err.message || "Failed to load data file");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle Pasted Raw Text
  const handleParsePastedText = () => {
    if (!rawTextInput.trim()) {
      setError("Please paste raw CSV or JSON text to analyze.");
      return;
    }
    setIsLoading(true);
    setError("");
    setCleanSuccessSummary(null);

    try {
      const parsed = parseRawText(rawTextInput);
      setDataState(parsed);
      setRequiredColumns([]);
      setKeyColumns([]);
      setCurrentPage(1);
      setActiveTab("grid");
    } catch (err) {
      setError(err.message || "Failed to parse text input");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Dataset
  const handleReset = () => {
    setDataState(null);
    setError("");
    setRawTextInput("");
    setRequiredColumns([]);
    setKeyColumns([]);
    setCleanSuccessSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Run Data Quality Evaluation
  const qualityResult = useMemo(() => {
    if (!dataState || !dataState.rows || dataState.rows.length === 0) return null;

    return evaluateDataQuality(dataState.rows, dataState.columns, {
      requiredColumns,
      keyColumns,
    });
  }, [dataState, requiredColumns, keyColumns]);

  // Fast Lookup Map for Cell-Level Issues: `row_index:column_name` -> Issue
  const cellIssueMap = useMemo(() => {
    const map = new Map();
    if (!qualityResult || !qualityResult.issues) return map;

    qualityResult.issues.forEach((issue) => {
      if (issue.rowIndex > 0 && issue.columnName) {
        const key = `${issue.rowIndex}:${issue.columnName}`;
        // If multiple issues for a cell, keep the highest severity (error > warning)
        const existing = map.get(key);
        if (!existing || (existing.severity !== "error" && issue.severity === "error")) {
          map.set(key, issue);
        }
      }
    });
    return map;
  }, [qualityResult]);

  // Rows with Any Issue Set (for grid filtering)
  const rowsWithIssuesSet = useMemo(() => {
    const set = new Set();
    if (!qualityResult || !qualityResult.issues) return set;
    qualityResult.issues.forEach((issue) => {
      if (issue.rowIndex > 0) set.add(issue.rowIndex);
    });
    return set;
  }, [qualityResult]);

  // Filtered & Sorted Rows for Data Grid
  const processedGridRows = useMemo(() => {
    if (!dataState || !dataState.rows) return [];

    let rowsWithIndex = dataState.rows.map((row, idx) => ({
      ...row,
      __rowIndex: idx + 1,
      __hasIssues: rowsWithIssuesSet.has(idx + 1),
    }));

    // Filter by issue mode
    if (gridFilterMode === "issuesOnly") {
      rowsWithIndex = rowsWithIndex.filter((r) => r.__hasIssues);
    } else if (gridFilterMode === "cleanOnly") {
      rowsWithIndex = rowsWithIndex.filter((r) => !r.__hasIssues);
    }

    // Filter by search term
    if (gridSearch.trim()) {
      const q = gridSearch.toLowerCase();
      rowsWithIndex = rowsWithIndex.filter((r) => {
        return dataState.columns.some((col) => {
          const val = r[col];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort if configured
    if (sortColumn) {
      rowsWithIndex.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rowsWithIndex;
  }, [dataState, gridFilterMode, gridSearch, sortColumn, sortDirection, rowsWithIssuesSet]);

  // Paginated Rows for Data Grid
  const paginatedGridRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedGridRows.slice(start, start + rowsPerPage);
  }, [processedGridRows, currentPage, rowsPerPage]);

  const totalGridPages = Math.ceil(processedGridRows.length / rowsPerPage) || 1;

  // Handle Column Header Sort Click
  const handleSort = (col) => {
    if (sortColumn === col) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Filtered Issues for Anomaly Inspector Tab
  const filteredIssues = useMemo(() => {
    if (!qualityResult || !qualityResult.issues) return [];

    return qualityResult.issues.filter((issue) => {
      if (selectedDimensionFilter !== "all" && issue.dimension !== selectedDimensionFilter) {
        return false;
      }
      if (selectedSeverityFilter !== "all" && issue.severity !== selectedSeverityFilter) {
        return false;
      }
      if (selectedColumnFilter !== "all" && issue.columnName !== selectedColumnFilter) {
        return false;
      }
      if (issueSearchTerm.trim()) {
        const q = issueSearchTerm.toLowerCase();
        const msgMatch = (issue.message || "").toLowerCase().includes(q);
        const colMatch = (issue.columnName || "").toLowerCase().includes(q);
        const valMatch = (String(issue.value) || "").toLowerCase().includes(q);
        return msgMatch || colMatch || valMatch;
      }
      return true;
    });
  }, [
    qualityResult,
    selectedDimensionFilter,
    selectedSeverityFilter,
    selectedColumnFilter,
    issueSearchTerm,
  ]);

  // Overall Score Details & Grade Calculation
  const scoreInfo = useMemo(() => {
    if (!qualityResult) return { overall: 100, grade: "A+", label: "Excellent", variant: "success" };
    const score = qualityResult.scores.overall;
    if (score >= 95) return { overall: score, grade: "A+", label: "Pristine", variant: "success" };
    if (score >= 85) return { overall: score, grade: "A", label: "Good", variant: "success" };
    if (score >= 70) return { overall: score, grade: "B", label: "Fair", variant: "warning" };
    if (score >= 50) return { overall: score, grade: "C", label: "Needs Work", variant: "warning" };
    return { overall: score, grade: "F", label: "Poor", variant: "danger" };
  }, [qualityResult]);

  // Export Issue Audit Report
  const handleExportIssues = () => {
    if (!qualityResult || !qualityResult.issues) return;
    const baseName = dataState?.fileName
      ? `Data_Audit_${dataState.fileName.replace(/\.[^/.]+$/, "")}`
      : "Data_Quality_Audit";
    exportIssueReport(qualityResult.issues, `${baseName}.csv`);
  };

  // Jump from Issue list to Grid Row
  const handleJumpToGridRow = (rowIndex) => {
    if (rowIndex > 0) {
      const targetPage = Math.ceil(rowIndex / rowsPerPage);
      setCurrentPage(targetPage);
      setGridFilterMode("all");
      setActiveTab("grid");
    }
  };

  // Copy Issue Details to Clipboard
  const handleCopyIssue = (issue) => {
    const text = `[${issue.dimension} - ${issue.severity.toUpperCase()}] Row ${
      issue.rowIndex > 0 ? issue.rowIndex : "N/A"
    } | Column: ${issue.columnName} | ${issue.message} | Value: ${issue.value}`;
    navigator.clipboard.writeText(text);
    setCopiedIssueId(issue.id);
    setTimeout(() => setCopiedIssueId(null), 2000);
  };

  // Rule Toggles
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

  // Auto-Clean Simulation / Execution
  const handleRunAutoClean = (applyInPlace = true) => {
    if (!dataState || !dataState.rows) return;

    const result = cleanDataset(dataState.rows, dataState.columns, {
      ...cleanOptions,
      keyColumns,
    });

    if (applyInPlace) {
      setDataState((prev) => ({
        ...prev,
        rows: result.cleanedRows,
        columns: result.cleanedColumns,
        totalRows: result.cleanedRows.length,
        totalCols: result.cleanedColumns.length,
      }));
      setCleanSuccessSummary(result.changes);
      setCurrentPage(1);
    }
    return result;
  };

  // Export Cleaned Dataset
  const handleExportCleaned = (format) => {
    if (!dataState || !dataState.rows) return;
    const cleaned = handleRunAutoClean(false);
    const exportRows = cleaned ? cleaned.cleanedRows : dataState.rows;
    const exportCols = cleaned ? cleaned.cleanedColumns : dataState.columns;
    const fileName = dataState.fileName
      ? `Cleaned_${dataState.fileName}`
      : "Cleaned_Dataset";

    exportCleanedData(exportRows, exportCols, format, fileName);
  };

  return (
    <Container fluid className="data-analyzer-container">
      {/* ── Top Header & Global Action Bar ── */}
      <ScreenHeader
        icon={<Database />}
        title="Data Analyzer"
        actions={
          <div className="d-flex align-items-center gap-2">
            {dataState && (
              <>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={handleReset}
                >
                  <ArrowRepeat size={14} /> New Analysis
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={handleExportIssues}
                  disabled={!qualityResult || qualityResult.issues.length === 0}
                >
                  <Download size={14} /> Export Audit
                </Button>

                <Button
                  variant="success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1 shadow-sm"
                  onClick={() => handleExportCleaned("csv")}
                >
                  <Download size={14} /> Download Cleaned
                </Button>
              </>
            )}

            {!dataState && (
              <div className="d-flex gap-2">
                <Button
                  variant={inputMode === "upload" ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => setInputMode("upload")}
                >
                  <Upload className="me-1" size={13} /> Upload File
                </Button>
                <Button
                  variant={inputMode === "paste" ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => setInputMode("paste")}
                >
                  <Clipboard className="me-1" size={13} /> Paste Data
                </Button>
              </div>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <XCircleFill className="fs-5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        </Alert>
      )}

      {/* ── Empty State / Ingestion Hub ── */}
      {!dataState && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4 p-md-5">
            {inputMode === "upload" ? (
              <div
                className={`dropzone-card ${isDragging ? "drag-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, .json"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                    e.target.value = "";
                  }}
                />
                <div className="dropzone-icon">
                  {isLoading ? <Spinner animation="border" /> : <Upload />}
                </div>
                <h4 className="fw-bold mb-2">Drop your dataset file here</h4>
                <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "480px" }}>
                  Supports CSV, Excel (.xlsx, .xls), and JSON files. Run instant type inference, null checks, duplicate detection, and automated remediation.
                </p>
                <div className="d-flex justify-content-center gap-2 flex-wrap mb-2">
                  <Badge bg="secondary" className="px-3 py-2 bg-opacity-50">
                    .CSV
                  </Badge>
                  <Badge bg="secondary" className="px-3 py-2 bg-opacity-50">
                    .XLSX
                  </Badge>
                  <Badge bg="secondary" className="px-3 py-2 bg-opacity-50">
                    .JSON
                  </Badge>
                </div>
                <div className="mt-3">
                  <Button variant="primary" size="md" className="px-4 shadow-sm">
                    Browse File on Device
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h5 className="fw-bold mb-2">Paste Raw Dataset Text</h5>
                <p className="text-secondary small mb-3">
                  Paste comma-separated CSV values or a JSON array of objects to profile and validate instantly.
                </p>
                <Form.Control
                  as="textarea"
                  rows={8}
                  className="font-monospace mb-3"
                  placeholder='[&#10;  { "ID": 101, "Name": "Alice", "Email": "alice@test.com" },&#10;  { "ID": 102, "Name": "Bob", "Email": "bob@test.com" }&#10;]&#10;...or CSV format'
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                />
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setRawTextInput("")}
                    disabled={!rawTextInput}
                  >
                    Clear Text
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="px-4"
                    onClick={handleParsePastedText}
                    disabled={isLoading || !rawTextInput.trim()}
                  >
                    {isLoading ? <Spinner size="sm" className="me-2" /> : <LightningFill className="me-2" />}
                    Analyze Pasted Text
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Active Dashboard & Workspace ── */}
      {dataState && qualityResult && (
        <>
          {/* ── Executive Quality Scorecard ── */}
          <div className="scorecard-row">
            {/* Overall Score Dial */}
            <div className="score-main-card">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-uppercase fw-bold text-secondary">
                  Quality Index
                </span>
                <span className={`grade-pill bg-${scoreInfo.variant} text-white`}>
                  {scoreInfo.label}
                </span>
              </div>
              <div className="score-circle-badge">
                <div className={`radial-score-val text-${scoreInfo.variant}`}>
                  {scoreInfo.overall}%
                </div>
                <div>
                  <div className="fw-bold fs-5">{scoreInfo.grade} Grade</div>
                  <small className="text-secondary">
                    {qualityResult.issues.length} flagged issue
                    {qualityResult.issues.length !== 1 ? "s" : ""}
                  </small>
                </div>
              </div>
              <ProgressBar
                now={scoreInfo.overall}
                variant={scoreInfo.variant}
                style={{ height: "6px" }}
              />
            </div>

            {/* Completeness Card */}
            <div
              className={`metric-card ${
                selectedDimensionFilter === "Completeness" && activeTab === "issues"
                  ? "active-filter"
                  : ""
              }`}
              onClick={() => {
                setSelectedDimensionFilter("Completeness");
                setActiveTab("issues");
              }}
            >
              <div className="metric-header">
                <span>Completeness</span>
                <ShieldCheck className="text-primary" size={16} />
              </div>
              <div className="metric-value text-primary">
                {qualityResult.scores.completeness}%
              </div>
              <div>
                <ProgressBar
                  now={qualityResult.scores.completeness}
                  variant="primary"
                  style={{ height: "4px" }}
                  className="mb-2"
                />
                <small className="text-secondary">
                  {qualityResult.issues.filter((i) => i.dimension === "Completeness").length} missing values
                </small>
              </div>
            </div>

            {/* Validity Card */}
            <div
              className={`metric-card ${
                selectedDimensionFilter === "Validity" && activeTab === "issues"
                  ? "active-filter"
                  : ""
              }`}
              onClick={() => {
                setSelectedDimensionFilter("Validity");
                setActiveTab("issues");
              }}
            >
              <div className="metric-header">
                <span>Validity</span>
                <CheckCircleFill className="text-info" size={15} />
              </div>
              <div className="metric-value text-info">
                {qualityResult.scores.validity}%
              </div>
              <div>
                <ProgressBar
                  now={qualityResult.scores.validity}
                  variant="info"
                  style={{ height: "4px" }}
                  className="mb-2"
                />
                <small className="text-secondary">
                  {qualityResult.issues.filter((i) => i.dimension === "Validity").length} format errors
                </small>
              </div>
            </div>

            {/* Uniqueness Card */}
            <div
              className={`metric-card ${
                selectedDimensionFilter === "Uniqueness" && activeTab === "issues"
                  ? "active-filter"
                  : ""
              }`}
              onClick={() => {
                setSelectedDimensionFilter("Uniqueness");
                setActiveTab("issues");
              }}
            >
              <div className="metric-header">
                <span>Uniqueness</span>
                <Sliders className="text-success" size={15} />
              </div>
              <div className="metric-value text-success">
                {qualityResult.scores.uniqueness}%
              </div>
              <div>
                <ProgressBar
                  now={qualityResult.scores.uniqueness}
                  variant="success"
                  style={{ height: "4px" }}
                  className="mb-2"
                />
                <small className="text-secondary">
                  {qualityResult.issues.filter((i) => i.dimension === "Uniqueness").length} duplicate items
                </small>
              </div>
            </div>

            {/* Consistency Card */}
            <div
              className={`metric-card ${
                selectedDimensionFilter === "Consistency" && activeTab === "issues"
                  ? "active-filter"
                  : ""
              }`}
              onClick={() => {
                setSelectedDimensionFilter("Consistency");
                setActiveTab("issues");
              }}
            >
              <div className="metric-header">
                <span>Consistency</span>
                <LightningFill className="text-warning" size={15} />
              </div>
              <div className="metric-value text-warning">
                {qualityResult.scores.consistency}%
              </div>
              <div>
                <ProgressBar
                  now={qualityResult.scores.consistency}
                  variant="warning"
                  style={{ height: "4px" }}
                  className="mb-2"
                />
                <small className="text-secondary">
                  {qualityResult.issues.filter((i) => i.dimension === "Consistency").length} type anomalies
                </small>
              </div>
            </div>
          </div>

          {/* ── Smart Insights Strip ── */}
          <div className="insights-strip">
            <span className="fw-bold small text-secondary me-1">
              <LightningFill className="text-warning me-1" />
              Insights:
            </span>
            {qualityResult.issues.length === 0 ? (
              <span className="insight-pill text-success">
                <CheckCircleFill /> Clean dataset! Zero anomalies detected.
              </span>
            ) : (
              <>
                {qualityResult.issues.some((i) => i.issueType === "duplicate_row") && (
                  <span className="insight-pill text-warning">
                    <ExclamationTriangleFill /> Duplicate rows found
                  </span>
                )}
                {qualityResult.issues.some((i) => i.issueType === "missing_required_field") && (
                  <span className="insight-pill text-danger">
                    <XCircleFill /> Missing required field values
                  </span>
                )}
                {qualityResult.issues.some((i) => i.issueType === "mistyped_column") && (
                  <span className="insight-pill text-info">
                    <InfoCircle /> Numeric data stored as text
                  </span>
                )}
                <span className="insight-pill text-secondary">
                  {dataState.totalRows} rows across {dataState.totalCols} columns
                </span>
              </>
            )}
          </div>

          {/* ── Main Tabbed Workspaces ── */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-transparent border-bottom px-3 pt-3 pb-0">
              <Nav
                variant="tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="analyzer-tabs border-0"
              >
                <Nav.Item>
                  <Nav.Link eventKey="grid">
                    <TableIcon size={16} /> Data Explorer
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="profiling">
                    <BarChartFill size={16} /> Column Profiling
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="issues">
                    <ExclamationTriangleFill size={16} /> Issue Inspector
                    {qualityResult.issues.length > 0 && (
                      <Badge
                        bg={qualityResult.issues.some((i) => i.severity === "error") ? "danger" : "warning"}
                        text={qualityResult.issues.some((i) => i.severity === "error") ? "white" : "dark"}
                        className="ms-1 px-2"
                      >
                        {qualityResult.issues.length}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="clean">
                    <Magic size={16} /> Auto-Clean Studio
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="rules">
                    <GearFill size={16} /> Rules & Schema
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-3 p-md-4">
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: INTERACTIVE DATA GRID (EXPLORER)
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === "grid" && (
                <div>
                  {/* Grid Toolbar */}
                  <Row className="g-2 mb-3 align-items-center">
                    <Col md={4} lg={3}>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-body-tertiary">
                          <Search size={13} />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search cell values..."
                          value={gridSearch}
                          onChange={(e) => {
                            setGridSearch(e.target.value);
                            setCurrentPage(1);
                          }}
                        />
                        {gridSearch && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              setGridSearch("");
                              setCurrentPage(1);
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </InputGroup>
                    </Col>

                    <Col md={4} lg={3}>
                      <Form.Select
                        size="sm"
                        value={gridFilterMode}
                        onChange={(e) => {
                          setGridFilterMode(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">Show All Rows ({dataState.totalRows})</option>
                        <option value="issuesOnly">
                          Rows with Issues Only ({rowsWithIssuesSet.size})
                        </option>
                        <option value="cleanOnly">
                          Clean Rows Only ({dataState.totalRows - rowsWithIssuesSet.size})
                        </option>
                      </Form.Select>
                    </Col>

                    <Col
                      md={4}
                      lg={6}
                      className="d-flex justify-content-md-end align-items-center gap-2 flex-wrap"
                    >
                      <div className="d-flex align-items-center gap-1 small text-secondary me-2">
                        <span
                          className="d-inline-block rounded-circle bg-danger"
                          style={{ width: "8px", height: "8px" }}
                        />
                        <span>Critical Error</span>
                        <span
                          className="d-inline-block rounded-circle bg-warning ms-2"
                          style={{ width: "8px", height: "8px" }}
                        />
                        <span>Warning</span>
                      </div>

                      <Form.Select
                        size="sm"
                        style={{ width: "auto" }}
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10 / page</option>
                        <option value={15}>15 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Data Table */}
                  <div
                    className="custom-table-container table-responsive rounded border mb-3"
                    style={{ maxHeight: "560px" }}
                  >
                    <Table hover className="data-grid-table mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: "60px" }}>#</th>
                          {dataState.columns.map((col) => {
                            const isSorted = sortColumn === col;
                            const isReq = requiredColumns.includes(col);
                            const isKey = keyColumns.includes(col);
                            return (
                              <th
                                key={col}
                                onClick={() => handleSort(col)}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="d-flex align-items-center justify-content-between gap-2">
                                  <span>
                                    {col}
                                    {isReq && (
                                      <span
                                        className="text-danger ms-1"
                                        title="Required field"
                                      >
                                        *
                                      </span>
                                    )}
                                    {isKey && (
                                      <Badge bg="success" className="ms-1 py-0 px-1" style={{ fontSize: "0.65rem" }}>
                                        KEY
                                      </Badge>
                                    )}
                                  </span>
                                  <ArrowDownUp
                                    size={11}
                                    className={isSorted ? "text-primary fw-bold" : "text-secondary opacity-50"}
                                  />
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedGridRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={dataState.columns.length + 1}
                              className="text-center py-5 text-secondary"
                            >
                              No matching records found.
                            </td>
                          </tr>
                        ) : (
                          paginatedGridRows.map((row) => (
                            <tr key={row.__rowIndex}>
                              <td className="text-secondary small font-monospace">
                                {row.__rowIndex}
                              </td>
                              {dataState.columns.map((col) => {
                                const val = row[col];
                                const cellIssueKey = `${row.__rowIndex}:${col}`;
                                const issue = cellIssueMap.get(cellIssueKey);

                                const isNull =
                                  val === null ||
                                  val === undefined ||
                                  (typeof val === "string" && val.trim() === "");

                                let cellClass = "";
                                if (issue) {
                                  cellClass =
                                    issue.severity === "error"
                                      ? "cell-has-error"
                                      : "cell-has-warning";
                                }

                                const cellContent = isNull ? (
                                  <span className="cell-null-pill">&lt;empty&gt;</span>
                                ) : (
                                  String(val)
                                );

                                if (issue) {
                                  return (
                                    <OverlayTrigger
                                      key={col}
                                      placement="top"
                                      overlay={
                                        <Tooltip id={`tooltip-${cellIssueKey}`}>
                                          <strong>{issue.dimension} ({issue.severity.toUpperCase()}):</strong>{" "}
                                          {issue.message}
                                        </Tooltip>
                                      }
                                    >
                                      <td className={cellClass}>{cellContent}</td>
                                    </OverlayTrigger>
                                  );
                                }

                                return (
                                  <td key={col} className={cellClass}>
                                    {cellContent}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Grid Pagination */}
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <small className="text-secondary">
                      Showing{" "}
                      <strong>
                        {processedGridRows.length === 0
                          ? 0
                          : (currentPage - 1) * rowsPerPage + 1}
                      </strong>{" "}
                      to{" "}
                      <strong>
                        {Math.min(currentPage * rowsPerPage, processedGridRows.length)}
                      </strong>{" "}
                      of <strong>{processedGridRows.length}</strong> matching rows
                    </small>

                    {totalGridPages > 1 && (
                      <Pagination size="sm" className="mb-0">
                        <Pagination.First
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        />

                        {Array.from({ length: Math.min(5, totalGridPages) }, (_, i) => {
                          let pageNum;
                          if (totalGridPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalGridPages - 2)
                            pageNum = totalGridPages - 4 + i;
                          else pageNum = currentPage - 2 + i;

                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        })}

                        <Pagination.Next
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalGridPages, p + 1))
                          }
                          disabled={currentPage === totalGridPages}
                        />
                        <Pagination.Last
                          onClick={() => setCurrentPage(totalGridPages)}
                          disabled={currentPage === totalGridPages}
                        />
                      </Pagination>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: COLUMN PROFILING & HEALTH
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === "profiling" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small text-secondary">
                      Showing automated schema and type breakdown for{" "}
                      <strong>{qualityResult.profiles.length}</strong> columns.
                    </span>
                    <div className="btn-group btn-group-sm">
                      <Button
                        variant={profileViewMode === "cards" ? "primary" : "outline-secondary"}
                        onClick={() => setProfileViewMode("cards")}
                      >
                        Cards View
                      </Button>
                      <Button
                        variant={profileViewMode === "table" ? "primary" : "outline-secondary"}
                        onClick={() => setProfileViewMode("table")}
                      >
                        Table View
                      </Button>
                    </div>
                  </div>

                  {profileViewMode === "cards" ? (
                    <div className="profiling-grid">
                      {qualityResult.profiles.map((p) => {
                        const isReq = requiredColumns.includes(p.columnName);
                        const isKey = keyColumns.includes(p.columnName);

                        return (
                          <div key={p.columnName} className="profile-card">
                            <div>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold mb-0 text-body">
                                    {p.columnName}
                                  </h6>
                                  <small className="text-secondary font-monospace">
                                    {p.inferredType.toUpperCase()}
                                  </small>
                                </div>
                                <div className="d-flex gap-1">
                                  {isReq && (
                                    <Badge bg="danger" className="py-1">
                                      Required
                                    </Badge>
                                  )}
                                  {isKey && (
                                    <Badge bg="success" className="py-1">
                                      Key ID
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Missing Rate */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between small text-secondary mb-1">
                                  <span>Missing / Nulls</span>
                                  <span>
                                    <strong>{p.nullCount}</strong> ({p.nullPercentage}%)
                                  </span>
                                </div>
                                <ProgressBar
                                  now={p.nullPercentage}
                                  variant={
                                    p.nullPercentage > 20
                                      ? "danger"
                                      : p.nullPercentage > 0
                                      ? "warning"
                                      : "success"
                                  }
                                  style={{ height: "5px" }}
                                />
                              </div>

                              {/* Unique Count */}
                              <div className="d-flex justify-content-between small mb-2 text-body">
                                <span className="text-secondary">Distinct Values:</span>
                                <span>
                                  <strong>{p.uniqueCount}</strong> ({p.uniquePercentage}%)
                                </span>
                              </div>

                              {/* Numeric Stats if any */}
                              {p.numericStats && (
                                <div className="bg-body-tertiary p-2 rounded small mb-2 font-monospace">
                                  <div className="d-flex justify-content-between text-secondary">
                                    <span>Min: {p.numericStats.min}</span>
                                    <span>Max: {p.numericStats.max}</span>
                                    <span>Mean: {p.numericStats.mean}</span>
                                  </div>
                                </div>
                              )}

                              {/* Top Values */}
                              <div className="small mb-3">
                                <span className="text-secondary d-block mb-1">
                                  Top Frequent Values:
                                </span>
                                <div className="d-flex flex-wrap gap-1">
                                  {p.topValues.slice(0, 4).map((tv, i) => (
                                    <span
                                      key={i}
                                      className="badge bg-body-tertiary text-body border font-monospace fw-normal"
                                    >
                                      {tv.value} ({tv.count})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Quick Rule Action Toggles */}
                            <div className="d-flex gap-2 pt-2 border-top">
                              <Button
                                variant={isReq ? "danger" : "outline-secondary"}
                                size="sm"
                                className="flex-fill py-1 small"
                                onClick={() => toggleRequiredColumn(p.columnName)}
                              >
                                {isReq ? "✓ Required" : "+ Set Required"}
                              </Button>
                              <Button
                                variant={isKey ? "success" : "outline-secondary"}
                                size="sm"
                                className="flex-fill py-1 small"
                                onClick={() => toggleKeyColumn(p.columnName)}
                              >
                                {isKey ? "✓ Unique Key" : "+ Set Key"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Table View for Profiling */
                    <div className="table-responsive rounded border">
                      <Table hover align="middle" className="mb-0">
                        <thead className="bg-body-tertiary">
                          <tr>
                            <th>Column Name</th>
                            <th>Inferred Type</th>
                            <th>Missing / Nulls</th>
                            <th>Distinct Values</th>
                            <th>Summary Stats</th>
                            <th>Top Values</th>
                            <th>Rules</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualityResult.profiles.map((p) => (
                            <tr key={p.columnName}>
                              <td className="fw-semibold">{p.columnName}</td>
                              <td>
                                <Badge bg="secondary" className="bg-opacity-50 text-uppercase">
                                  {p.inferredType}
                                </Badge>
                              </td>
                              <td style={{ minWidth: "140px" }}>
                                <div className="d-flex justify-content-between small mb-1">
                                  <span>{p.nullPercentage}%</span>
                                  <span className="text-secondary">({p.nullCount})</span>
                                </div>
                                <ProgressBar
                                  now={p.nullPercentage}
                                  variant={p.nullPercentage > 20 ? "danger" : p.nullPercentage > 0 ? "warning" : "success"}
                                  style={{ height: "4px" }}
                                />
                              </td>
                              <td>
                                {p.uniqueCount}{" "}
                                <small className="text-secondary">({p.uniquePercentage}%)</small>
                              </td>
                              <td>
                                {p.numericStats ? (
                                  <small className="font-monospace text-secondary">
                                    Min: {p.numericStats.min} | Max: {p.numericStats.max} | Mean: {p.numericStats.mean}
                                  </small>
                                ) : (
                                  <small className="text-secondary">-</small>
                                )}
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {p.topValues.slice(0, 3).map((tv, i) => (
                                    <span key={i} className="badge bg-body-tertiary text-body border small">
                                      {tv.value}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant={requiredColumns.includes(p.columnName) ? "danger" : "outline-secondary"}
                                    size="sm"
                                    className="py-0 px-1 small"
                                    onClick={() => toggleRequiredColumn(p.columnName)}
                                  >
                                    Req
                                  </Button>
                                  <Button
                                    variant={keyColumns.includes(p.columnName) ? "success" : "outline-secondary"}
                                    size="sm"
                                    className="py-0 px-1 small"
                                    onClick={() => toggleKeyColumn(p.columnName)}
                                  >
                                    Key
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: ANOMALY & ISSUE INSPECTOR
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === "issues" && (
                <div>
                  {/* Filters Bar */}
                  <Row className="g-2 mb-3 align-items-center">
                    <Col md={3}>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-body-tertiary">
                          <Search size={13} />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search issues..."
                          value={issueSearchTerm}
                          onChange={(e) => setIssueSearchTerm(e.target.value)}
                        />
                        {issueSearchTerm && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setIssueSearchTerm("")}
                          >
                            ×
                          </Button>
                        )}
                      </InputGroup>
                    </Col>

                    <Col md={9} className="d-flex flex-wrap justify-content-md-end gap-2">
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

                      <Form.Select
                        size="sm"
                        style={{ width: "auto" }}
                        value={selectedColumnFilter}
                        onChange={(e) => setSelectedColumnFilter(e.target.value)}
                      >
                        <option value="all">All Columns</option>
                        {dataState.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Form.Select>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleExportIssues}
                        disabled={filteredIssues.length === 0}
                      >
                        <Download size={13} /> Export Report
                      </Button>
                    </Col>
                  </Row>

                  {/* Issues Table */}
                  {filteredIssues.length === 0 ? (
                    <div className="text-center py-5 rounded border bg-body-tertiary text-secondary">
                      <CheckCircleFill className="display-5 text-success mb-2 opacity-75" />
                      <h5 className="fw-bold text-body">No issues matching filters</h5>
                      <p className="small mb-0">Try clearing your search query or dimension filters.</p>
                    </div>
                  ) : (
                    <div className="table-responsive rounded border">
                      <Table hover align="middle" className="mb-0">
                        <thead className="bg-body-tertiary">
                          <tr>
                            <th style={{ width: "60px" }}>#</th>
                            <th>Row</th>
                            <th>Column</th>
                            <th>Dimension</th>
                            <th>Severity</th>
                            <th>Description</th>
                            <th>Value</th>
                            <th style={{ width: "100px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIssues.map((issue) => (
                            <tr key={issue.id}>
                              <td className="text-secondary small font-monospace">{issue.id}</td>
                              <td>
                                {issue.rowIndex > 0 ? (
                                  <Button
                                    variant="link"
                                    className="p-0 text-decoration-none fw-bold"
                                    onClick={() => handleJumpToGridRow(issue.rowIndex)}
                                  >
                                    Row {issue.rowIndex}
                                  </Button>
                                ) : (
                                  <span className="text-secondary small">Summary</span>
                                )}
                              </td>
                              <td className="fw-semibold">{issue.columnName}</td>
                              <td>
                                <Badge bg="info" className="bg-opacity-75">
                                  {issue.dimension}
                                </Badge>
                              </td>
                              <td>
                                <Badge
                                  bg={issue.severity === "error" ? "danger" : "warning"}
                                  text={issue.severity === "warning" ? "dark" : "white"}
                                >
                                  {issue.severity.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="text-break">{issue.message}</td>
                              <td>
                                <code className="bg-body-tertiary px-2 py-1 rounded border small">
                                  {String(issue.value)}
                                </code>
                              </td>
                              <td>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="py-0 px-2 small"
                                  onClick={() => handleCopyIssue(issue)}
                                >
                                  {copiedIssueId === issue.id ? (
                                    <ClipboardCheck className="text-success" />
                                  ) : (
                                    <Clipboard />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: AUTO-CLEAN & REMEDIATION STUDIO
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === "clean" && (
                <div>
                  {cleanSuccessSummary && (
                    <Alert
                      variant="success"
                      dismissible
                      onClose={() => setCleanSuccessSummary(null)}
                      className="mb-4 shadow-sm"
                    >
                      <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                        <CheckCircleFill /> Data Cleaning Applied Successfully!
                      </h6>
                      <div className="d-flex flex-wrap gap-3 small">
                        <span>Duplicates Removed: <strong>{cleanSuccessSummary.duplicatesRemoved}</strong></span>
                        <span>Cells Trimmed: <strong>{cleanSuccessSummary.cellsTrimmed}</strong></span>
                        <span>Numbers Coerced: <strong>{cleanSuccessSummary.numbersCoerced}</strong></span>
                        <span>Nulls Filled: <strong>{cleanSuccessSummary.nullsFilled}</strong></span>
                        <span>Empty Cols Dropped: <strong>{cleanSuccessSummary.colsDropped}</strong></span>
                      </div>
                    </Alert>
                  )}

                  <Row className="g-4 mb-4">
                    <Col lg={7}>
                      <h5 className="fw-bold mb-3">Remediation Recipes</h5>
                      <p className="text-secondary small mb-3">
                        Choose automated data cleaning recipes to standardize and repair issues across the entire dataset.
                      </p>

                      {/* Recipe 1: Deduplicate */}
                      <div className="remediation-option-card">
                        <div>
                          <h6 className="fw-bold mb-1">🧹 Remove Duplicate Rows</h6>
                          <p className="small text-secondary mb-0">
                            Eliminates duplicate rows based on all columns or selected Key identifier(s).
                          </p>
                        </div>
                        <Form.Check
                          type="switch"
                          id="clean-dup"
                          checked={cleanOptions.removeDuplicates}
                          onChange={(e) =>
                            setCleanOptions((prev) => ({
                              ...prev,
                              removeDuplicates: e.target.checked,
                            }))
                          }
                        />
                      </div>

                      {/* Recipe 2: Trim Whitespace */}
                      <div className="remediation-option-card">
                        <div>
                          <h6 className="fw-bold mb-1">✂️ Trim Leading & Trailing Whitespace</h6>
                          <p className="small text-secondary mb-0">
                            Strips accidental spaces and extra padding from text values.
                          </p>
                        </div>
                        <Form.Check
                          type="switch"
                          id="clean-trim"
                          checked={cleanOptions.trimWhitespace}
                          onChange={(e) =>
                            setCleanOptions((prev) => ({
                              ...prev,
                              trimWhitespace: e.target.checked,
                            }))
                          }
                        />
                      </div>

                      {/* Recipe 3: Coerce String Numbers */}
                      <div className="remediation-option-card">
                        <div>
                          <h6 className="fw-bold mb-1">🔢 Convert Numeric Strings to Numbers</h6>
                          <p className="small text-secondary mb-0">
                            Detects string values like &quot;42&quot; or &quot;99.5&quot; and converts them to genuine numeric data types.
                          </p>
                        </div>
                        <Form.Check
                          type="switch"
                          id="clean-num"
                          checked={cleanOptions.coerceNumbers}
                          onChange={(e) =>
                            setCleanOptions((prev) => ({
                              ...prev,
                              coerceNumbers: e.target.checked,
                            }))
                          }
                        />
                      </div>

                      {/* Recipe 4: Drop Empty Columns */}
                      <div className="remediation-option-card">
                        <div>
                          <h6 className="fw-bold mb-1">🗑️ Drop 100% Empty Columns</h6>
                          <p className="small text-secondary mb-0">
                            Removes unused columns that contain zero non-null values.
                          </p>
                        </div>
                        <Form.Check
                          type="switch"
                          id="clean-empty-cols"
                          checked={cleanOptions.dropEmptyCols}
                          onChange={(e) =>
                            setCleanOptions((prev) => ({
                              ...prev,
                              dropEmptyCols: e.target.checked,
                            }))
                          }
                        />
                      </div>

                      {/* Recipe 5: Fill Nulls */}
                      <div className="remediation-option-card flex-wrap">
                        <div className="flex-fill">
                          <h6 className="fw-bold mb-1">🩹 Fill Missing / Null Values</h6>
                          <p className="small text-secondary mb-0">
                            Replaces empty cells with a default placeholder.
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {cleanOptions.fillNulls && (
                            <Form.Control
                              size="sm"
                              style={{ width: "100px" }}
                              value={cleanOptions.fillNullValue}
                              onChange={(e) =>
                                setCleanOptions((prev) => ({
                                  ...prev,
                                  fillNullValue: e.target.value,
                                }))
                              }
                            />
                          )}
                          <Form.Check
                            type="switch"
                            id="clean-nulls"
                            checked={cleanOptions.fillNulls}
                            onChange={(e) =>
                              setCleanOptions((prev) => ({
                                ...prev,
                                fillNulls: e.target.checked,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Recipe 6: Standardize Casing */}
                      <div className="remediation-option-card">
                        <div>
                          <h6 className="fw-bold mb-1">🔠 Standardize Text Casing</h6>
                          <p className="small text-secondary mb-0">
                            Converts text fields to consistent lowercase, uppercase, or Title Case.
                          </p>
                        </div>
                        <Form.Select
                          size="sm"
                          style={{ width: "140px" }}
                          value={cleanOptions.standardizeCasing}
                          onChange={(e) =>
                            setCleanOptions((prev) => ({
                              ...prev,
                              standardizeCasing: e.target.value,
                            }))
                          }
                        >
                          <option value="none">No Change</option>
                          <option value="lowercase">lowercase</option>
                          <option value="uppercase">UPPERCASE</option>
                          <option value="titlecase">Title Case</option>
                        </Form.Select>
                      </div>
                    </Col>

                    {/* Action Hub & Exporters */}
                    <Col lg={5}>
                      <Card className="border bg-body-tertiary h-100 p-3">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <Magic className="text-primary" /> Apply & Export Actions
                        </h6>
                        <p className="small text-secondary mb-4">
                          Apply modifications directly to update the active workspace, or download a freshly cleaned file without altering the original.
                        </p>

                        <div className="d-grid gap-3 mb-4">
                          <Button
                            variant="primary"
                            size="lg"
                            className="d-flex align-items-center justify-content-center gap-2 shadow-sm"
                            onClick={() => handleRunAutoClean(true)}
                          >
                            <LightningFill /> Apply Cleaning Recipes
                          </Button>
                        </div>

                        <div className="border-top pt-3">
                          <span className="small text-uppercase fw-bold text-secondary d-block mb-2">
                            Export Cleaned Dataset:
                          </span>
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-secondary"
                              className="d-flex align-items-center justify-content-between"
                              onClick={() => handleExportCleaned("csv")}
                            >
                              <span>CSV File (.csv)</span>
                              <FiletypeCsv size={18} className="text-success" />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              className="d-flex align-items-center justify-content-between"
                              onClick={() => handleExportCleaned("xlsx")}
                            >
                              <span>Excel Spreadsheet (.xlsx)</span>
                              <FiletypeXlsx size={18} className="text-success" />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              className="d-flex align-items-center justify-content-between"
                              onClick={() => handleExportCleaned("json")}
                            >
                              <span>JSON Data (.json)</span>
                              <FiletypeJson size={18} className="text-warning" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: RULES & SCHEMA CONFIGURATION
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === "rules" && (
                <div>
                  <Alert variant="info" className="d-flex align-items-center gap-2 mb-4">
                    <InfoCircle />
                    <span>
                      Configure column constraints to enforce strict completeness and unique primary keys.
                    </span>
                  </Alert>

                  <Row className="g-4">
                    <Col md={6}>
                      <Card className="h-100 border">
                        <Card.Header className="fw-bold bg-body-tertiary">
                          Required Columns (Completeness)
                        </Card.Header>
                        <Card.Body>
                          <p className="small text-secondary">
                            Toggle columns that must not contain missing/null values. Missing values in required columns will be flagged as critical errors.
                          </p>
                          <div className="d-flex flex-wrap gap-2">
                            {dataState.columns.map((col) => {
                              const active = requiredColumns.includes(col);
                              return (
                                <Button
                                  key={col}
                                  variant={active ? "danger" : "outline-secondary"}
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
                          Unique Key Identifier (Uniqueness)
                        </Card.Header>
                        <Card.Body>
                          <p className="small text-secondary">
                            Select column(s) that serve as unique primary keys. Duplicate values across these columns will be flagged as critical errors.
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
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
