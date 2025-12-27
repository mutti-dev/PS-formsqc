import { Badge, Table } from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";

function SurveyComponentsSection({ surveyValues }) {
  if (!surveyValues || surveyValues.length === 0) return null;

  return (
    <CollapsibleSection
      title="Survey Components"
      count={surveyValues.length}
      defaultOpen={false}
    >
      <div className="table-responsive">
        <Table bordered hover className="align-middle mb-0 table-sm">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "22%" }}>Label</th>
              <th style={{ width: "33%" }}>Key</th>
              <th style={{ width: "45%" }}>
                Questions{" "}
                <Badge bg="secondary" className="ms-2">
                  Total
                </Badge>
              </th>
            </tr>
          </thead>
          <tbody>
            {surveyValues.map((survey, idx) => (
              <tr key={idx}>
                {/* LABEL - improved wrapping */}
                <td
                  className="fw-semibold"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {survey.label}
                </td>

                {/* KEY - critical for long keys like in the image */}
                <td
                  className="font-monospace small text-muted"
                  style={{
                    wordBreak: "break-all",    // Essential for long underscore strings
                    overflowWrap: "break-word",
                  }}
                >
                  {survey.key}
                </td>

                {/* QUESTIONS */}
                <td>
                  <div className="p-3 rounded bg-body-secondary"> {/* increased padding */}
                    <div className="d-flex flex-wrap gap-2">
                      {survey.questions.map((q, qIdx) => (
                        <span
                          key={qIdx}
                          className="px-3 py-2 rounded border bg-body d-inline-flex align-items-center gap-2"
                          style={{
                            maxWidth: "100%",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            className="fw-semibold"
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {q.label}
                          </span>
                          <span className="text-muted small">({q.value})</span>
                        </span>
                      ))}
                    </div>

                    {survey.questions.length > 0 && (
                      <div className="mt-3 text-end">
                        <Badge bg="info" pill>
                          {survey.questions.length}{" "}
                          {survey.questions.length === 1 ? "question" : "questions"}
                        </Badge>
                      </div>
                    )}
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

export default SurveyComponentsSection;