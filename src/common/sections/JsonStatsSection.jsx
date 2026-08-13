
import React, { useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
} from "react-bootstrap";

import CollapsibleSection from "../CollapsibleSection";

const SKIPPED_TYPES = new Set(["content", "column", "columns", "panel"]);

const isSkippedType = (type) => {
  if (!type) return true;
  return SKIPPED_TYPES.has(String(type).toLowerCase().trim());
};

const getComponentDisplayType = (entry) => {
  if (!entry || !entry.type) return "unknown";
  if (entry.type === "select") {
    return entry.multiple === true ? "multiselect" : "select";
  }
  return entry.type;
};

function JsonStatsSection({ jsonStats, labels = [], searchResults }) {
  const componentCounts = useMemo(() => {
    const counts = {};
    (labels || []).forEach((entry) => {
      if (isSkippedType(entry.type)) return;
      const typeName = getComponentDisplayType(entry);
      counts[typeName] = (counts[typeName] || 0) + 1;
    });
    return counts;
  }, [labels]);

  const totalComponentsCount = useMemo(() => {
    return Object.values(componentCounts).reduce((sum, count) => sum + count, 0);
  }, [componentCounts]);

  const sortedComponentEntries = useMemo(() => {
    return Object.entries(componentCounts).sort((a, b) => b[1] - a[1]);
  }, [componentCounts]);

  if (!jsonStats) return null;

  return (
    <CollapsibleSection
      title="JSON Statistics"
      count={`${jsonStats.totalElements} elements`}
      defaultOpen={false}
    >
      

      {/* Component Usage Statistics */}
      <Card className="mt-3 border">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0 fs-6 fw-semibold">
            Component Usage Statistics
          </Card.Title>
          <Badge bg="primary" pill>
            {totalComponentsCount} {totalComponentsCount === 1 ? "component" : "components"}
          </Badge>
        </Card.Header>
        <Card.Body>
          {sortedComponentEntries.length === 0 ? (
            <div className="text-muted text-center py-2">
              No matching components found
            </div>
          ) : (
            <Row className="g-2">
              {sortedComponentEntries.map(([type, count]) => (
                <Col key={type} xs={6} sm={4} md={3} lg={2}>
                  <div className="p-2 border rounded text-center bg-body-secondary h-100">
                    <div className="fs-4 fw-bold text-primary">{count}</div>
                    <div className="small text-muted text-break">{type}</div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

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