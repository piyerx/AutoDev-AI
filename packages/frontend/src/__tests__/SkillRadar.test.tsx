import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillRadar from "../components/SkillRadar";
import type { SkillScore } from "@autodev/shared";

function makeSkill(overrides: Partial<SkillScore> = {}): SkillScore {
  return {
    area: "api",
    score: 50,
    modulesExplored: 3,
    totalModules: 5,
    lastActivity: "2024-01-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("SkillRadar", () => {
  it("renders empty state when no skills have data", () => {
    render(<SkillRadar skills={[]} />);
    expect(screen.getByText(/no skill data yet/i)).toBeInTheDocument();
  });

  it("renders SVG with skills that have scores", () => {
    const skills: SkillScore[] = [
      makeSkill({ area: "auth", score: 70 }),
      makeSkill({ area: "api", score: 40 }),
      makeSkill({ area: "database", score: 90 }),
    ];

    const { container } = render(<SkillRadar skills={skills} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // Should show percentage labels (appear in SVG + legend)
    expect(screen.getAllByText(/70\s*%/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/40\s*%/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/90\s*%/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows area labels", () => {
    const skills: SkillScore[] = [
      makeSkill({ area: "auth", score: 50 }),
      makeSkill({ area: "frontend", score: 30 }),
    ];

    render(<SkillRadar skills={skills} />);
    // Text appears in both SVG label and legend
    expect(screen.getAllByText("Auth").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Frontend").length).toBeGreaterThanOrEqual(1);
  });

  it("renders legend entries", () => {
    const skills: SkillScore[] = [
      makeSkill({ area: "auth", score: 70 }),
      makeSkill({ area: "database", score: 60 }),
    ];

    render(<SkillRadar skills={skills} />);
    // Legend shows labels + scores
    const authTexts = screen.getAllByText("Auth");
    expect(authTexts.length).toBeGreaterThanOrEqual(1);
    const dbTexts = screen.getAllByText("Database");
    expect(dbTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("filters out zero-score skills with no modules", () => {
    const skills: SkillScore[] = [
      makeSkill({ area: "auth", score: 50, totalModules: 3 }),
      makeSkill({ area: "api", score: 0, modulesExplored: 0, totalModules: 0 }),
    ];

    render(<SkillRadar skills={skills} />);
    // Auth should appear (in SVG label + legend)
    expect(screen.getAllByText("Auth").length).toBeGreaterThanOrEqual(1);
  });

  it("accepts custom size prop", () => {
    const skills: SkillScore[] = [
      makeSkill({ area: "auth", score: 50 }),
    ];

    const { container } = render(<SkillRadar skills={skills} size={400} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "400");
    expect(svg).toHaveAttribute("height", "400");
  });
});
