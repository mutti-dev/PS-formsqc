
import {
  Badge,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";



function DuplicateLabelsSection({ duplicateLabels }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDuplicateLabels = useMemo(() => {
    if (!searchTerm) return duplicateLabels;
    return duplicateLabels.filter(({ label }) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [duplicateLabels, searchTerm]);

  if (duplicateLabels.length === 0) return null;

  return (
    <CollapsibleSection
      title="Duplicate Labels"
      count={filteredDuplicateLabels.length}
      defaultOpen={true}
    >
      <SearchBar
        placeholder="Search duplicate labels..."
        value={searchTerm}
        onSearch={setSearchTerm}
      />
      <ListGroup variant="flush">
        {filteredDuplicateLabels.map(({ label, count }, idx) => (
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