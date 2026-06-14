// Drop-in replacement for renderTypeGroup inside AdvancedJSONComparator.jsx
// Handles the new optionDiff shape returned by compareFormKeys

const renderOptionDiff = (optionDiff) => {
  if (!optionDiff) return null;
  const { removedOptions, addedOptions, changedOptions } = optionDiff;
  if (!removedOptions.length && !addedOptions.length && !changedOptions.length) return null;

  return (
    <div className="mt-2 ps-3 border-start border-secondary" style={{ fontSize: "0.8rem" }}>
      <div className="text-muted fw-semibold mb-1">Options</div>

      {removedOptions.map((o, i) => (
        <div key={`rem-${i}`} className="d-flex gap-2 align-items-center mb-1">
          <Badge bg="danger" style={{ fontSize: "0.7rem" }}>Removed</Badge>
          <code className="text-danger">{o.value}</code>
          <span className="text-muted">"{o.oldLabel}"</span>
        </div>
      ))}

      {addedOptions.map((o, i) => (
        <div key={`add-${i}`} className="d-flex gap-2 align-items-center mb-1">
          <Badge bg="success" style={{ fontSize: "0.7rem" }}>Added</Badge>
          <code className="text-success">{o.value}</code>
          <span className="text-muted">"{o.newLabel}"</span>
        </div>
      ))}

      {changedOptions.map((o, i) => (
        <div key={`chg-${i}`} className="d-flex gap-2 align-items-center mb-1">
          <Badge bg="warning" text="dark" style={{ fontSize: "0.7rem" }}>Changed</Badge>
          <code className="text-warning">{o.value}</code>
          <span className="text-muted">"{o.oldLabel}" → "{o.newLabel}"</span>
        </div>
      ))}
    </div>
  );
};

// Updated renderTypeGroup — replaces the existing one in AdvancedJSONComparator.jsx
const renderTypeGroup = (title, items, variant) => {
  if (items.length === 0) return null;

  const typeGroups = {};
  items.forEach((item) => {
    const type = item.type || "unknown";
    if (!typeGroups[type]) typeGroups[type] = [];
    typeGroups[type].push(item);
  });

  let alertMessage = "";
  if (title === "Removed") {
    alertMessage = "DANGER: These fields were removed from sandbox but exist in production. This is a critical issue and must be resolved!";
  } else if (title === "Added") {
    alertMessage = "SAFE: These are new fields added in sandbox. Safe to proceed with migration.";
  } else if (title === "Modified") {
    alertMessage = "WARNING: These fields have label or option changes. Review to ensure the changes are intentional.";
  }

  return (
    <div key={title} className="mb-4">
      <h6 className={`text-${variant} fw-bold mb-3`}>
        {title} ({items.length})
      </h6>

      {alertMessage && (
        <Alert
          variant={title === "Removed" ? "danger" : title === "Added" ? "success" : "warning"}
          className="mb-3 py-2"
        >
          {alertMessage}
        </Alert>
      )}

      {Object.entries(typeGroups).map(([type, typeItems]) => (
        <div key={type} className="mb-3">
          <div className="small text-muted mb-2" style={{ fontSize: "0.85rem" }}>
            {type}
          </div>
          <div className="list-group">
            {typeItems.map((item, idx) => (
              <div
                key={idx}
                className={`list-group-item bg-${variant} bg-opacity-10 py-2`}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <code className={`text-${variant} fw-bold`} style={{ wordBreak: "break-word" }}>
                      {item.key}
                    </code>
                    <div className="small text-muted mt-1" style={{ wordBreak: "break-word" }}>
                      {title === "Removed" && `"${item.oldLabel || "(no label)"}"`}
                      {title === "Added" && `"${item.newLabel || "(no label)"}"`}
                      {title === "Modified" &&
                        (item.oldLabel !== item.newLabel
                          ? `"${item.oldLabel || "(no label)"}" → "${item.newLabel || "(no label)"}`
                          : `"${item.oldLabel || "(no label)"}" (label unchanged)`)}
                    </div>

                    {/* Option diff — only rendered for Modified items */}
                    {title === "Modified" && item.optionDiff && renderOptionDiff(item.optionDiff)}
                  </div>

                  <div className="d-flex flex-column align-items-end gap-1">
                    <Badge bg={variant}>
                      {title === "Removed" ? "Removed" : title === "Added" ? "Added" : "Changed"}
                    </Badge>
                    {item.issue && item.issue !== "Label changed" && (
                      <span className="text-muted" style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                        {item.issue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <hr className="my-3" />
    </div>
  );
};
