import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  // filepath: /SOGo6/src/components/ui/dropdown-menu.test.tsx
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";

describe("DropdownMenu component", () => {
  test("renders DropdownMenuTrigger correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const triggerElement = screen.getByText("Open Menu");
    expect(triggerElement).toBeInTheDocument();
  });

  test("renders DropdownMenuItem correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    const menuItem = screen.getByText("Item 1");
    expect(menuItem).toBeInTheDocument();
  });

  test("renders DropdownMenuCheckboxItem correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    const checkboxItem = screen.getByText("Checkbox Item");
    expect(checkboxItem).toBeInTheDocument();
  });

  test("renders DropdownMenuRadioItem correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem>Radio Item</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    const radioItem = screen.getByText("Radio Item");
    expect(radioItem).toBeInTheDocument();
  });

  test("renders DropdownMenuLabel correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    const label = screen.getByText("Label");
    expect(label).toBeInTheDocument();
  });

  test("renders DropdownMenuSeparator correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
  });

  test("renders DropdownMenuShortcut correctly", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item 1<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    const shortcut = screen.getByText("Ctrl+S");
    expect(shortcut).toBeInTheDocument();
  });

  test("renders DropdownMenuSub and DropdownMenuSubContent correctly", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    fireEvent.click(screen.getByText("Sub Menu"));
    const subItem = screen.getByText("Sub Item 1");
    expect(subItem).toBeInTheDocument();
  });
});
