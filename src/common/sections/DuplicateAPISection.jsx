import {

  Badge,
  ListGroupItem,
  ListGroup
 
} from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";


function DuplicateAPISection({ duplicateKeys }) {
  if (duplicateKeys.length === 0) return null;

  return (
    <CollapsibleSection
      title="Duplicate Keys"
      count={duplicateKeys.length}
      defaultOpen={true}
    >
      <ListGroup variant="flush">
        {duplicateKeys.map(({ key, count }, idx) => (
          <ListGroupItem
            key={idx}
            className="d-flex justify-content-between align-items-center"
          >
            <code className="text-truncate">{key}</code>
            <Badge bg="warning" text="dark">
              {count} occurrences
            </Badge>
          </ListGroupItem>
        ))}
      </ListGroup>
    </CollapsibleSection>
  );
}

export default DuplicateAPISection