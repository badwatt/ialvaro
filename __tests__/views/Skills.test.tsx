import { act, cleanup, render, screen } from "@testing-library/react";
import { Skills } from "src/views/Skills";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "../helpers/observerMock";
import { testSkillsData } from "../fixtures";

describe("<Skills />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render a heading", () => {
    render(<Skills skillsData={testSkillsData} />);
    expect(screen.getByRole("heading", { name: /skills/i })).toBeDefined();
  });

  it("should show all skills by default", () => {
    render(<Skills skillsData={testSkillsData} />);
    expect(screen.getAllByLabelText(/skill/i).length).toBe(testSkillsData.length);
  });

  it("skills become visible when intersecting", () => {
    render(<Skills skillsData={testSkillsData} />);
    const skill = screen.getAllByLabelText(/skill:/i)[0];
    expect(skill.className).toContain("opacity-0");

    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(skill.className).toContain("opacity-100");
  });

  it("matches snapshot", () => {
    const { container } = render(<Skills skillsData={testSkillsData} />);
    expect(container).toMatchSnapshot();
  });
});
