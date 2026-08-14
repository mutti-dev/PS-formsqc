import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import WordConverter from "./WordConverter";

describe("WordConverter (Text & Word Tools)", () => {
  beforeEach(() => {
    document.execCommand = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("renders both API Key Converter and Word to Dropdown Converter tabs", () => {
    render(<WordConverter theme="dark" />);

    expect(screen.getByText(/API Maker & Text Converter/i)).toBeInTheDocument();
    expect(screen.getByText(/Word to Dropdown Converter/i)).toBeInTheDocument();
  });

  it("converts text to API key in API Key Converter tab", () => {
    render(<WordConverter theme="dark" />);

    const textarea = screen.getByPlaceholderText(/Enter text to convert into programmatic keys/i);
    fireEvent.change(textarea, { target: { value: "First Name" } });

    const convertBtn = screen.getByRole("button", { name: /Convert Text/i });
    fireEvent.click(convertBtn);

    expect(screen.getByText(/Converted Result/i)).toBeInTheDocument();
    expect(screen.getByText("First_Name")).toBeInTheDocument();
  });

  it("converts words to option JSON objects in Word to Dropdown tab", () => {
    render(<WordConverter theme="dark" />);

    const tab = screen.getByText(/Word to Dropdown Converter/i);
    fireEvent.click(tab);

    const textarea = screen.getByPlaceholderText(/Enter one word or phrase per line/i);
    fireEvent.change(textarea, { target: { value: "Option One\nOption Two" } });

    const convertBtn = screen.getByRole("button", { name: /Convert to Options/i });
    fireEvent.click(convertBtn);

    expect(screen.getByText(/Ready-to-Use Options JSON/i)).toBeInTheDocument();
  });
});
