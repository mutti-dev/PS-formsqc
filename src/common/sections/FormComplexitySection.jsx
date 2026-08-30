import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Table,
  Button,
  Modal,
} from "react-bootstrap";
import {
  Speedometer2,
  FileEarmarkText,
  Calculator,
  Grid3x3Gap,
  InfoCircle,
  FileText,
  Layers,
  LightningCharge,
} from "react-bootstrap-icons";
import CollapsibleSection from "../CollapsibleSection";

export default function FormComplexitySection({ formComplexity, theme = "dark" }) {
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  if (!formComplexity) return null;

  const {
    totalWeight = 0,
    equivalentPages = 0,
    totalDataFields = 0,
    contentSectionsCount = 0,
    estimatedContentPages = 0,
    breakdown = [],
    datagrids = [],
    pageBrackets = { brackets: [] },
  } = formComplexity;

  const datagridTotalWeight = datagrids.reduce((sum, g) => sum + (g.totalWeight || 0), 0);
  const totalDatagridFields = datagrids.reduce((sum, g) => sum + (g.internalCount || 0), 0);

  return (
    <CollapsibleSection
      title="Form Complexity & Page Estimation"
      count={`${equivalentPages} ${equivalentPages === 1 ? "Page" : "Pages"} (${totalWeight} pts)`}
      defaultOpen={false}
    >
      {/* ── KPI Summary Cards ── */}
      <Row className="g-3 mb-4">
        {/* Estimated Pages Card */}
        <Col xs={12} sm={6} lg={3}>
          <div
            className="p-3 rounded border h-100 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(13, 110, 253, 0.12) 0%, rgba(111, 66, 193, 0.12) 100%)",
              borderColor: "rgba(13, 110, 253, 0.3)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small fw-semibold text-uppercase tracking-wide">
                  Equivalent Pages
                </div>
                <div className="fs-2 fw-bold text-primary my-1">
                  {equivalentPages} <span className="fs-6 fw-normal text-muted">{equivalentPages === 1 ? "Page" : "Pages"}</span>
                </div>
              </div>
              <div
                className="p-2 rounded-circle bg-primary bg-opacity-25 text-primary d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <FileEarmarkText size={22} />
              </div>
            </div>
            <div className="small text-muted mt-2 d-flex align-items-center gap-1">
              <Badge bg="primary" className="fw-semibold">
                Weight {totalWeight} pts
              </Badge>
              <span>(Bracket: {pageBrackets.brackets?.find((b) => b.isCurrent)?.rangeLabel || "0"})</span>
            </div>
          </div>
        </Col>

        {/* Total Field Weight Card */}
        <Col xs={12} sm={6} lg={3}>
          <div
            className="p-3 rounded border h-100 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(25, 135, 84, 0.12) 0%, rgba(32, 201, 151, 0.12) 100%)",
              borderColor: "rgba(25, 135, 84, 0.3)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small fw-semibold text-uppercase tracking-wide">
                  Total Field Weight
                </div>
                <div className="fs-2 fw-bold text-success my-1">
                  {totalWeight} <span className="fs-6 fw-normal text-muted">pts</span>
                </div>
              </div>
              <div
                className="p-2 rounded-circle bg-success bg-opacity-25 text-success d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <Speedometer2 size={22} />
              </div>
            </div>
            <div className="small text-muted mt-2">
              Sum of data field complexity weights
            </div>
          </div>
        </Col>

        {/* Total Data Capture Fields Card */}
        <Col xs={12} sm={6} lg={3}>
          <div
            className="p-3 rounded border h-100 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(13, 202, 240, 0.12) 0%, rgba(13, 110, 253, 0.12) 100%)",
              borderColor: "rgba(13, 202, 240, 0.3)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small fw-semibold text-uppercase tracking-wide">
                  Data Capture Fields
                </div>
                <div className="fs-2 fw-bold text-info my-1">
                  {totalDataFields} <span className="fs-6 fw-normal text-muted">fields</span>
                </div>
              </div>
              <div
                className="p-2 rounded-circle bg-info bg-opacity-25 text-info d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <Layers size={22} />
              </div>
            </div>
            <div className="small text-muted mt-2">
              Excludes layout components (panels/columns)
            </div>
          </div>
        </Col>

        {/* Datagrid & Content Summary Card */}
        <Col xs={12} sm={6} lg={3}>
          <div
            className="p-3 rounded border h-100 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(253, 126, 20, 0.12) 100%)",
              borderColor: "rgba(255, 193, 7, 0.3)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small fw-semibold text-uppercase tracking-wide">
                  Datagrids & Content
                </div>
                <div className="fs-4 fw-bold text-warning my-1">
                  {datagrids.length} <span className="fs-6 fw-normal text-muted">grid(s) ({datagridTotalWeight} pts)</span>
                </div>
              </div>
              <div
                className="p-2 rounded-circle bg-warning bg-opacity-25 text-warning d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <Grid3x3Gap size={20} />
              </div>
            </div>
            <div className="small text-muted mt-2 d-flex justify-content-between align-items-center">
              <span>{totalDatagridFields} inner fields (×2)</span>
              {contentSectionsCount > 0 && (
                <Badge bg="secondary">{contentSectionsCount} content</Badge>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Action & Standard Info Bar ── */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold fs-6">Field Complexity Breakdown</span>
          <Badge bg="primary" pill>
            {breakdown.length} {breakdown.length === 1 ? "category" : "categories"}
          </Badge>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          className="d-flex align-items-center gap-1"
          onClick={() => setShowStandardModal(true)}
        >
          <InfoCircle size={15} /> View Estimation Standard
        </Button>
      </div>

      {/* ── Breakdown Table ── */}
      <div className="table-responsive border rounded mb-3">
        <Table hover striped className="mb-0 align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "35%" }}>Field Type</th>
              <th className="text-center" style={{ width: "15%" }}>Count</th>
              <th className="text-center" style={{ width: "20%" }}>Weight Multiplier</th>
              <th className="text-center" style={{ width: "20%" }}>Total Weight</th>
              <th className="text-center" style={{ width: "10%" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-3 text-muted">
                  No data capture fields found for estimation
                </td>
              </tr>
            ) : (
              breakdown.map((item, idx) => {
                const isExpanded = expandedRow === item.key;
                return (
                  <React.Fragment key={item.key || idx}>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {item.isDatagrid ? (
                            <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                              <Grid3x3Gap size={12} /> Datagrid
                            </Badge>
                          ) : item.key === "calculated" ? (
                            <Badge bg="danger" className="d-flex align-items-center gap-1">
                              <Calculator size={12} /> Calculated
                            </Badge>
                          ) : item.key === "file" ? (
                            <Badge bg="info" className="d-flex align-items-center gap-1">
                              <FileText size={12} /> File
                            </Badge>
                          ) : item.key === "autopopulation" ? (
                            <Badge bg="secondary" className="d-flex align-items-center gap-1">
                              <LightningCharge size={12} /> Auto
                            </Badge>
                          ) : (
                            <Badge bg="secondary">{item.key}</Badge>
                          )}
                          <span className="fw-semibold">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-center fw-bold">{item.count}</td>
                      <td className="text-center">
                        <span className="badge bg-body-secondary text-body border px-2 py-1 font-monospace">
                          {item.unitWeightLabel}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="fw-bold fs-6 text-primary">{item.totalWeight}</span>
                      </td>
                      <td className="text-center">
                        {item.fields && item.fields.length > 0 ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                            onClick={() => setExpandedRow(isExpanded ? null : item.key)}
                          >
                            {isExpanded ? "Hide" : `View (${item.fields.length})`}
                          </Button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && item.fields && item.fields.length > 0 && (
                      <tr className="bg-body-tertiary">
                        <td colSpan={5} className="p-3">
                          <div className="small fw-semibold text-muted mb-2">
                            Included Fields ({item.fields.length}):
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {item.fields.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="badge bg-body-secondary text-body border p-2 text-start font-monospace"
                                style={{ fontSize: "0.78rem" }}
                              >
                                <strong>{f.label}</strong>{" "}
                                <span className="text-muted">({f.key || "no key"})</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
          <tfoot className="table-group-divider bg-body-secondary">
            <tr className="fw-bold">
              <td>Total Effort Estimation</td>
              <td className="text-center">{totalDataFields} fields</td>
              <td className="text-center text-muted">-</td>
              <td className="text-center text-primary fs-6">{totalWeight} pts</td>
              <td className="text-center">
                <Badge bg="success" className="px-2 py-1">
                  {equivalentPages} {equivalentPages === 1 ? "Page" : "Pages"}
                </Badge>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>

      {/* ── Content Sections Notice (if any) ── */}
      {contentSectionsCount > 0 && (
        <div className="p-3 rounded border mb-3 bg-body-tertiary">
          <div className="d-flex align-items-center gap-2 mb-1">
            <FileText className="text-info fs-5" />
            <span className="fw-semibold">Content Sections ({contentSectionsCount})</span>
            <Badge bg="info">Estimated: +{estimatedContentPages} page(s)</Badge>
          </div>
          <div className="small text-muted">
            Per standard specification, layout components (panels, columns) are excluded from field weight, while content sections that span pages are estimated separately.
          </div>
        </div>
      )}

      {/* ── Standard Reference Modal ── */}
      <Modal
        show={showStandardModal}
        onHide={() => setShowStandardModal(false)}
        size="lg"
        centered
        data-bs-theme={theme}
      >
        <Modal.Header closeButton className="bg-body-tertiary border-bottom py-3">
          <Modal.Title className="d-flex align-items-center gap-2 fw-bold text-primary">
            <FileEarmarkText className="fs-4" /> Form Complexity and Estimation Standard
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="mb-4">
            <h6 className="fw-bold text-primary">1. Field-Based Estimation Model</h6>
            <p className="small text-body-secondary mb-2">
              Each form field type is assigned a predefined complexity weight. The total implementation effort is calculated by summing the complexity weights of all data capture fields.
            </p>
            <ul className="small text-body-secondary mb-0">
              <li><strong>Layout Components</strong> (panels, columns, containers, buttons) are excluded from field complexity.</li>
              <li><strong>Datagrid Internal Fields</strong> are multiplied by a weight of <strong>2</strong> (e.g. 4 fields = 8 total weight).</li>
              <li><strong>Calculated Fields</strong> carry a weight of <strong>3</strong>.</li>
              <li><strong>Content Sections</strong> are estimated separately based on length (1 page = 1 page equivalent).</li>
            </ul>
          </div>

          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="h-100 border">
                <Card.Header className="py-2 bg-body-tertiary fw-semibold small">
                  Standard Field Weights
                </Card.Header>
                <Card.Body className="p-0">
                  <Table size="sm" striped className="mb-0 small">
                    <thead>
                      <tr>
                        <th>Field Type</th>
                        <th className="text-end">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Text Field</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Number Field</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Email Field</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Signature</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Date / Time</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Select Dropdown</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Radio Button</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Checkbox</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>Text Area</td><td className="text-end fw-bold">1</td></tr>
                      <tr><td>File Upload</td><td className="text-end fw-bold text-primary">2</td></tr>
                      <tr><td>Datagrid Fields</td><td className="text-end fw-bold text-warning">× 2</td></tr>
                      <tr><td>Calculated Field</td><td className="text-end fw-bold text-danger">3</td></tr>
                      <tr><td>Auto-population Field</td><td className="text-end fw-bold">1</td></tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="h-100 border">
                <Card.Header className="py-2 bg-body-tertiary fw-semibold small">
                  Form-to-Page Mapping Standard
                </Card.Header>
                <Card.Body className="p-0">
                  <Table size="sm" striped className="mb-0 small">
                    <thead>
                      <tr>
                        <th>Total Field Weight</th>
                        <th className="text-end">Equivalent Pages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pageBrackets.brackets || []).map((b) => (
                        <tr key={b.pages} className={b.isCurrent ? "table-primary fw-bold" : ""}>
                          <td>
                            {b.rangeLabel} pts {b.isCurrent && <Badge bg="primary" className="ms-1">Current Form</Badge>}
                          </td>
                          <td className="text-end">{b.pageLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-body-tertiary border-top py-2">
          <Button variant="secondary" onClick={() => setShowStandardModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </CollapsibleSection>
  );
}
