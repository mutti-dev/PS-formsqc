import React from "react";
import { render, screen } from "@testing-library/react";
import ScreenHeader from "./ScreenHeader";
import { FileEarmarkText } from "react-bootstrap-icons";

describe("ScreenHeader component", () => {
  test("renders title and icon correctly", () => {
    render(
      <ScreenHeader
        icon={<FileEarmarkText data-testid="header-icon" />}
        title="Form Review"
      />
    );

    expect(screen.getByText("Form Review")).toBeInTheDocument();
    expect(screen.getByTestId("header-icon")).toBeInTheDocument();
  });

  test("renders badge and actions", () => {
    render(
      <ScreenHeader
        title="Data Analyzer"
        badge="v2.0"
        actions={<button>Export</button>}
      />
    );

    expect(screen.getByText("Data Analyzer")).toBeInTheDocument();
    expect(screen.getByText("v2.0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });
});
