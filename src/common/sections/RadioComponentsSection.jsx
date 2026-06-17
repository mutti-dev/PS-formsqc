import { Table, Badge, Button, Form } from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";

/**
 * RadioComponentsSection
 *
 * Props:
 *   radioValues       – array from extractRadioValues()
 *   onUpdateOption    – (path, optIdx, field, newValue) => void
 *   onFixOptionKey    – (path, optIdx) => void
 */
function RadioComponentsSection({ radioValues, onUpdateOption, onFixOptionKey }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRadioValues = useMemo(() => {
    if (!searchTerm) return radioValues;
    const lower = searchTerm.toLowerCase();
    return radioValues.filter(
      (radio) =>
        radio.label.toLowerCase().includes(lower) ||
        radio.key.toLowerCase().includes(lower) ||
        radio.values.some(
          (opt) =>
            opt.label.toLowerCase().includes(lower) ||
            String(opt.value).toLowerCase().includes(lower)
        )
    );
  }, [radioValues, searchTerm]);

  if (!radioValues || radioValues.length === 0) return null;

  const totalMismatches = radioValues.reduce(
    (sum, r) => sum + (r.mismatchedValues?.length || 0),
    0
  );

  return (
    <CollapsibleSection
      title="Radio Components"
      count={filteredRadioValues.length}
      defaultOpen={false}
    >
      {totalMismatches > 0 && (
        <div className="alert alert-warning py-2 mb-3 small">
          <strong>{totalMismatches}</strong> option value{totalMismatches !== 1 ? "s" : ""} don't
          match their label — use the <strong>Fix</strong> button to correct them.
        </div>
      )}

      <SearchBar
        placeholder="Search radio components..."
        value={searchTerm}
        onSearch={setSearchTerm}
      />

      <div className="table-responsive">
        <Table bordered hover className="align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "22%" }}>Label</th>
              <th style={{ width: "22%" }}>Key</th>
              <th>Options (Label / Value)</th>
            </tr>
          </thead>
          <tbody>
            {filteredRadioValues.map((radio, idx) => (
              <tr key={idx}>
                {/* Field label */}
                <td className="fw-semibold text-break align-top">{radio.label}</td>

                {/* Field key */}
                <td className="font-monospace small text-break text-muted align-top">
                  {radio.key}
                </td>

                {/* Options — inline editable */}
                <td>
                  <div className="d-flex flex-column gap-2">
                    {radio.values.map((option, optIdx) => {
                      const expectedValue = option.label
                        ? option.label.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
                        : "";
                      const isMismatch = expectedValue && option.value !== expectedValue;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded border ${
                            isMismatch ? "border-warning bg-warning bg-opacity-10" : "bg-body-secondary"
                          }`}
                        >
                          <div className="d-flex flex-wrap gap-2 align-items-center">
                            {/* Label input */}
                            <div style={{ flex: "1 1 160px" }}>
                              <Form.Label className="mb-1 text-muted small">Label</Form.Label>
                              <Form.Control
                                size="sm"
                                value={option.label}
                                onChange={(e) =>
                                  onUpdateOption?.(radio.path, optIdx, "label", e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            {/* Value input */}
                            <div style={{ flex: "1 1 160px" }}>
                              <Form.Label className="mb-1 text-muted small">
                                Value (key)
                                {isMismatch && (
                                  <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: "0.65rem" }}>
                                    mismatch
                                  </Badge>
                                )}
                              </Form.Label>
                              <Form.Control
                                size="sm"
                                value={option.value}
                                onChange={(e) =>
                                  onUpdateOption?.(radio.path, optIdx, "value", e.target.value)
                                }
                                className={`font-monospace ${isMismatch ? "border-warning" : ""}`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            {/* Fix button — only shown on mismatch */}
                            {isMismatch && (
                              <div className="align-self-end">
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  title={`Fix to: ${expectedValue}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFixOptionKey?.(radio.path, optIdx);
                                  }}
                                >
                                  Fix → <code className="ms-1">{expectedValue}</code>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 text-end">
                    <Badge bg="info">{radio.values.length} options</Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </CollapsibleSection>
  );
}

export default RadioComponentsSection;