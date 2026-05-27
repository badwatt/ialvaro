import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mockEmailjs(sendForm: ReturnType<typeof vi.fn>) {
  vi.doMock("@emailjs/browser", () => ({
    default: { sendForm },
  }));
}

describe("<Contact />", () => {
  beforeEach(() => {
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof window.IntersectionObserver;
  });
  afterEach(() => {
    cleanup();
    vi.doUnmock("@emailjs/browser");
    vi.resetModules();
  });

  it("renders heading and form", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /get in touch/i })).toBeDefined();
  });

  it("shows validation errors on empty submit", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    fireEvent.submit(screen.getByLabelText("submit"));
    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
    expect(screen.getByText("Message is required")).toBeDefined();
  });

  it("shows invalid email error", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "not-an-email" },
    });
    fireEvent.submit(screen.getByLabelText("submit"));
    expect(screen.getByText("Invalid email address")).toBeDefined();
  });

  it("clears error when field is corrected", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    fireEvent.submit(screen.getByLabelText("submit"));
    expect(screen.getByText("Name is required")).toBeDefined();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    expect(screen.queryByText("Name is required")).toBeNull();
  });

  it("catches emailjs failure and shows toast", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { name: "message", value: "Hello" },
    });
    fireEvent.submit(screen.getByLabelText("submit"));

    await waitFor(() => {
      expect(screen.getByText(/Message failed to send/i)).toBeDefined();
    });
  });

  it("shows success on emailjs send", async () => {
    mockEmailjs(vi.fn().mockResolvedValue(undefined));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { name: "message", value: "Hello" },
    });
    fireEvent.submit(screen.getByLabelText("submit"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Message sent/i })).toBeDefined();
    });
  });

  it("updates form data on input change", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    render(<Contact />);
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { name: "name", value: "Alvaro" } });
    expect(nameInput.value).toBe("Alvaro");
  });

  it("matches snapshot", async () => {
    mockEmailjs(vi.fn().mockRejectedValue(new Error("fail")));
    const { Contact } = await import("src/views/Contact");
    const { container } = render(<Contact />);
    expect(container).toMatchSnapshot();
  });
});