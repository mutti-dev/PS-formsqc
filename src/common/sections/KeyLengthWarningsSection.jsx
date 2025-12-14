import {
    Badge,
    Alert,
    ListGroup,
    ListGroupItem,

} from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";


function KeyLengthWarningsSection({ longKeys, threshold }) {
    if (longKeys.length === 0) return null;

    return (
        <CollapsibleSection
            title="Key Length Warnings"
            count={longKeys.length}
            defaultOpen={true}
        >
            <Alert variant="warning" className="mb-3">
                {longKeys.length} key(s) exceed {threshold} characters
            </Alert>
            <ListGroup variant="flush">
                {longKeys.map((entry, idx) => (
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