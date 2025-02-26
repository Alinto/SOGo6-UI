import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PasswordInput } from "@/components/ui/input-password";

describe("PasswordInput component", () => {
  it("renders without crashing", () => {
    render(<PasswordInput />);
    const inputElement = screen.getByRole("textbox", { hidden: true });
    expect(inputElement).toBeInTheDocument();
  });

  it("matches the snapshot", () => {
    const { asFragment } = render(<PasswordInput />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("toggles password visibility when button is clicked", () => {
    render(<PasswordInput />);
    const inputElement = screen.getByRole("textbox", { hidden: true });
    const toggleButton = screen.getByRole("button");

    // Initially, the input type should be password
    expect(inputElement).toHaveAttribute("type", "password");

    // Click the button to show the password
    fireEvent.click(toggleButton);
    expect(inputElement).toHaveAttribute("type", "text");

    // Click the button again to hide the password
    fireEvent.click(toggleButton);
    expect(inputElement).toHaveAttribute("type", "password");
  });

  it("applies additional class names to the input", () => {
    render(<PasswordInput className="extra-class" />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveClass("extra-class");
  });

  it("forwards props to the input element", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const inputElement = screen.getByPlaceholderText("Enter password");
    expect(inputElement).toBeInTheDocument();
  });

  it("renders the correct icon based on password visibility", () => {
    render(<PasswordInput />);
    const toggleButton = screen.getByRole("button");

    // Initially, the EyeIcon should be rendered
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();

    // Click the button to show the password
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("eye-closed-icon")).toBeInTheDocument();
  });
});
