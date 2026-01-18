
import {
  Row,
  Col,
  Card,
  Badge,
 
} from "react-bootstrap";

import CollapsibleSection from "../CollapsibleSection";

function JsonStatsSection({ jsonStats, searchResults }) {
  if (!jsonStats) return null;

  return (
    <CollapsibleSection
      title="JSON Statistics"
      count={`${jsonStats.totalElements} elements`}
      defaultOpen={false}
    >
      <Row className="text-center">
        <Col md={3}>
          <div className="p-3">
            <div className="display-6 fw-bold text-primary mb-2">
              {jsonStats.totalElements}
            </div>
            <div className="fs-6 fw-medium text-muted">Total Elements</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3">
            <div className="display-6 fw-bold text-success mb-2">
              {jsonStats.uniqueKeys}
            </div>
            <div className="fs-6 fw-medium text-muted">Unique Keys</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3">
            <div className="display-6 fw-bold text-info mb-2">
              {jsonStats.depth}
            </div>
            <div className="fs-6 fw-medium text-muted">JSON Depth</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3">
            <div className="display-6 fw-bold text-warning mb-2">
              {jsonStats.isArray ? "Array" : "Object"}
            </div>
            <div className="fs-6 fw-medium text-muted">Structure Type</div>
          </div>
        </Col>
      </Row>

      {searchResults && searchResults.length > 0 && (
        <Card className="mt-3 border">
          <Card.Header className="">
            <Card.Title className="mb-0 fs-6 fw-semibold">
              Key Search Results
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="row g-2">
              {searchResults.map((result, idx) => (
                <div key={idx} className="col-md-6">
                  <div
                    className={`p-2 border rounded ${
                      result.found
                        ? "bg-success bg-opacity-10"
                        : "bg-danger bg-opacity-10"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <code className="fw-semibold">{result.key}</code>
                      <Badge bg={result.found ? "success" : "danger"}>
                        {result.found ? "Found" : "Not Found"}
                      </Badge>
                    </div>
                    {result.found && (
                      <div className="mt-1">
                        <small className="text-muted">
                          Path: {result.path}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </CollapsibleSection>
  );
}


export default JsonStatsSection;