import React, { useState } from "react";

import {
 
  Card,
  Badge,
  Collapse,
 
} from "react-bootstrap";



function CollapsibleSection({ title, count, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-3 border">
      <Card.Header
        className="bg-dark cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">{isOpen ? "▼" : "▶"}</span>
            <Card.Title className="mb-0 fs-6 fw-semibold">{title}</Card.Title>
          </div>
          {count !== undefined && <Badge bg="secondary">{count}</Badge>}
        </div>
      </Card.Header>
      <Collapse in={isOpen}>
        <Card.Body>{children}</Card.Body>
      </Collapse>
    </Card>
  );
}

export default CollapsibleSection;