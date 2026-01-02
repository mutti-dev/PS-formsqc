import {

  Badge,
  ListGroupItem,
  ListGroup
 
} from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";


function DuplicateAPISection({ duplicateKeys }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDuplicateKeys = useMemo(() => {
    if (!searchTerm) return duplicateKeys;
    return duplicateKeys.filter(({ key }) =>
      key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [duplicateKeys, searchTerm]);

  if (duplicateKeys.length === 0) return null;

  return (
    <CollapsibleSection
      title="Duplicate Keys"
      count={filteredDuplicateKeys.length}
      defaultOpen={true}
    >
      <SearchBar
        placeholder="Search duplicate keys..."
        value={searchTerm}
        onSearch={setSearchTerm}
      />
      <ListGroup variant="flush">
        {filteredDuplicateKeys.map(({ key, count }, idx) => (
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