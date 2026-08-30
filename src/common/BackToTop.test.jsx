import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BackToTop from "./BackToTop";

describe("BackToTop component", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  test("renders back to top button", () => {
    render(<BackToTop threshold={100} />);
    const button = screen.getByRole("button", { name: /back to top/i });
    expect(button).toBeInTheDocument();
  });

  test("calls window.scrollTo on click", () => {
    render(<BackToTop threshold={100} />);
    const button = screen.getByRole("button", { name: /back to top/i });
    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
