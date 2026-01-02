
import {
    Table,
    Badge,
} from "react-bootstrap";
import { useState, useMemo } from "react";
import CollapsibleSection from "../CollapsibleSection";
import SearchBar from "../SearchBar";



function SelectComponentsSection({ selectValues }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSelectValues = useMemo(() => {
        if (!searchTerm) return selectValues;
        return selectValues.filter(select =>
            select.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            select.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            select.values.some(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(option.value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [selectValues, searchTerm]);

    if (!selectValues || selectValues.length === 0) return null;

    return (
        <CollapsibleSection
            title="Select Components"
            count={filteredSelectValues.length}
            defaultOpen={false}
        >
            <SearchBar
                placeholder="Search select components..."
                value={searchTerm}
                onSearch={setSearchTerm}
            />
            <div className="table-responsive">
                <Table bordered hover className="align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: "22%" }}>Label</th>
                            <th style={{ width: "33%" }}>Key</th>
                            <th>
                                Options{" "}
                                <Badge bg="secondary" className="ms-2">
                                    Total
                                </Badge>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSelectValues.map((select, idx) => (
                            <tr key={idx}>
                                {/* LABEL */}
                                <td className="fw-semibold text-break">
                                    {select.label}
                                </td>

                                {/* KEY */}
                                <td className="font-monospace small text-break text-muted">
                                    {select.key}
                                </td>

                                {/* OPTIONS */}
                                <td>
                                    <div className="p-2 rounded bg-body-secondary">
                                        <div className="d-flex flex-wrap gap-2">
                                            {select.values.map((option, optIdx) => (
                                                <span
                                                    key={optIdx}
                                                    className="px-2 py-1 rounded border bg-body d-inline-flex align-items-center gap-1"
                                                    style={{ maxWidth: "100%" }}
                                                >
                                                    <span className="fw-semibold text-break">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-muted small">
                                                        ({option.value})
                                                    </span>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-2 text-end">
                                            <Badge bg="info">
                                                {select.values.length} options
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

export default SelectComponentsSection
