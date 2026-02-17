import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({
    className: "geist-mock",
    variable: "--font-geist-sans",
  }),
}));

import RootLayout, { metadata } from "@/app/layout";

describe("RootLayout", () => {
  it("renders children", () => {
    const element = RootLayout({
      children: <div data-testid="test-child">Test child</div>,
    });

    const body = element.props.children as React.ReactElement;
    const themeProvider = body.props.children as React.ReactElement;
    const themeChildren = React.Children.toArray(themeProvider.props.children);

    const hasChild = themeChildren.some(
      (child) =>
        React.isValidElement(child) &&
        child.props?.["data-testid"] === "test-child",
    );

    expect(hasChild).toBe(true);
  });

  it("sets InsightTask metadata", () => {
    expect(metadata.title).toBe("InsightTask");
  });
});
