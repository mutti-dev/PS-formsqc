// src/common/sections/RadioComponentsSection.jsx
import { Table, Badge } from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";

function RadioComponentsSection({ radioValues }) {
  if (!radioValues || radioValues.length === 0) return null;

  return (
    <CollapsibleSection
      title="Radio Components"
      count={radioValues.length}
      defaultOpen={false}
    >
      <div className="table-responsive">
        <Table bordered hover className="align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "22%" }}>Label</th>
              <th style={{ width: "33%" }}>Key</th>
              <th>
                Options <Badge bg="secondary" className="ms-2">Total</Badge>
              </th>
            </tr>
          </thead>
          <tbody>
            {radioValues.map((radio, idx) => (
              <tr key={idx}>
                <td className="fw-semibold text-break">{radio.label}</td>
                <td className="font-monospace small text-break text-muted">
                  {radio.key}
                </td>
                <td>
                  <div className="p-2 rounded bg-body-secondary">
                    <div className="d-flex flex-wrap gap-2">
                      {radio.values.map((option, optIdx) => (
                        <span
                          key={optIdx}
                          className="px-2 py-1 rounded border bg-body d-inline-flex align-items-center gap-1"
                          style={{ maxWidth: "100%" }}
                        >
                          <span className="fw-semibold text-break">
                            {option.label}
                          </span>
                          <span className="text-muted small">({option.value})</span>
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-end">
                      <Badge bg="info">{radio.values.length} options</Badge>
                    </div>
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