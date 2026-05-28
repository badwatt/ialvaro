import { type ChangeEvent, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Spinner } from "src/components/Spinner";
import { PaperPlaneTiltIcon, CheckCircleIcon } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";

export const Contact = () => {
  const form = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!data.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateData = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const sendEmail = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await emailjs.sendForm(
        import.meta.env.PUBLIC_SERVICE_ID,
        import.meta.env.PUBLIC_TEMPLATE_ID,
        form.current as unknown as HTMLFormElement,
        import.meta.env.PUBLIC_PUBLIC_KEY,
      );
      setIsSubmitted(true);
    } catch {
      toast.error("Message failed to send. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="min-h-[80vh] px-4 md:px-0 relative">
      <div id="contact-nav" className="absolute top-0 left-0" aria-hidden="true" />
      <div className="h-12 md:h-24" />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-alvaro-surface)",
            color: "var(--color-alvaro-white)",
            border: "1px solid var(--color-alvaro-border)",
          },
        }}
      />
      {!isSubmitted ? (
        <section
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] p-8 md:p-10 rounded-2xl bg-alvaro-surface border border-alvaro-border hover:border-alvaro-primary/20 transition-all duration-500"
          aria-label="contact-form"
        >
          <div className="mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl md:text-4xl tracking-[-0.03em] leading-none font-bold mb-4">
              Get in touch
            </h2>
            <p className="text-alvaro-muted leading-relaxed max-w-[35ch]">
              Have a project or opportunity? Drop a message.
            </p>
          </div>
          <form ref={form} onSubmit={sendEmail} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="contact-name" className="text-sm font-medium text-alvaro-muted">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={data.name}
                onChange={updateData}
                autoComplete="name"
                className="bg-alvaro-base text-alvaro-white p-4 border border-alvaro-border rounded-lg focus:outline-none focus:border-alvaro-primary transition-colors duration-200"
                aria-describedby={errors.name ? "name-error" : undefined}
                required
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="contact-email" className="text-sm font-medium text-alvaro-muted">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={data.email}
                onChange={updateData}
                autoComplete="email"
                className="bg-alvaro-base text-alvaro-white p-4 border border-alvaro-border rounded-lg focus:outline-none focus:border-alvaro-primary transition-colors duration-200"
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="contact-phone" className="text-sm font-medium text-alvaro-muted">
                Phone <span className="text-alvaro-border">(optional)</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                value={data.phone}
                onChange={updateData}
                autoComplete="tel"
                className="bg-alvaro-base text-alvaro-white p-4 border border-alvaro-border rounded-lg focus:outline-none focus:border-alvaro-primary transition-colors duration-200"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="contact-message" className="text-sm font-medium text-alvaro-muted">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={data.message}
                onChange={updateData}
                className="bg-alvaro-base text-alvaro-white p-4 border border-alvaro-border rounded-lg focus:outline-none focus:border-alvaro-primary transition-colors duration-200 min-h-[120px] resize-y"
                aria-describedby={errors.message ? "message-error" : undefined}
                required
              />
              {errors.message && (
                <p id="message-error" className="text-sm text-red-400">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              className="flex items-center justify-center gap-2 p-4 mt-2 rounded-lg bg-alvaro-primary text-alvaro-dark font-medium cursor-pointer hover:opacity-90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              type="submit"
              aria-label="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner />
              ) : (
                <>
                  Send message
                  <PaperPlaneTiltIcon size={20} weight="bold" />
                </>
              )}
            </button>
          </form>
        </section>
      ) : (
        <section className="grid place-items-center p-12 rounded-2xl bg-alvaro-surface border border-alvaro-border animate-[scaleIn_0.5s_ease-out]">
          <CheckCircleIcon size={48} weight="bold" className="text-alvaro-primary mb-4" />
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Message sent</h2>
          <p className="text-alvaro-muted">I will get back to you soon.</p>
        </section>
      )}
    </section>
  );
};
