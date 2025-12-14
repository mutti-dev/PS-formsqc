
import {
  Badge,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";



function DuplicateLabelsSection({ duplicateLabels }) {
  if (duplicateLabels.length === 0) return null;

  return (
    <CollapsibleSection
      title="Duplicate Labels"
      count={duplicateLabels.length}
      defaultOpen={true}
    >
      <ListGroup variant="flush">
        {duplicateLabels.map(({ label, count }, idx) => (
          <ListGroupItem
            key={idx}
            className="d-flex justify-content-between align-items-center"
          >
            <span className="fw-medium">{label}</span>
            <Badge bg="warning" text="dark">
              {count} occurrences
            </Badge>
          </ListGroupItem>
        ))}
      </ListGroup>
    </CollapsibleSection>
  );
}

export default DuplicateLabelsSection