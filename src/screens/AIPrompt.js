import React, { useState } from "react";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { ClipboardCheck, Clipboard } from "react-bootstrap-icons";

import { AI_PROMPT_TEXT as PROMPT } from "../config/aiPrompt";




export default function AIPrompt() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Container fluid className="min-vh-100">
      {/* Page header */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="py-4">
          <h1 className="display-5 fw-bold text-center text-primary mb-1">
            AI Prompt — Excel Generator
          </h1>
          <p className="text-center text-muted mb-0">
            Copy this prompt, open any AI (Claude, ChatGPT, etc.), attach your PDF or Word form, and paste.
            The AI will produce an Excel file you can import directly in <strong>Form Review</strong>.
          </p>
        </Card.Header>
      </Card>

      {/* How to use */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header>
          <h5 className="fw-semibold mb-0">How to use</h5>
        </Card.Header>
        <Card.Body>
          <ol className="mb-0" style={{ lineHeight: "2" }}>
            <li>Click <strong>Copy Prompt</strong> below.</li>
            <li>Open your AI tool and start a new chat.</li>
            <li>Attach your <strong>PDF or Word</strong> form document.</li>
            <li>Paste the prompt and send.</li>
            <li>Download the <code>.xlsx</code> file the AI produces.</li>
            <li>Go to <strong>Form Review</strong> and click <strong>Import from Excel</strong>.</li>
          </ol>
        </Card.Body>
      </Card>

      {/* Prompt box */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="fw-semibold mb-0">Prompt</h5>
          <Button
            variant={copied ? "success" : "primary"}
            onClick={handleCopy}
            className="d-flex align-items-center gap-2"
          >
            {copied ? (
              <><ClipboardCheck size={16} /> Copied!</>
            ) : (
              <><Clipboard size={16} /> Copy Prompt</>
            )}
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <pre
            className="mb-0 p-4 font-monospace"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.85rem",
              borderRadius: "0 0 0.375rem 0.375rem",
            }}
          >
            {PROMPT}
          </pre>
        </Card.Body>
      </Card>

      {/* Type reference */}
      

      {/* Excel format reference */}
      

      {copied && (
        <Alert
          variant="success"
          className="position-fixed bottom-0 end-0 m-3"
          style={{ zIndex: 9999, width: "260px" }}
        >
          <ClipboardCheck className="me-2" />
          Prompt copied to clipboard!
        </Alert>
      )}

    </Container>
  );
}
