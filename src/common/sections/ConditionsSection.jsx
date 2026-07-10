import { Table, Badge, Card } from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";

/**
 * ConditionsSection
 *
 * Props:
 *   conditions         – array from extractConditions()
 *   conditionalPatches – array of { fieldKey, fieldLabel, oldWhen, newWhen }
 *                        produced when a key fix auto-updated conditional.when
 */
function ConditionsSection({ conditions, conditionalPatches = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Build a lookup: fieldKey → patch, so we can highlight patched rows
  const patchByFieldKey = useMemo(() => {
    const map = {};
    conditionalPatches.forEach((p) => {
      map[p.fieldKey] = p;
    });
    return map;
  }, [conditionalPatches]);

  const dependencyMap = useMemo(() => {
    if (!conditions || !Array.isArray(conditions)) return [];

    return conditions.flatMap((cond) => {
      const targetLabel = cond.label || cond.key || "Unnamed";
      const targetKey = cond.key || "unknown";
      return (cond.conditions || []).flatMap((c) => {
        if (c.type === "simpleConditional" && c.when) {
          return [
            {
              source: c.when,
              target: targetKey,
              targetLabel,
              show: c.show,
              eq: c.eq,
            },
          ];
        }

        return [];
      });
    });
  }, [conditions]);

  const filteredConditions = useMemo(() => {
    if (!searchTerm) return conditions || [];
    const lower = searchTerm.toLowerCase();
    return (conditions || []).filter((cond) => {
      const label = (cond.label || cond.key || "Unnamed").toLowerCase();
      const key = (cond.key || "").toLowerCase();
      return (
        label.includes(lower) ||
        key.includes(lower) ||
        JSON.stringify(cond.conditions || []).toLowerCase().includes(lower)
      );
    });
  }, [conditions, searchTerm]);

  if (!conditions || conditions.length === 0) return null;

  const patchCount = conditionalPatches.length;

  return (
    <CollapsibleSection
      title="Conditions & Logic Analysis"
      count={filteredConditions.length}
      defaultOpen={false}
    >
      {/* Banner shown whenever the last key-fix touched at least one conditional */}
      {patchCount > 0 && (
        <div className="alert alert-success py-2 mb-3 small d-flex align-items-center gap-2">
          <span>✓</span>
          <span>
            <strong>{patchCount}</strong> conditional{patchCount !== 1 ? "s" : ""} were
            automatically updated to reflect the key change.
          </span>
        </div>
      )}

      <SearchBar
        placeholder="Search conditions..."
        value={searchTerm}
        onSearch={setSearchTerm}
      />

      {dependencyMap.length > 0 && (
        <Card className="mb-3 border-primary">
          <Card.Header className="fw-semibold small">Dependency map</Card.Header>
          <Card.Body>
            <div className="small text-muted mb-2">
              Fields that control other fields are shown below.
            </div>
            <div className="d-flex flex-column gap-2">
              {dependencyMap.map((entry, index) => (
                <div
                  key={`${entry.source}-${entry.target}-${index}`}
                  className="d-flex flex-wrap align-items-center gap-2 p-2 rounded border bg-body-secondary"
                >
                  <Badge bg="secondary" className="font-monospace">
                    {entry.source}
                  </Badge>
                  <span className="text-muted">→</span>
                  <Badge bg="primary" className="font-monospace">
                    {entry.targetLabel}
                  </Badge>
                  <span className="small text-muted">
                    {entry.show ? "shows" : "hides"} when {entry.source} = {String(entry.eq)}
                  </span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

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
            {filteredConditions.map((cond, idx) => {
              const patch = patchByFieldKey[cond.key];

              return (
                <tr
                  key={idx}
                  className={patch ? "table-success" : ""}
                >
                  <td className="fw-semibold">
                    {cond.label}
                    {patch && (
                      <Badge bg="success" className="ms-2" style={{ fontSize: "0.65rem" }}>
                        auto-fixed
                      </Badge>
                    )}
                  </td>

                  <td className="font-monospace small text-muted">{cond.key}</td>

                  <td>
                    <div className="p-2 rounded bg-body-secondary">
                      {cond.conditions.map((c, cIdx) => (
                        <Card key={cIdx} className="mb-2">
                          <Card.Header className="fw-semibold">
                            {c.type === "simpleConditional" ? "Simple Conditional" : "Logic"}
                          </Card.Header>

                          <Card.Body className="small">
                            {c.type === "simpleConditional" && (
                              <>
                                <div className="mb-2">
                                  <Badge bg={c.show ? "success" : "danger"}>
                                    {c.show ? "SHOW" : "HIDE"}
                                  </Badge>
                                </div>

                                <div className="d-flex flex-wrap gap-2 mb-2">
                                  {/* WHEN badge — highlighted if this was the patched key */}
                                  <Badge
                                    bg={patch ? "success" : "primary"}
                                    title={patch ? `Was: ${patch.oldWhen}` : undefined}
                                  >
                                    WHEN: {c.when}
                                    {patch && (
                                      <span className="ms-1 opacity-75">
                                        (was: {patch.oldWhen})
                                      </span>
                                    )}
                                  </Badge>

                                  <Badge bg="warning" text="dark">
                                    EQUALS: {String(c.eq)}
                                  </Badge>
                                </div>
                              </>
                            )}

                            {c.type === "logic" && (
                              <pre className="mb-2">{JSON.stringify(c.items, null, 2)}</pre>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </CollapsibleSection>
  );
}

export default ConditionsSection;