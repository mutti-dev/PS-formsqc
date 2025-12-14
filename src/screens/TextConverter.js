import React, { useState } from "react";
import { copyToClipboard, convertText, limitText } from "../utils/utils";
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";

const TextConverter = () => {
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleConvert = () => {
    if (!inputText.trim()) {
      setAlertMessage("Please enter some text to convert");
      setShowAlert(true);
      return;
    }
    
    const converted = convertText(inputText);
    setConvertedText(converted);
    
    copyToClipboard(converted);
    setAlertMessage("Text converted and copied to clipboard!");
    setShowAlert(true);
    
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleLimited = () => {
    if (!inputText.trim()) {
      setAlertMessage("Please enter some text to limit");
      setShowAlert(true);
      return;
    }
    
    const converted = limitText(inputText, 110);
    setConvertedText(converted);
    
    copyToClipboard(converted);
    setAlertMessage("Limited text copied to clipboard!");
    setShowAlert(true);
    
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleCopyResult = () => {
    if (convertedText) {
      copyToClipboard(convertedText);
      setAlertMessage("Converted text copied to clipboard!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  return (
    <Container fluid className="min-vh-100">
      <Card className="shadow-sm border-0">
        <Card.Header className=" border-0 py-3">
         <h1 className="display-5 fw-bold text-primary mb-2 text-center">API Key</h1>
        </Card.Header>
        <Card.Body>
          {showAlert && (
            <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
              {alertMessage}
            </Alert>
          )}
          
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="inputText">
                <Form.Label className="fw-medium">Input Text</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text here..."
                  className="mb-2"
                />
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Character count: <Badge bg="secondary">{inputText.length}</Badge>
                  </small>
                  {inputText.length > 110 && (
                    <Badge bg="warning" text="dark">
                      Exceeds 110 characters
                    </Badge>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant="primary" 
                  onClick={handleConvert}
                  disabled={!inputText.trim()}
                >
                  Convert Text
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={handleLimited}
                  disabled={!inputText.trim()}
                >
                  Limit to 110 Characters
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setInputText("")}
                  disabled={!inputText.trim()}
                >
                  Clear Input
                </Button>
              </div>
            </Col>
          </Row>

          {convertedText && (
            <Row>
              <Col>
                <Card className="border">
                  <Card.Header className=" d-flex justify-content-between align-items-center py-2">
                    <Card.Title className="mb-0 fs-6 fw-semibold">Converted Result</Card.Title>
                    <div className="d-flex gap-2 align-items-center">
                      <small className="text-muted">
                        Length: <Badge bg="info">{convertedText.length}</Badge>
                      </small>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={handleCopyResult}
                      >
                        Copy
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <div className=" p-3 rounded font-monospace">
                      {convertedText}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TextConverter;