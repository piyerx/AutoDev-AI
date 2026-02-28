import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModuleCompletionGrid from "../components/ModuleCompletionGrid";
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

describe("ModuleCompletionGrid", () => {
  const defaultProps = {
    skills: [
      makeSkill({ area: "auth", score: 70, modulesExplored: 7, totalModules: 10 }),
      makeSkill({ area: "api", score: 40, modulesExplored: 4, totalModules: 10 }),
      makeSkill({ area: "database", score: 90, modulesExplored: 9, totalModules: 10 }),
    ],
    totalWalkthroughs: 5,
    walkthroughsCompleted: 3,
    totalConventions: 10,
    conventionsViewed: 8,
    questionsAsked: 15,
  };

  it("renders summary stats", () => {
    render(<ModuleCompletionGrid {...defaultProps} />);

    // Completed modules (score >= 80): only database(90) → 1
    expect(screen.getByText("Completed")).toBeInTheDocument();
    // In Progress modules (0 < score < 80): auth(70), api(40) → 2
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    // Questions asked → 15 (may appear in multiple places)
    expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Q&As Asked")).toBeInTheDocument();
  });

  it("renders module cards for each skill area", () => {
    render(<ModuleCompletionGrid {...defaultProps} />);

    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("API Layer")).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
  });

  it("shows score percentages on module cards", () => {
    render(<ModuleCompletionGrid {...defaultProps} />);

    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("renders with zero stats", () => {
    render(
      <ModuleCompletionGrid
        skills={[]}
        totalWalkthroughs={0}
        walkthroughsCompleted={0}
        totalConventions={0}
        conventionsViewed={0}
        questionsAsked={0}
      />
    );

    // Should show 0 values
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  it("renders area icons", () => {
    render(<ModuleCompletionGrid {...defaultProps} />);
    // Emoji icons for areas
    expect(screen.getByText("🔐")).toBeInTheDocument(); // auth
    expect(screen.getByText("🔌")).toBeInTheDocument(); // api
    expect(screen.getByText("🗄️")).toBeInTheDocument(); // database
  });
});
