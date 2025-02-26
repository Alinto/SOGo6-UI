import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// filepath: /SOGo6/src/components/ui/tooltip.test.tsx

describe("Tooltip component", () => {
  it("renders TooltipProvider without crashing", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("renders TooltipTrigger without crashing", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("renders TooltipContent without crashing", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText("Hover me");
    trigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("applies default classes to TooltipContent", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText("Hover me");
    trigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    const tooltipContent = screen.getByText("Tooltip content");
    expect(tooltipContent).toHaveClass(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95"
    );
  });

  it("applies additional classes to TooltipContent", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="extra-class">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText("Hover me");
    trigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    const tooltipContent = screen.getByText("Tooltip content");
    expect(tooltipContent).toHaveClass("extra-class");
  });

  it("passes additional props to TooltipContent", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText("Hover me");
    trigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    const tooltipContent = screen.getByTestId("tooltip-content");
    expect(tooltipContent).toBeInTheDocument();
  });
});
