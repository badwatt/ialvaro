import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Contact } from "src/views/Contact";
import type { EmailJSResponseStatus } from "@emailjs/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@emailjs/browser", () => ({
  default: { sendForm: vi.fn().mockRejectedValue(new Error("fail")) },
}));

vi.mock("src/components/CapWidget", () => {
  const React = require("react");
  return {
    CapWidget: ({ onVerified }: { onVerified?: (token: string) => void }) => {
      return React.createElement(
        "button",
        { type: "button", onClick: () => onVerified?.("test-token") },
        "Verify",
      );
    },
  };
});

function setupFetchMock(ok = true) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/cap/verify") {
      return Promise.resolve({ ok, json: () => Promise.resolve({ ok }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe("<Contact />", () => {
  beforeEach(() => {
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof window.IntersectionObserver;
    setupFetchMock();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders heading and form", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /get in touch/i })).toBeDefined();
  });

  it("shows validation errors on empty send click", () => {
    render(<Contact />);
    fireEvent.click(screen.getByLabelText("submit"));
    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
    expect(screen.getByText("Message is required")).toBeDefined();
  });

  it("shows invalid email error", () => {
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "not-an-email" },
    });
    fireEvent.click(screen.getByLabelText("submit"));
    expect(screen.getByText("Invalid email address")).toBeDefined();
  });

  it("clears error when field is corrected", () => {
    render(<Contact />);
    fireEvent.click(screen.getByLabelText("submit"));
    expect(screen.getByText("Name is required")).toBeDefined();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    expect(screen.queryByText("Name is required")).toBeNull();
  });

  it("shows captcha widget after clicking send", () => {
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { name: "message", value: "Hello" },
    });
    fireEvent.click(screen.getByLabelText("submit"));
    expect(screen.queryByLabelText("submit")).toBeNull();
    expect(screen.getByText("Verify")).toBeDefined();
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
    fireEvent.click(screen.getByLabelText("submit"));
    fireEvent.click(screen.getByText("Verify"));

    await waitFor(() => {
      expect(screen.getByText(/Message failed to send/i)).toBeDefined();
    });
  });

  it("shows success on emailjs send", async () => {
    const { default: emailjs } = await import("@emailjs/browser");
    vi.mocked(emailjs.sendForm).mockResolvedValueOnce({
      status: 200,
      text: "OK",
    } as EmailJSResponseStatus);
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { name: "message", value: "Hello" },
    });
    fireEvent.click(screen.getByLabelText("submit"));
    fireEvent.click(screen.getByText("Verify"));

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

  it("blocks submit when captcha verification fails", async () => {
    setupFetchMock(false);
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { name: "name", value: "Alvaro" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: "email", value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { name: "message", value: "Hello" },
    });
    fireEvent.click(screen.getByLabelText("submit"));
    fireEvent.click(screen.getByText("Verify"));

    await waitFor(() => {
      expect(screen.getByText(/Captcha verification failed/i)).toBeDefined();
    });
  });

  it("matches snapshot", () => {
    const { container } = render(<Contact />);
    expect(container).toMatchSnapshot();
  });
});
