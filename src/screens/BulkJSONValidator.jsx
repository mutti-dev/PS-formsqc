import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  ProgressBar,
  InputGroup,
  Table,
  Modal,
  Tabs,
  Tab,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Search,
  FileEarmarkSpreadsheet,
  LightningChargeFill,
  ShieldCheck,
  ExclamationTriangleFill,
  XCircleFill,
  ClipboardCheck,
  Clipboard,
  EyeFill,
  Upload,
  Trash,
  ArrowClockwise,
  Boxes,
} from "react-bootstrap-icons";
import { ValidationSection } from "../common/sections";
import {
  analyzeBulkForms,
  autoFixBulkForms,
  autoFixSingleForm,
  exportBulkResultsToTSV,
} from "../utils/bulkQcEngine";
import { exportBulkQcToExcel } from "../utils/exportUtils";
import "../css/BulkJSONValidator.css";

const STORAGE_KEY = "BulkJSONValidatorDraft";

export default function BulkJSONValidator({ theme = "dark" }) {
  const [rawInput, setRawInput] = useState("");
  const [keyLengthThreshold, setKeyLengthThreshold] = useState(110);
  const formType = "Form";
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkData, setBulkData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Single Form Modal Inspection
  const [selectedFormIndex, setSelectedFormIndex] = useState(null);
  const [activeInspectTab, setActiveInspectTab] = useState("validation");

  const fileInputRef = useRef(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRawInput(saved);
    } catch (err) {
      console.warn("Unable to load bulk validator draft", err);
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    try {
      if (rawInput) {
        localStorage.setItem(STORAGE_KEY, rawInput);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Unable to save bulk validator draft", err);
    }
  }, [rawInput]);

  // Run Bulk Analysis
  const handleAnalyze = () => {
    if (!rawInput.trim()) {
      setErrorMessage("Please paste or upload your bulk form data first.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    try {
      const results = analyzeBulkForms(rawInput, { formType, keyLengthThreshold });
      if (results.forms.length === 0) {
        setErrorMessage("No valid form records could be parsed. Check your data format.");
      } else {
        setBulkData(results);
      }
    } catch (err) {
      setErrorMessage("Analysis failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-Fix All Forms in Batch
  const handleAutoFixAll = () => {
    if (!bulkData) return;
    setIsProcessing(true);
    try {
      const fixedResults = autoFixBulkForms(bulkData, { formType, keyLengthThreshold });
      setBulkData(fixedResults);
      // Update rawInput with updated TSV
      const newTsv = exportBulkResultsToTSV(fixedResults);
      setRawInput(newTsv);
    } catch (err) {
      setErrorMessage("Auto-fix failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fix Single Issue in Selected Form Modal
  const handleFixSingleFormIssue = (issue) => {
    if (selectedFormIndex === null || !bulkData) return;
    const currentForm = bulkData.forms[selectedFormIndex];
    if (!currentForm) return;

    // Apply auto fix to the single form
    const updatedForm = autoFixSingleForm(currentForm, { formType, keyLengthThreshold });
    const updatedForms = [...bulkData.forms];
    updatedForms[selectedFormIndex] = updatedForm;

    // Recompute stats
    const updatedBulkData = autoFixBulkForms({ forms: updatedForms }, { formType, keyLengthThreshold });
    setBulkData(updatedBulkData);
    setRawInput(exportBulkResultsToTSV(updatedBulkData));
  };

  // Fix All Issues for Selected Form in Modal
  const handleFixAllInSelectedForm = () => {
    if (selectedFormIndex === null || !bulkData) return;
    const currentForm = bulkData.forms[selectedFormIndex];
    if (!currentForm) return;

    const updatedForm = autoFixSingleForm(currentForm, { formType, keyLengthThreshold });
    const updatedForms = [...bulkData.forms];
    updatedForms[selectedFormIndex] = updatedForm;

    const updatedBulkData = autoFixBulkForms({ forms: updatedForms }, { formType, keyLengthThreshold });
    setBulkData(updatedBulkData);
    setRawInput(exportBulkResultsToTSV(updatedBulkData));
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setRawInput(content);
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  // Export Excel Report
  const handleExportExcel = () => {
    if (!bulkData) return;
    exportBulkQcToExcel(bulkData);
  };

  // Copy Fixed TSV to Clipboard
  const handleCopyTSV = () => {
    if (!bulkData) return;
    const tsv = exportBulkResultsToTSV(bulkData);
    navigator.clipboard.writeText(tsv).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // Filtered Forms List
  const filteredForms = useMemo(() => {
    if (!bulkData?.forms) return [];
    return bulkData.forms.filter((form) => {
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const idMatch = String(form.id || "").toLowerCase().includes(query);
        const nameMatch = String(form.name || "").toLowerCase().includes(query);
        return idMatch || nameMatch;
      }
      return true;
    });
  }, [bulkData, statusFilter, searchTerm]);

  const selectedForm = useMemo(() => {
    if (selectedFormIndex === null || !bulkData?.forms) return null;
    return bulkData.forms[selectedFormIndex] || null;
  }, [selectedFormIndex, bulkData]);

  // Category labels helper
  const getCategoryLabel = (type) => {
    switch (type) {
      case "container_key_invalid":
        return "Container Key Rule";
      case "label_key_mismatch":
        return "Label / Key Mismatch";
      case "key_length_exceeded":
        return "Key Length Exceeded";
      case "reserved_column":
        return "Reserved Column";
      case "grid_key_missing_keyword":
        return "Grid Naming Rule";
      case "duplicate_select_option":
        return "Duplicate Select Option";
      case "duplicate_radio_option":
        return "Duplicate Radio Option";
      default:
        return type ? type.replace(/_/g, " ") : "General";
    }
  };

  return (
    <Container fluid data-bs-theme={theme} className={`bulk-validator-container theme-${theme}`}>
      {/* ── Header Bar ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2 text-body">
            <Boxes className="text-primary" />
            Bulk Form QC Review
          </h4>
          <p className="text-body-secondary small mb-0">
            Paste multi-form datasets (TSV with FormId, Caption, and Description JSON) to perform automated QC validation across all forms at once.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {bulkData && (
            <>
              <Button
                variant="outline-success"
                size="sm"
                className="d-flex align-items-center gap-1 fw-medium"
                onClick={handleAutoFixAll}
                disabled={isProcessing}
              >
                <LightningChargeFill />
                Auto-Fix All Forms
              </Button>

              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={handleExportExcel}
              >
                <FileEarmarkSpreadsheet />
                Export Excel Report
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={handleCopyTSV}
              >
                {copySuccess ? <ClipboardCheck className="text-success" /> : <Clipboard />}
                {copySuccess ? "Copied!" : "Copy TSV"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Input Section ── */}
      <Card className="mb-4 shadow-sm border">
        <Card.Header className="bg-body-tertiary d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 py-2">
          <span className="fw-semibold small text-body-secondary text-uppercase">
            Bulk Raw Input Payload
          </span>

          <div className="d-flex align-items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".txt,.tsv,.csv,.json"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} /> Upload File (.txt, .tsv, .csv)
            </Button>
            {rawInput && (
              <Button
                variant="outline-danger"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={() => {
                  setRawInput("");
                  setBulkData(null);
                  setErrorMessage("");
                }}
              >
                <Trash size={13} /> Clear
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-3">
          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage("")} className="py-2 small">
              {errorMessage}
            </Alert>
          )}

          <Form.Control
            as="textarea"
            rows={6}
            placeholder={`Paste tab-delimited text or CSV with FormId, Caption, Description. For example:\nFormId\tCaption\tDescription\n1\t5. Healthy Homes Screening\t{"name":"...","config":"{\\"components\\":[...]}"}\n3\tEmergency Rental Assistance\t{"name":"...","config":"{\\"components\\":[...]}"}`}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="font-monospace small mb-3"
          />

          <Row className="g-2 align-items-center">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Key Length Limit (chars)</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={keyLengthThreshold}
                  onChange={(e) => setKeyLengthThreshold(Number(e.target.value) || 110)}
                  min={20}
                  max={255}
                />
                <Form.Text className="text-body-secondary small">
                  Keys exceeding this limit are flagged as Critical Errors.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={8} className="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 px-4 fw-semibold"
                onClick={handleAnalyze}
                disabled={isProcessing || !rawInput.trim()}
              >
                {isProcessing ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    Analyzing Batch...
                  </>
                ) : (
                  <>
                    <ArrowClockwise />
                    Analyze All Forms
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Executive Batch Summary Cards ── */}
      {bulkData?.stats && (
        <>
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <div className="p-3 rounded bg-body-tertiary border text-center h-100 bulk-summary-card">
                <div className="bulk-stat-label text-body-secondary mb-1">Total Forms</div>
                <div className="bulk-stat-number text-body">{bulkData.stats.totalForms}</div>
                <small className="text-body-secondary">Analyzed in batch</small>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div
                className={`p-3 rounded border text-center h-100 bulk-summary-card ${
                  bulkData.stats.errorFormsCount > 0
                    ? "bg-danger bg-opacity-10 border-danger border-opacity-25"
                    : "bg-body-tertiary"
                }`}
              >
                <div className="bulk-stat-label text-body-secondary mb-1">Critical Errors</div>
                <div
                  className={`bulk-stat-number ${
                    bulkData.stats.errorFormsCount > 0 ? "text-danger" : "text-body-secondary"
                  }`}
                >
                  {bulkData.stats.totalCriticalErrors}
                </div>
                <small className="text-body-secondary">
                  Across {bulkData.stats.errorFormsCount} form(s)
                </small>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div
                className={`p-3 rounded border text-center h-100 bulk-summary-card ${
                  bulkData.stats.warningFormsCount > 0
                    ? "bg-warning bg-opacity-10 border-warning border-opacity-25"
                    : "bg-body-tertiary"
                }`}
              >
                <div className="bulk-stat-label text-body-secondary mb-1">Warnings</div>
                <div
                  className={`bulk-stat-number ${
                    bulkData.stats.warningFormsCount > 0 ? "text-warning" : "text-body-secondary"
                  }`}
                >
                  {bulkData.stats.totalWarnings}
                </div>
                <small className="text-body-secondary">
                  Across {bulkData.stats.warningFormsCount} form(s)
                </small>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="p-3 rounded bg-body-tertiary border text-center h-100 bulk-summary-card">
                <div className="bulk-stat-label text-body-secondary mb-1">Batch QC Score</div>
                <div
                  className={`bulk-stat-number ${
                    bulkData.stats.avgHealthScore === 100
                      ? "text-success"
                      : bulkData.stats.avgHealthScore >= 70
                      ? "text-warning"
                      : "text-danger"
                  }`}
                >
                  {bulkData.stats.avgHealthScore}%
                </div>
                <small className="text-body-secondary">
                  {bulkData.stats.cleanFormsCount} / {bulkData.stats.totalForms} clean forms
                </small>
              </div>
            </Col>
          </Row>

          {/* Issue Categories Pills */}
          {Object.keys(bulkData.stats.categoryCounts || {}).length > 0 && (
            <Card className="mb-4 shadow-sm border">
              <Card.Body className="p-3">
                <div className="small fw-bold text-body-secondary text-uppercase mb-2">
                  Issue Breakdown by Category
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {Object.entries(bulkData.stats.categoryCounts).map(([cat, count]) => {
                    const isCrit = ["container_key_invalid", "reserved_column", "key_length_exceeded", "grid_key_missing_keyword"].includes(cat);
                    return (
                      <span
                        key={cat}
                        className={`category-chip ${
                          isCrit
                            ? "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                            : "bg-warning bg-opacity-10 text-body border border-warning border-opacity-25"
                        }`}
                      >
                        <span>{getCategoryLabel(cat)}:</span>
                        <strong className="ms-1">{count}</strong>
                      </span>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* ── Multi-Form Results Table ── */}
          <Card className="mb-4 shadow-sm border">
            <Card.Header className="bg-body-tertiary py-3">
              <Row className="g-2 align-items-center">
                <Col md={5}>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-body-tertiary text-body border-secondary border-opacity-25">
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by Form ID or Form Name..."
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
                  <Form.Select
                    size="sm"
                    style={{ width: "auto" }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Forms ({bulkData.forms.length})</option>
                    <option value="critical">Critical Errors ({bulkData.stats.errorFormsCount})</option>
                    <option value="warning">Warnings Only ({bulkData.stats.warningFormsCount})</option>
                    <option value="clean">Clean / Passed ({bulkData.stats.cleanFormsCount})</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0">
                  <thead className={theme === "dark" ? "table-dark border-bottom" : "table-light border-bottom"}>
                    <tr>
                      <th style={{ width: "80px" }}>Form ID</th>
                      <th>Form Name / Caption</th>
                      <th style={{ width: "140px" }}>Status</th>
                      <th style={{ width: "160px" }}>Compliance</th>
                      <th style={{ width: "120px" }}>Critical</th>
                      <th style={{ width: "110px" }}>Warnings</th>
                      <th style={{ width: "100px" }}>Fields</th>
                      <th style={{ width: "110px" }} className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForms.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-body-secondary">
                          No forms match your search/filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredForms.map((form, index) => {
                        const originalIndex = bulkData.forms.indexOf(form);
                        const isCritical = form.status === "critical";
                        const isWarning = form.status === "warning";

                        return (
                          <tr
                            key={index}
                            className="bulk-form-row"
                            onClick={() => {
                              setSelectedFormIndex(originalIndex);
                              setActiveInspectTab("validation");
                            }}
                          >
                            <td className="fw-semibold font-monospace text-body">{form.id}</td>
                            <td className="fw-medium text-body">{form.name}</td>
                            <td>
                              {isCritical ? (
                                <Badge bg="danger" className="px-2 py-1">
                                  <XCircleFill className="me-1" /> Error
                                </Badge>
                              ) : isWarning ? (
                                <Badge bg="warning" text="dark" className="px-2 py-1">
                                  <ExclamationTriangleFill className="me-1" /> Warning
                                </Badge>
                              ) : (
                                <Badge bg="success" className="px-2 py-1">
                                  <ShieldCheck className="me-1" /> Clean
                                </Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar
                                  now={form.healthScore}
                                  variant={
                                    form.healthScore === 100
                                      ? "success"
                                      : form.healthScore >= 70
                                      ? "warning"
                                      : "danger"
                                  }
                                  style={{ width: "60px", height: "6px" }}
                                />
                                <span className="small fw-semibold">{form.healthScore}%</span>
                              </div>
                            </td>
                            <td>
                              {form.errorCount > 0 ? (
                                <Badge bg="danger" className="bg-opacity-15 text-danger border border-danger border-opacity-25">
                                  {form.errorCount} Error{form.errorCount > 1 ? "s" : ""}
                                </Badge>
                              ) : (
                                <span className="text-body-secondary small">—</span>
                              )}
                            </td>
                            <td>
                              {form.warningCount > 0 ? (
                                <Badge bg="warning" text="dark" className="bg-opacity-15 border border-warning border-opacity-25">
                                  {form.warningCount} Warning{form.warningCount > 1 ? "s" : ""}
                                </Badge>
                              ) : (
                                <span className="text-body-secondary small">—</span>
                              )}
                            </td>
                            <td className="text-body-secondary small">{form.totalComponents}</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="d-inline-flex align-items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFormIndex(originalIndex);
                                  setActiveInspectTab("validation");
                                }}
                              >
                                <EyeFill size={12} /> Inspect
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* ── Single Form Drill-down Inspection Modal ── */}
      {selectedForm && (
        <Modal
          show={selectedFormIndex !== null}
          onHide={() => setSelectedFormIndex(null)}
          size="xl"
          centered
          scrollable
          data-bs-theme={theme}
        >
          <Modal.Header closeButton className="bg-body-tertiary">
            <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2 text-body">
              <span>Form #{selectedForm.id}:</span>
              <span>{selectedForm.name}</span>
              {selectedForm.status === "critical" ? (
                <Badge bg="danger">Critical Errors ({selectedForm.errorCount})</Badge>
              ) : selectedForm.status === "warning" ? (
                <Badge bg="warning" text="dark">Warnings ({selectedForm.warningCount})</Badge>
              ) : (
                <Badge bg="success">Passed All Checks</Badge>
              )}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-3">
            <Tabs
              activeKey={activeInspectTab}
              onSelect={(k) => setActiveInspectTab(k || "validation")}
              className="mb-3"
            >
              <Tab eventKey="validation" title={`Validation & QC (${selectedForm.validationIssues?.length || 0})`}>
                <ValidationSection
                  validationIssues={selectedForm.validationIssues || []}
                  parsingSteps={selectedForm.parsingSteps || []}
                  onFixIssue={handleFixSingleFormIssue}
                  onFixAll={handleFixAllInSelectedForm}
                  theme={theme}
                />
              </Tab>

              <Tab eventKey="fields" title={`Fields Catalog (${selectedForm.labels?.length || 0})`}>
                <div className="table-responsive" style={{ maxHeight: "450px" }}>
                  <Table hover size="sm" className="mb-0">
                    <thead className={theme === "dark" ? "table-dark sticky-top" : "table-light sticky-top"}>
                      <tr>
                        <th>#</th>
                        <th>Label</th>
                        <th>Key</th>
                        <th>Type</th>
                        <th>Format / Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedForm.labels || []).map((field, idx) => (
                        <tr key={idx}>
                          <td className="text-body-secondary small">{idx + 1}</td>
                          <td className="fw-medium text-body">{field.type === "panel" ? field.title : field.label}</td>
                          <td>
                            <code>{field.key}</code>
                          </td>
                          <td>
                            <Badge bg="secondary" className="bg-opacity-50 text-body">
                              {field.multiple ? "multiselect" : field.type}
                            </Badge>
                          </td>
                          <td className="small text-body-secondary">
                            {field.format || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey="conditions" title={`Conditions (${selectedForm.conditions?.length || 0})`}>
                {selectedForm.conditions?.length === 0 ? (
                  <div className="text-center py-4 text-body-secondary border rounded bg-body-tertiary">
                    No conditional logic defined in this form.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {selectedForm.conditions.map((cond, idx) => (
                      <Card key={idx} className="border bg-body-tertiary">
                        <Card.Body className="p-3 small">
                          <div className="fw-bold mb-1 text-body">Field: {cond.label} (<code>{cond.key}</code>)</div>
                          {cond.conditions?.map((c, ci) => (
                            <div key={ci} className="text-body-secondary font-monospace">
                              Show when <code>{c.when}</code> == <code>"{c.eq}"</code>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Tab>

              <Tab eventKey="raw" title="Raw Form JSON">
                <Form.Control
                  as="textarea"
                  rows={14}
                  readOnly
                  value={
                    typeof selectedForm.fullParsedJson === "object" && selectedForm.fullParsedJson !== null
                      ? JSON.stringify(selectedForm.fullParsedJson, null, 2)
                      : selectedForm.rawContent
                  }
                  className="font-monospace small bg-dark text-light"
                />
              </Tab>
            </Tabs>
          </Modal.Body>

          <Modal.Footer className="bg-body-tertiary d-flex justify-content-between">
            <Button
              variant="outline-success"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={handleFixAllInSelectedForm}
              disabled={!selectedForm.validationIssues?.some((i) => i.expected && i.path)}
            >
              <LightningChargeFill /> Auto-Fix This Form
            </Button>

            <Button variant="secondary" size="sm" onClick={() => setSelectedFormIndex(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}
