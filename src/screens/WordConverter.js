import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
  Table,
  InputGroup,
} from "react-bootstrap";

export default function WordConverter() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const convertWord = (word) => {
    const value = word.replace(/[\s]+/g, "_").replace(/[^A-Za-z_]/g, "");
    return { label: word, value };
  };

  const convertWords = () => {
    if (!inputText.trim()) {
      setAlertMessage("Please enter some text to convert");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const words = inputText
      .split(/\r?\n/)
      .map((w) => w.trim())
      .filter((w) => w);

    if (words.length === 0) {
      setAlertMessage("No valid words found");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const converted = words.map((word) => convertWord(word));
    setResult(converted);
  };

  const copyToClipboard = (format = "json") => {
    if (result.length === 0) {
      setAlertMessage("No results to copy");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    let textToCopy = "";
    switch (format) {
      case "json":
        textToCopy = JSON.stringify(result, null, 2);
        break;
      case "array":
        textToCopy = JSON.stringify(result);
        break;
      case "csv":
        textToCopy = result
          .map((item) => `${item.label},${item.value}`)
          .join("\n");
        break;
      case "javascript":
        textToCopy = `const dropdownOptions = ${JSON.stringify(
          result,
          null,
          2
        )};`;
        break;
      default:
        textToCopy = JSON.stringify(result, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setAlertMessage(`${format.toUpperCase()} format copied to clipboard!`);
    setShowAlert(true);

    setTimeout(() => {
      setCopied(false);
      setShowAlert(false);
    }, 3000);
  };

  const clearAll = () => {
    setInputText("");
    setResult([]);
    setCopied(false);
    setShowAlert(false);
  };

  const handlePasteExample = () => {
    const example = `Red Apple
Green Banana
Blue Berry
Yellow Mango
Purple Grape`;
    setInputText(example);
  };

  const countValidCharacters = (text) => {
    return text.replace(/[^A-Za-z\s]/g, "").length;
  };

  const countInvalidCharacters = (text) => {
    return text.replace(/[A-Za-z\s]/g, "").length;
  };

  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="border-0 py-4">
              <div className="text-center">
                <h1 className="display-5 fw-bold text-primary mb-2">
                  Word Converter
                </h1>
                <p className="text-muted fs-5">
                  Convert words to dropdown options format
                </p>
              </div>
            </Card.Header>

            <Card.Body>
              {showAlert && (
                <Alert
                  variant={copied ? "success" : "danger"}
                  onClose={() => setShowAlert(false)}
                  dismissible
                >
                  {alertMessage}
                </Alert>
              )}

              <Row className="mb-4">
                <Col>
                  <Card className="border">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <Card.Title className="mb-0 fs-5 fw-semibold">
                        Input Text
                      </Card.Title>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={handlePasteExample}
                        >
                          Example
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={clearAll}
                        >
                          Clear
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter words (one per line)"
                        className="font-monospace"
                      />
                      <div className="mt-2 d-flex justify-content-between">
                        <small className="text-muted">
                          Lines:{" "}
                          <Badge bg="info">
                            {
                              inputText.split(/\r?\n/).filter((w) => w.trim())
                                .length
                            }
                          </Badge>
                        </small>
                        <small className="text-muted">
                          Valid chars:{" "}
                          <Badge bg="success">
                            {countValidCharacters(inputText)}
                          </Badge>
                        </small>
                        <small className="text-muted">
                          Invalid chars:{" "}
                          <Badge bg="danger">
                            {countInvalidCharacters(inputText)}
                          </Badge>
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <div className="d-flex justify-content-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={convertWords}
                      disabled={!inputText.trim()}
                      className="px-4"
                    >
                      Convert Words
                    </Button>
                  </div>
                </Col>
              </Row>

              {result.length > 0 && (
                <>
                  <Card className="border mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <Card.Title className="mb-0 fs-5 fw-semibold">
                        Conversion Results ({result.length} items)
                      </Card.Title>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => copyToClipboard("json")}
                        >
                          Copy JSON
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => copyToClipboard("javascript")}
                        >
                          Copy JS
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Original Word</th>
                              <th>Converted Value</th>
                              <th>Character Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.map((item, index) => (
                              <tr key={index}>
                                <td className="fw-semibold">{index + 1}</td>
                                <td className="fw-medium">{item.label}</td>
                                <td>
                                  <code className="text-primary">
                                    {item.value}
                                  </code>
                                </td>
                                <td>
                                  <Badge bg="info">{item.value.length}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="border mb-4">
                    <Card.Header>
                      <Card.Title className="mb-0 fs-5 fw-semibold">
                        Formatted Output
                      </Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className=" p-3 rounded mb-3">
                        <pre className="mb-0 font-monospace">
                          <code>{JSON.stringify(result, null, 2)}</code>
                        </pre>
                      </div>

                      <div className="d-flex justify-content-center gap-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => copyToClipboard("csv")}
                        >
                          Copy CSV
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => copyToClipboard("array")}
                        >
                          Copy Array
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="border">
                    <Card.Header>
                      <Card.Title className="mb-0 fs-5 fw-semibold">
                        Conversion Summary
                      </Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Row className="text-center">
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-4 fw-bold text-primary mb-2">
                              {result.length}
                            </div>
                            <div className="fs-5 fw-medium text-muted">
                              Total Items
                            </div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-4 fw-bold text-success mb-2">
                              {result.reduce(
                                (acc, item) => acc + item.label.length,
                                0
                              )}
                            </div>
                            <div className="fs-5 fw-medium text-muted">
                              Input Characters
                            </div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-4 fw-bold text-info mb-2">
                              {result.reduce(
                                (acc, item) => acc + item.value.length,
                                0
                              )}
                            </div>
                            <div className="fs-5 fw-medium text-muted">
                              Output Characters
                            </div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="p-3">
                            <div className="display-4 fw-bold text-warning mb-2">
                              {Math.round(
                                (result.reduce(
                                  (acc, item) => acc + item.value.length,
                                  0
                                ) /
                                  result.reduce(
                                    (acc, item) => acc + item.label.length,
                                    1
                                  )) *
                                  100
                              )}
                              %
                            </div>
                            <div className="fs-5 fw-medium text-muted">
                              Size Change
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
