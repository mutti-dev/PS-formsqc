import {
    Badge,
    Alert,
    ListGroup,
    ListGroupItem,

} from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";


function KeyLengthWarningsSection({ longKeys, threshold }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLongKeys = useMemo(() => {
        if (!searchTerm) return longKeys;
        return longKeys.filter(entry =>
            entry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.key.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [longKeys, searchTerm]);

    if (longKeys.length === 0) return null;

    return (
        <CollapsibleSection
            title="Key Length Warnings"
            count={filteredLongKeys.length}
            defaultOpen={true}
        >
            <SearchBar
                placeholder="Search key length warnings..."
                value={searchTerm}
                onSearch={setSearchTerm}
            />
            <Alert variant="warning" className="mb-3">
                {filteredLongKeys.length} key(s) exceed {threshold} characters
            </Alert>
            <ListGroup variant="flush">
                {filteredLongKeys.map((entry, idx) => (
                    <ListGroupItem key={idx} className="border-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong>{entry.label}</strong>
                            <Badge bg="danger">{entry.key.length} characters</Badge>
                        </div>
                        <code className="text-muted font-monospace bg-dark p-1 rounded d-block text-truncate">
                            {entry.key.substring(0, threshold)}...
                        </code>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </CollapsibleSection>
    );
}

export default KeyLengthWarningsSection