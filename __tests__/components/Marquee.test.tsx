import { cleanup, render } from "@testing-library/react";
import { Marquee } from "src/components/Marquee";
import { afterEach, describe, expect, it } from "vitest";

describe("<Marquee />", () => {
  afterEach(cleanup);

  it("renders items joined by separator", () => {
    const { container } = render(<Marquee items={["React", "Astro"]} />);
    expect(container.textContent).toContain("React");
    expect(container.textContent).toContain("Astro");
    expect(container.textContent).toContain("\u2726");
  });

  it("renders default speed as 30s", () => {
    const { container } = render(<Marquee items={["TypeScript"]} />);
    const track = container.querySelector(".marquee-track") as HTMLElement;
    expect(track.style.animationDuration).toBe("30s");
  });

  it("applies custom speed", () => {
    const { container } = render(<Marquee items={["Rust"]} speed={15} />);
    const track = container.querySelector(".marquee-track") as HTMLElement;
    expect(track.style.animationDuration).toBe("15s");
  });

  it("renders two rows", () => {
    const { container } = render(<Marquee items={["Go"]} />);
    const containers = container.querySelectorAll(".marquee-container");
    expect(containers.length).toBe(2);
  });

  it("second row has reverse speed", () => {
    const { container } = render(<Marquee items={["Docker"]} speed={20} />);
    const reverseTrack = container.querySelector(".marquee-track-reverse") as HTMLElement;
    expect(reverseTrack.style.animationDuration).toBe("16s");
  });

  it("renders single item", () => {
    const { container } = render(<Marquee items={["React"]} />);
    expect(container.textContent).toContain("React");
    expect(container.querySelector(".marquee-track")).toBeDefined();
  });

  it("renders multiple items with repeated content", () => {
    const { container } = render(<Marquee items={["React", "Astro", "Tailwind"]} />);
    const spans = container.querySelectorAll(".marquee-track span");
    expect(spans.length).toBe(2);
  });

  it("matches snapshot", () => {
    const { container } = render(<Marquee items={["React", "TypeScript"]} speed={25} />);
    expect(container).toMatchSnapshot();
  });
});
