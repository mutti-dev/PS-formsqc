import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner, Nav, Tab } from "react-bootstrap";
import { compareFormsData, getJsonDiff, getComparisonSummary } from "../utils/formComparatorUtil";
import DiffViewer from "../common/DiffViewer";
import LineNumberedInput from "../common/LineNumberedInput";


export default function FormComparator({ theme }) {
  const [sandboxJson, setSandboxJson] = useState("");
  const [prodJson, setProdJson] = useState("");
  const [similar, setSimilar] = useState([]);
  const [missing, setMissing] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [diffLines, setDiffLines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("detailed");



  const compareForms = async () => {
    if (!sandboxJson.trim() || !prodJson.trim()) {
      setError("Please fill both JSON inputs!");
      return;
    }

    setIsComparing(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const sandboxObj = JSON.parse(sandboxJson);
      const prodObj = JSON.parse(prodJson);

      // Get detailed line-by-line diff
      const diff = getJsonDiff(sandboxObj, prodObj);
      const stats = getComparisonSummary(
        diff.filter((d) => d.type !== "same")
      );

      // Also get field-level comparison for legacy view
      const { similar, missing, warnings } = compareFormsData(sandboxObj, prodObj);

      setSimilar(similar);
      setMissing(missing);
      setWarnings(warnings);
      setDiffLines(diff);
      setSummary(stats);
      setHasResults(true);
    } catch (e) {
      setError("Invalid JSON format! Please check your input.");
    }

    setIsComparing(false);
  };


  const clearAll = () => {
    setSandboxJson("");
    setProdJson("");
    setSimilar([]);
    setMissing([]);
    setWarnings([]);
    setDiffLines([]);
    setSummary(null);
    setHasResults(false);
    setError("");
    setActiveTab("detailed");
  };

  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col xxl={10} xl={12} lg={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="border-0 py-4">
              <div className="text-center">
                <h1 className="display-5 fw-bold text-primary mb-2">Form Comparator</h1>

              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              )}

              <Row className="g-4 mb-4">
                <Col lg={6}>
                  <Card className="h-100 border">
                    <Card.Header className="bg-warning bg-opacity-10 border-bottom">
                      <div className="d-flex align-items-center">
                        <Badge bg="warning" className="mb-0 fs-5 fw-semibold">Sandbox JSON</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <LineNumberedInput
                        value={sandboxJson}
                        onChange={(e) => setSandboxJson(e.target.value)}
                        placeholder="Paste your Sandbox JSON here..."
                        rows={10}
                        theme={theme}
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card className="h-100 border">
                    <Card.Header className="bg-success bg-opacity-10 border-bottom">
                      <div className="d-flex align-items-center">
                        <Badge bg="success" className="mb-0 fs-5 fw-semibold">Production JSON</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <LineNumberedInput
                        value={prodJson}
                        onChange={(e) => setProdJson(e.target.value)}
                        placeholder="Paste your Production JSON here..."
                        rows={10}
                        theme={theme}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex justify-content-center gap-3 mb-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={compareForms}
                  disabled={isComparing}
                  className="px-4"
                >
                  {isComparing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Comparing...
                    </>
                  ) : (
                    "Compare Forms"
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={clearAll}
                  className="px-4"
                >
                  Clear All
                </Button>
              </div>

              {hasResults && (
                <>
                  {/* Summary Cards */}
                  <Card className="border mb-4">
                    <Card.Header className="bg-gradient">
                      <Card.Title className="mb-0 fs-5 fw-semibold">Comparison Summary</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Row className="text-center">
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-6 fw-bold text-success mb-2">{summary.added}</div>
                            <div className="fs-6 fw-medium text-muted">Lines Added</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-6 fw-bold text-danger mb-2">{summary.removed}</div>
                            <div className="fs-6 fw-medium text-muted">Lines Removed</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-6 fw-bold text-warning mb-2">{summary.modified}</div>
                            <div className="fs-6 fw-medium text-muted">Lines Modified</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-6 fw-bold text-info mb-2">{summary.total}</div>
                            <div className="fs-6 fw-medium text-muted">Total Changes</div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Tabbed Results */}
                  <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Card className="border">
                      <Card.Header className="border-0 p-0">
                        <Nav variant="tabs" className="border-bottom-0">
                          <Nav.Item>
                            <Nav.Link eventKey="detailed" className="rounded-top-3">
                              Detailed Line Diff
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey="fields" className="rounded-top-3">
                              Field Comparison
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <Tab.Content>
                          <Tab.Pane eventKey="detailed">
                            <div className="p-3">
                              <DiffViewer 
                                differences={diffLines.filter(d => d.type !== 'same')} 
                                summary={summary}
                                theme={theme}
                              />
                            </div>
                          </Tab.Pane>
                          <Tab.Pane eventKey="fields">
                            <div className="p-3">
                              <Row className="g-4">
                                <Col md={4}>
                                  <Card className="border-0 h-100">
                                    <Card.Header className="bg-success text-white">
                                      <Card.Title className="mb-0 fs-6 fw-semibold">Matching Fields</Card.Title>
                                      <small>Fields that are identical in both environments</small>
                                    </Card.Header>
                                    <Card.Body className="overflow-auto" style={{ maxHeight: "300px" }}>
                                      {similar.length === 0 ? (
                                        <p className="text-muted text-center mb-0">No matching fields found</p>
                                      ) : (
                                        <div className="d-flex flex-column gap-2">
                                          {similar.map((item, i) => (
                                            <div key={i} className="p-3 border rounded bg-success bg-opacity-10">
                                              <div className="fw-semibold text-truncate">{item.key}</div>
                                              {item.label && (
                                                <small className="text-muted">"{item.label}"</small>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </Card.Body>
                                  </Card>
                                </Col>

                                <Col md={4}>
                                  <Card className="border-0 h-100">
                                    <Card.Header className="bg-danger text-white">
                                      <Card.Title className="mb-0 fs-6 fw-semibold">Missing Fields</Card.Title>
                                      <small>Fields present in one environment only</small>
                                    </Card.Header>
                                    <Card.Body className="overflow-auto" style={{ maxHeight: "300px" }}>
                                      {missing.length === 0 ? (
                                        <p className="text-muted text-center mb-0">No missing fields found</p>
                                      ) : (
                                        <div className="d-flex flex-column gap-2">
                                          {missing.map((item, i) => (
                                            <div key={i} className="p-3 border rounded bg-danger bg-opacity-10">
                                              <Badge bg={item.type === 'Missing in Sandbox' ? 'warning' : 'info'} className="mb-2">
                                                {item.type}
                                              </Badge>
                                              <div className="fw-semibold text-truncate">{item.key}</div>
                                              {item.label && (
                                                <small className="text-muted">"{item.label}"</small>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </Card.Body>
                                  </Card>
                                </Col>

                                <Col md={4}>
                                  <Card className="border-0 h-100">
                                    <Card.Header className="bg-warning text-dark">
                                      <Card.Title className="mb-0 fs-6 fw-semibold">Label Changes</Card.Title>
                                      <small>Fields with different labels</small>
                                    </Card.Header>
                                    <Card.Body className="overflow-auto" style={{ maxHeight: "300px" }}>
                                      {warnings.length === 0 ? (
                                        <p className="text-muted text-center mb-0">No label differences found</p>
                                      ) : (
                                        <div className="d-flex flex-column gap-2">
                                          {warnings.map((item, i) => (
                                            <div key={i} className="p-3 border rounded bg-warning bg-opacity-10">
                                              <div className="fw-semibold text-truncate mb-2">{item.key}</div>
                                              <div className="d-flex flex-column gap-1">
                                                <div className="d-flex align-items-center gap-2">
                                                  <Badge bg="success">PROD</Badge>
                                                  <small className="text-truncate">"{item.prodLabel}"</small>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                  <Badge bg="warning" text="dark">SBX</Badge>
                                                  <small className="text-truncate">"{item.sandboxLabel}"</small>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </Card.Body>
                                  </Card>
                                </Col>
                              </Row>
                            </div>
                          </Tab.Pane>
                        </Tab.Content>
                      </Card.Body>
                    </Card>
                  </Tab.Container>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}