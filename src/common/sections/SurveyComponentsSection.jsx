import { Badge, Table } from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";

function SurveyComponentsSection({ surveyValues }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSurveyValues = useMemo(() => {
    if (!searchTerm) return surveyValues;
    const term = searchTerm.toLowerCase();
    return surveyValues.filter(
      (survey) =>
        survey.label.toLowerCase().includes(term) ||
        survey.key.toLowerCase().includes(term) ||
        survey.questions.some(
          (q) =>
            q.label.toLowerCase().includes(term) ||
            String(q.value).toLowerCase().includes(term)
        ) ||
        (survey.values || []).some(
          (v) =>
            v.label.toLowerCase().includes(term) ||
            String(v.value).toLowerCase().includes(term)
        )
    );
  }, [surveyValues, searchTerm]);

  if (!surveyValues || surveyValues.length === 0) return null;

  return (
    <CollapsibleSection
      title="Survey Components"
      count={filteredSurveyValues.length}
      defaultOpen={false}
    >
      <SearchBar
        placeholder="Search survey components..."
        value={searchTerm}
        onSearch={setSearchTerm}
      />
      <div className="table-responsive">
        <Table bordered hover className="align-middle mb-0 table-sm">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "18%" }}>Label</th>
              <th style={{ width: "22%" }}>Key</th>
              <th style={{ width: "30%" }}>
                Questions (Rows)
                <div className="fw-normal small text-muted">Things being rated</div>
              </th>
              <th style={{ width: "30%" }}>
                Rating Options (Columns)
                <div className="fw-normal small text-muted">Answer choices</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSurveyValues.map((survey, idx) => (
              <tr key={idx}>
                <td
                  className="fw-semibold"
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                >
                  {survey.label}
                </td>

                <td
                  className="font-monospace small text-muted"
                  style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
                >
                  {survey.key}
                </td>

                {/* QUESTIONS — the row items */}
                <td>
                  <div className="p-2 rounded bg-body-secondary">
                    {survey.questions.length === 0 ? (
                      <span className="text-muted small fst-italic">No questions</span>
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        {survey.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="px-2 py-1 rounded border bg-body d-flex justify-content-between align-items-center gap-2"
                          >
                            <span
                              className="small fw-semibold"
                              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                            >
                              {q.label}
                            </span>
                            <code className="small text-muted text-nowrap">{q.value}</code>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-end">
                      <Badge bg="primary" pill>
                        {survey.questions.length}{" "}
                        {survey.questions.length === 1 ? "question" : "questions"}
                      </Badge>
                    </div>
                  </div>
                </td>

                {/* VALUES — the rating column options */}
                <td>
                  <div className="p-2 rounded bg-body-secondary">
                    {!survey.values || survey.values.length === 0 ? (
                      <span className="text-muted small fst-italic">No rating options</span>
                    ) : (
                      <div className="d-flex flex-wrap gap-1">
                        {survey.values.map((v, vIdx) => (
                          <span
                            key={vIdx}
                            className="px-2 py-1 rounded border bg-body small d-inline-flex align-items-center gap-1"
                          >
                            <span className="fw-semibold">{v.label}</span>
                            <code className="text-muted">{v.value}</code>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-end">
                      <Badge bg="info" pill>
                        {(survey.values || []).length}{" "}
                        {(survey.values || []).length === 1 ? "option" : "options"}
                      </Badge>
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

export default SurveyComponentsSection;
