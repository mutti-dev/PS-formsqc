import {
    Badge,
    Card
} from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";

function DuplicateValuesSection({ selectValues }) {
  const itemsWithDuplicates = selectValues.filter(
    (item) => item.duplicateValues?.length > 0
  );

  if (itemsWithDuplicates.length === 0) return null;

  return (
    <CollapsibleSection
      title="Duplicate Select Values"
      count={`${itemsWithDuplicates.length} field(s)`}
      defaultOpen={true}
    >
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
                  <code className="bg-dark p-1 rounded">{dup.value}</code>
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


export default DuplicateValuesSection;