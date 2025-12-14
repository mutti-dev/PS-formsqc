import {
  
    Button
} from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";


function TypeFilterSection({ uniqueTypes, hiddenTypes, onToggle }) {
  return (
    <CollapsibleSection
      title="Filter by Type"
      count={`${hiddenTypes.length} hidden`}
      defaultOpen={false}
    >
      <div className="d-flex flex-wrap gap-2">
        {uniqueTypes.map((type) => {
          const isHidden = hiddenTypes.includes(type);
          return (
            <Button
              key={type}
              variant={isHidden ? "outline-danger" : "outline-primary"}
              size="sm"
              onClick={() => onToggle(type)}
            >
              {isHidden ? "Hidden" : "Visible"}: {type}
            </Button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

export default TypeFilterSection;