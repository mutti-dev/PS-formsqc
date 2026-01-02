import React from "react";
import { Form, InputGroup } from "react-bootstrap";

function SearchBar({ placeholder = "Search...", onSearch, value }) {
  return (
    <div className="mb-3">
      <InputGroup>
        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </InputGroup>
    </div>
  );
}

export default SearchBar;