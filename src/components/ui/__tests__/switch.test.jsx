import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Switch } from "@/components/ui/switch";

// filepath: /SOGo6/src/components/ui/switch.test.tsx

describe("Switch component", () => {
  it("renders correctly", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  });

  it("has correct initial state", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("data-state", "unchecked");
  });

  it("toggles state on click", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");
    fireEvent.click(switchElement);
    expect(switchElement).toHaveAttribute("data-state", "checked");
    fireEvent.click(switchElement);
    expect(switchElement).toHaveAttribute("data-state", "unchecked");
  });

  it("applies custom className", () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveClass("custom-class");
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeDisabled();
  });
});
