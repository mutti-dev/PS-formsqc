import {
    Badge,
    Card
} from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";

function DuplicateSurveyValuesSection({ surveyValues }) {
  const [searchTerm, setSearchTerm] = useState("");

  const itemsWithDuplicates = useMemo(() => {
    if (!surveyValues || !Array.isArray(surveyValues)) return [];
    const duplicates = surveyValues.filter(
      (item) => item && item.duplicateValues?.length > 0
    );
    if (!searchTerm) return duplicates;
    const lowerSearch = searchTerm.toLowerCase();
    return duplicates.filter(item =>
      (item.label || "").toLowerCase().includes(lowerSearch) ||
      (item.key || "").toLowerCase().includes(lowerSearch) ||
      (item.duplicateValues || []).some(dup =>
        (dup.value || "").toLowerCase().includes(lowerSearch) ||
        (dup.labels || []).some(label => (label || "").toLowerCase().includes(lowerSearch))
      )
    );
  }, [surveyValues, searchTerm]);

  if (!itemsWithDuplicates || itemsWithDuplicates.length === 0) return null;

  return (
    <CollapsibleSection
      title="Duplicate Survey Values"
      count={`${itemsWithDuplicates.length} field(s)`}
      defaultOpen={true}
    >
      <SearchBar
        placeholder="Search duplicate survey values..."
        value={searchTerm}
        onSearch={setSearchTerm}
      />
      {itemsWithDuplicates.map((selectItem, idx) => (
        <Card key={idx} className="mb-3 border">
          <Card.Header className="d-flex justify-content-between align-items-start">
            <div>
              <div className="fw-semibold">{selectItem.label}</div>
              <small className="text-muted font-monospace">
                Key: {selectItem.key}
              </small>
            </div>
            <Badge bg="danger">
              {selectItem.duplicateValues.length} duplicate
              {selectItem.duplicateValues.length > 1 ? "s" : ""}
            </Badge>
          </Card.Header>
          <Card.Body>
            {selectItem.duplicateValues.map((dup, dupIdx) => (
              <div key={dupIdx} className="mb-3 p-2 border rounded">
                <div className="d-flex align-items-center mb-1">
                  <span className="text-muted me-2">Value:</span>
                  <code className=" p-1 rounded">{dup.value}</code>
                </div>
                <div className="d-flex align-items-center">
                  <span className="text-muted me-2">Found in:</span>
                  <div className="d-flex flex-wrap gap-1">
                    {dup.labels.map((label, labelIdx) => (
                      <Badge key={labelIdx} bg="info">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      ))}
    </CollapsibleSection>
  );
}


export default DuplicateSurveyValuesSection;