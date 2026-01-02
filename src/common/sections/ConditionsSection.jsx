// common/sections/ConditionsSection.jsx
import { Table, Badge, Card } from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";

function ConditionsSection({ conditions }) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <CollapsibleSection
      title="Conditions & Logic Analysis"
      count={conditions.length}
      defaultOpen={false}
    >
      <div className="table-responsive">
        <Table bordered hover className="align-middle mb-0 table-sm">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "20%" }}>Component</th>
              <th style={{ width: "25%" }}>Key</th>
              <th style={{ width: "55%" }}>Conditions</th>
            </tr>
          </thead>
          <tbody>
            {conditions.map((cond, idx) => (
              <tr key={idx}>
                <td className="fw-semibold">{cond.label}</td>
                <td className="font-monospace small text-muted">
                  {cond.key}
                </td>
                <td>
                  <div className="p-2 rounded bg-body-secondary">
                    {cond.conditions.map((c, cIdx) => (
                      <Card key={cIdx} className="mb-2">
                        <Card.Header className="fw-semibold">
                          {c.type === "simpleConditional"
                            ? "Simple Conditional"
                            : "Logic"}
                        </Card.Header>

                        <Card.Body className="small">
                          {/* ✅ SIMPLE CONDITIONAL */}
                          {c.type === "simpleConditional" && (
                            <>
                              <div className="mb-2">
                                <Badge bg={c.show ? "success" : "danger"}>
                                  {c.show ? "SHOW" : "HIDE"}
                                </Badge>
                              </div>

                              <div className="d-flex flex-wrap gap-2 mb-2">
                                <Badge bg="primary">
                                  WHEN: {c.when}
                                </Badge>
                                <Badge bg="warning" text="dark">
                                  EQUALS: {String(c.eq)}
                                </Badge>
                              </div>
                            </>
                          )}

                          {/* ✅ LOGIC (future-proof) */}
                          {c.type === "logic" && (
                            <pre className="mb-2">
                              {JSON.stringify(c.items, null, 2)}
                            </pre>
                          )}

                          
                        </Card.Body>
                      </Card>
                    ))}
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

export default ConditionsSection;
