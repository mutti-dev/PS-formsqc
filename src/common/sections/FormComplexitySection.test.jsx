import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FormComplexitySection from "./FormComplexitySection";

describe("FormComplexitySection", () => {
  const sampleComplexity = {
    totalWeight: 43,
    equivalentPages: 5,
    totalEstimatedPages: 5,
    totalDataFields: 39,
    contentSectionsCount: 0,
    estimatedContentPages: 0,
    breakdown: [
      {
        key: "textfield",
        name: "Text Field",
        count: 20,
        unitWeightLabel: "1",
        unitWeight: 1,
        totalWeight: 20,
        fields: [{ label: "Field 1", key: "field_1" }],
        isDatagrid: false,
      },
      {
        key: "select",
        name: "Select Dropdown",
        count: 10,
        unitWeightLabel: "1",
        unitWeight: 1,
        totalWeight: 10,
        fields: [],
        isDatagrid: false,
      },
      {
        key: "datagrid_sample",
        name: "Sample Datagrid (4 internal fields)",
        count: 1,
        internalCount: 4,
        multiplier: 2,
        unitWeightLabel: "4 × 2",
        unitWeight: 8,
        totalWeight: 8,
        fields: [{ label: "Grid Field 1", key: "grid_1" }],
        isDatagrid: true,
      },
      {
        key: "datetime",
        name: "Date / Time",
        count: 5,
        unitWeightLabel: "1",
        unitWeight: 1,
        totalWeight: 5,
        fields: [],
        isDatagrid: false,
      },
    ],
    datagrids: [
      {
        label: "Sample Datagrid",
        key: "sample_grid",
        internalCount: 4,
        multiplier: 2,
        totalWeight: 8,
      },
    ],
    contentSections: [],
    pageBrackets: {
      currentPages: 5,
      brackets: [
        { pages: 1, pageLabel: "1 Page", rangeLabel: "1 – 10", isCurrent: false },
        { pages: 5, pageLabel: "5 Pages", rangeLabel: "41 – 50", isCurrent: true },
      ],
    },
  };

  it("renders KPIs and estimation breakdown correctly", () => {
    render(<FormComplexitySection formComplexity={sampleComplexity} />);

    // Check title and count badge
    expect(screen.getByText("Form Complexity & Page Estimation")).toBeInTheDocument();
    expect(screen.getByText(/5 Pages \(43 pts\)/i)).toBeInTheDocument();

    // Check KPIs
    expect(screen.getByText("Total Field Weight")).toBeInTheDocument();
    expect(screen.getByText("43")).toBeInTheDocument();
    expect(screen.getByText("39")).toBeInTheDocument();

    // Check Breakdown items
    expect(screen.getByText("Text Field")).toBeInTheDocument();
    expect(screen.getByText("Sample Datagrid (4 internal fields)")).toBeInTheDocument();
    expect(screen.getByText("4 × 2")).toBeInTheDocument();
  });

  it("opens the estimation standard modal on button click", () => {
    render(<FormComplexitySection formComplexity={sampleComplexity} />);

    const standardButton = screen.getByText(/View Estimation Standard/i);
    expect(standardButton).toBeInTheDocument();

    fireEvent.click(standardButton);

    expect(screen.getByText("Form Complexity and Estimation Standard")).toBeInTheDocument();
    expect(screen.getByText("Standard Field Weights")).toBeInTheDocument();
    expect(screen.getByText("Form-to-Page Mapping Standard")).toBeInTheDocument();
  });

  it("expands included fields list when View button is clicked", () => {
    render(<FormComplexitySection formComplexity={sampleComplexity} />);

    const viewButtons = screen.getAllByText("View (1)");
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText("Included Fields (1):")).toBeInTheDocument();
    expect(screen.getByText("Field 1")).toBeInTheDocument();
  });
});
