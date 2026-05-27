import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Contact } from "src/views/Contact";
import type { EmailJSResponseStatus } from "@emailjs/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@emailjs/browser", () => ({
  default: { sendForm: vi.fn().mockRejectedValue(new Error("fail")) },
}));

describe("<Contact />", () => {
  beforeEach(() => {
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof window.IntersectionObserver;
  });
  afterEach(cleanup);

  it("renders heading and form", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /get in touch/i })).toBeDefined();
  });

  it("shows validation errors on empty submit", () => {
    render(<Contact />);
    fireEvent.submit(screen.getByLabelText("submit"));
    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
    expect(screen.getByText("Message is required")).toBeDefined();
  });

  it("shows invalid email error", () => {
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "not-an-email" },
    });
    fireEvent.submit(screen.getByLabelText("submit"));
    expect(screen.getByText("Invalid email address")).toBeDefined();
  });

  it("clears error when field is corrected", () => {
    render(<Contact />);
    fireEvent.submit(screen.getByLabelText("submit"));
    expect(screen.getByText("Name is required")).toBeDefined();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    expect(screen.queryByText("Name is required")).toBeNull();
  });

  it("catches emailjs failure and shows toast", async () => {
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
    const { default: emailjs } = await import("@emailjs/browser");
    vi.mocked(emailjs.sendForm).mockResolvedValueOnce({ status: 200, text: 'OK' } as EmailJSResponseStatus);
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

  it("updates form data on input change", () => {
    render(<Contact />);
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { name: "name", value: "Alvaro" } });
    expect(nameInput.value).toBe("Alvaro");
  });

  it("matches snapshot", () => {
    const { container } = render(<Contact />);
    expect(container).toMatchSnapshot();
  });
});