import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Nav } from "src/components/Nav";
import { afterEach, describe, expect, it } from "vitest";

describe("<Nav />", () => {
  afterEach(cleanup);

  it("should render the nav brand", () => {
    render(<Nav />);
    expect(screen.getByText("AM")).toBeTruthy();
  });

  it("should render desktop links", () => {
    render(<Nav />);
    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByLabelText(/home-desktop/i)).toBeDefined();
  });

  it("should display mobile menu when clicking hamburger", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText(/menu-mobile/i));
    expect(screen.getByLabelText(/home-mobile/i)).toBeDefined();
  });

  it("should close mobile menu when a link is clicked", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText(/menu-mobile/i));
    fireEvent.click(screen.getByLabelText(/home-mobile/i));
    expect(screen.queryByLabelText(/home-mobile/i)).toBeNull();
  });

  it("adds scrolled class when scrollY > 50", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("bg-alvaro-base/80");
  });

  it("remains transparent when scrollY <= 50", () => {
    render(<Nav />);
    // after mount, scrollY is 0
    Object.defineProperty(window, "scrollY", { value: 10, configurable: true, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("bg-transparent");
  });

  it("closes mobile menu on outside click", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText(/menu-mobile/i));
    expect(screen.getByLabelText(/home-mobile/i)).toBeDefined();
    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(screen.queryByLabelText(/home-mobile/i)).toBeNull();
  });

  it("mousedown does nothing when menu closed (isOpen=false)", () => {
    render(<Nav />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
  });

  it("mousedown inside nav does not close menu", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText(/menu-mobile/i));
    expect(screen.getByLabelText(/home-mobile/i)).toBeDefined();
    const nav = screen.getByRole("navigation");
    act(() => {
      nav.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(screen.getByLabelText(/home-mobile/i)).toBeDefined();
  });

  it("brand click does not close when menu already closed", () => {
    render(<Nav />);
    fireEvent.click(screen.getByText("AM"));
    expect(screen.queryByLabelText(/home-mobile/i)).toBeNull();
  });

  it("brand click scrolls to home and closes mobile menu", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText(/menu-mobile/i));
    fireEvent.click(screen.getByText("AM"));
    expect(screen.queryByLabelText(/home-mobile/i)).toBeNull();
  });

  it("desktop link click calls scroller", () => {
    const anchor = document.createElement("div");
    anchor.id = "home-nav";
    document.body.appendChild(anchor);
    render(<Nav />);
    const homeLink = screen.getByLabelText(/home-desktop/i);
    fireEvent.click(homeLink);
    document.body.removeChild(anchor);
  });

  it("scroller falls back to section id when no anchor", () => {
    render(<Nav />);
    const aboutLink = screen.getByLabelText(/about-desktop/i);
    fireEvent.click(aboutLink);
  });

  it("brand button has cursor-pointer", () => {
    render(<Nav />);
    expect(screen.getByText("AM").classList.contains("cursor-pointer")).toBe(true);
  });

  it("matches snapshot", () => {
    const { container } = render(<Nav />);
    expect(container).toMatchSnapshot();
  });
});
