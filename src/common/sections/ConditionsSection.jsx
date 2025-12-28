// NEW: ConditionsSection.jsx in common/sections
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
              <th style={{ width: "30%" }}>Key</th>
              <th style={{ width: "50%" }}>Conditions / Logic</th>
            </tr>
          </thead>
          <tbody>
            {conditions.map((cond, idx) => (
              <tr key={idx}>
                <td className="fw-semibold">{cond.label}</td>
                <td className="font-monospace small text-muted">{cond.key}</td>
                <td>
                  <div className="p-2 rounded bg-body-secondary">
                    {cond.conditions.map((c, cIdx) => (
                      <Card key={cIdx} className="mb-2">
                        <Card.Header>
                          {c.type === 'customConditional' ? 'Custom Conditional' : 'Logic'}
                        </Card.Header>
                        <Card.Body>
                          <code className="d-block mb-2">
                            {c.code || JSON.stringify(c.items, null, 2)}
                          </code>
                          <div>
                            <strong>Affected Fields:</strong>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {cond.affectedFields.length > 0 ? (
                                cond.affectedFields.map((field, fIdx) => (
                                  <Badge key={fIdx} bg="info">
                                    {field}
                                  </Badge>
                                ))
                              ) : (
                                <Badge bg="secondary">None detected</Badge>
                              )}
                            </div>
                          </div>
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