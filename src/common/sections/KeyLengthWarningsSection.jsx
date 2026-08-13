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
        if (!longKeys || !Array.isArray(longKeys)) return [];
        if (!searchTerm) return longKeys;
        const lower = searchTerm.toLowerCase();
        return longKeys.filter(entry =>
            (entry.label || "").toLowerCase().includes(lower) ||
            (entry.key || "").toLowerCase().includes(lower)
        );
    }, [longKeys, searchTerm]);

    if (!longKeys || longKeys.length === 0) return null;

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
                            <Badge bg="danger">{entry.key ? String(entry.key).length : 0} characters</Badge>
                        </div>
                        <code className="text-muted font-monospace  p-1 rounded d-block text-truncate">
                            {entry.key ? String(entry.key).substring(0, threshold) : ""}...
                        </code>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </CollapsibleSection>
    );
}

export default KeyLengthWarningsSection