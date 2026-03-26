import React, { useState } from "react";
import { Card, Badge, Button, Row, Col } from "react-bootstrap";
import "./DiffViewer.css";

export default function DiffViewer({ differences, summary, theme = 'dark' }) {
  const [viewMode, setViewMode] = useState("unified"); // unified or side-by-side

  if (!differences || differences.length === 0) {
    return (
      <Card className="border">
        <Card.Header>
          <Card.Title className="mb-0 fs-5 fw-semibold">
            Detailed Comparison
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <p className="text-center text-muted mb-0">No differences found!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0 fs-5 fw-semibold">
          Detailed Line Comparison
        </Card.Title>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "unified" ? "primary" : "outline-primary"}
            onClick={() => setViewMode("unified")}
          >
            Unified
          </Button>
          <Button
            size="sm"
            variant={viewMode === "side-by-side" ? "primary" : "outline-primary"}
            onClick={() => setViewMode("side-by-side")}
          >
            Side by Side
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {/* Summary Stats */}
        {summary && (
          <div className="d-flex gap-3 p-3 border-bottom">
            {summary.added > 0 && (
              <div className="d-flex align-items-center gap-2">
                <Badge bg="success">+{summary.added}</Badge>
                <span className="text-muted small">Added</span>
              </div>
            )}
            {summary.removed > 0 && (
              <div className="d-flex align-items-center gap-2">
                <Badge bg="danger">-{summary.removed}</Badge>
                <span className="text-muted small">Removed</span>
              </div>
            )}
            {summary.modified > 0 && (
              <div className="d-flex align-items-center gap-2">
                <Badge bg="warning">~{summary.modified}</Badge>
                <span className="text-muted small">Modified</span>
              </div>
            )}
          </div>
        )}

        {/* Diff Content */}
        <div className={`diff-viewer theme-${theme}`}>
          {viewMode === "unified" ? (
            <UnifiedDiff differences={differences} />
          ) : (
            <SideBySideDiff differences={differences} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function UnifiedDiff({ differences }) {
  return (
    <div className="font-monospace small">
      {differences.map((diff, idx) => (
        <div key={idx} className={`diff-line diff-${diff.type}`}>
          <span className="line-num">{String(diff.lineNum).padStart(4)}</span>
          <span className="diff-marker">
            {diff.type === "added" && "+"}
            {diff.type === "removed" && "-"}
            {diff.type === "modified" && "~"}
            {diff.type === "same" && " "}
          </span>
          <span className="diff-content">
            {diff.type === "modified" ? (
              <>
                <span className="removed-text">{diff.oldContent}</span>
                <br />
                <span className="added-text">{diff.content}</span>
              </>
            ) : diff.content ? (
              diff.content
            ) : (
              diff.oldContent
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function SideBySideDiff({ differences }) {
  return (
    <Row className="g-0">
      <Col className="border-end" style={{ maxHeight: "600px", overflow: "auto" }}>
        <div className="p-2 border-bottom sticky-top">
          <strong>Sandbox (SBX)</strong>
        </div>
        <div className="font-monospace small">
          {differences.map((diff, idx) => (
            (diff.type === "removed" || diff.type === "modified" || diff.type === "same") && (
              <div
                key={`sbx-${idx}`}
                className={`diff-line-side ${
                  diff.type === "removed"
                    ? "diff-removed"
                    : diff.type === "modified"
                    ? "diff-modified"
                    : ""
                }`}
              >
                <span className="line-num">{String(diff.lineNum).padStart(4)}</span>
                <span className="diff-content px-2">
                  {diff.type === "modified" ? diff.oldContent : diff.content}
                </span>
              </div>
            )
          ))}
        </div>
      </Col>
      <Col className="" style={{ maxHeight: "600px", overflow: "auto" }}>
        <div className="p-2 border-bottom sticky-top">
          <strong>Production (PROD)</strong>
        </div>
        <div className="font-monospace small">
          {differences.map((diff, idx) => (
            (diff.type === "added" || diff.type === "modified" || diff.type === "same") && (
              <div
                key={`prod-${idx}`}
                className={`diff-line-side ${
                  diff.type === "added"
                    ? "diff-added"
                    : diff.type === "modified"
                    ? "diff-modified"
                    : ""
                }`}
              >
                <span className="line-num">{String(diff.lineNum).padStart(4)}</span>
                <span className="diff-content px-2">
                  {diff.type === "modified" ? diff.content : diff.content}
                </span>
              </div>
            )
          ))}
        </div>
      </Col>
    </Row>
  );
}
