import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressTimeline from "../components/ProgressTimeline";
import type { ProgressSnapshot } from "@autodev/shared";

describe("ProgressTimeline", () => {
  it("renders empty state when timeline is empty", () => {
    render(
      <ProgressTimeline
        timeline={[]}
        firstActivity="2024-01-01T00:00:00.000Z"
        lastActivity="2024-01-01T00:00:00.000Z"
        currentScore={0}
      />
    );
    expect(screen.getByText(/no activity recorded yet/i)).toBeInTheDocument();
  });

  it("renders current score prominently", () => {
    const timeline: ProgressSnapshot[] = [
      { timestamp: "2024-01-01T10:00:00.000Z", overallScore: 20, eventDescription: "module explored: Auth" },
      { timestamp: "2024-01-01T11:00:00.000Z", overallScore: 45, eventDescription: "walkthrough viewed: API" },
    ];

    render(
      <ProgressTimeline
        timeline={timeline}
        firstActivity="2024-01-01T10:00:00.000Z"
        lastActivity="2024-01-01T11:00:00.000Z"
        currentScore={45}
      />
    );

    // Score should appear (may be split across nodes)
    expect(screen.getAllByText(/45\s*%/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders SVG chart area", () => {
    const timeline: ProgressSnapshot[] = [
      { timestamp: "2024-01-01T10:00:00.000Z", overallScore: 10, eventDescription: "explored module" },
    ];

    const { container } = render(
      <ProgressTimeline
        timeline={timeline}
        firstActivity="2024-01-01T10:00:00.000Z"
        lastActivity="2024-01-01T12:00:00.000Z"
        currentScore={10}
      />
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows event descriptions in timeline", () => {
    const timeline: ProgressSnapshot[] = [
      { timestamp: "2024-01-01T10:00:00.000Z", overallScore: 20, eventDescription: "module explored: Auth" },
      { timestamp: "2024-01-01T10:30:00.000Z", overallScore: 35, eventDescription: "walkthrough viewed: API" },
    ];

    render(
      <ProgressTimeline
        timeline={timeline}
        firstActivity="2024-01-01T10:00:00.000Z"
        lastActivity="2024-01-01T10:30:00.000Z"
        currentScore={35}
      />
    );

    // Text appears in both SVG tooltip and event list
    expect(screen.getAllByText(/module explored: Auth/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/walkthrough viewed: API/).length).toBeGreaterThanOrEqual(1);
  });
});
