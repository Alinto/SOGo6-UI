import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Input } from "@/components/ui/input";

// filepath: /SOGo6/src/components/ui/input.test.tsx

describe("Input component", () => {
  it("renders without crashing", () => {
    render(<Input />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toBeInTheDocument();
  });

  it("matches the snapshot", () => {
    const { asFragment } = render(<Input />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("applies additional class names", () => {
    render(<Input className="extra-class" />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveClass("extra-class");
  });

  it("forwards ref to the input element", () => {
    const ref = React.createRef();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("disables the input when disabled prop is passed", () => {
    render(<Input disabled />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toBeDisabled();
  });

  it("applies placeholder text correctly", () => {
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText("Enter text");
    expect(inputElement).toBeInTheDocument();
  });
});
