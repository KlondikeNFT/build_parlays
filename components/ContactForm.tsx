"use client";

import { useState } from "react";

interface ContactFormProps {
  title?: string;
  subtitle?: string;
}

export default function ContactForm({ title = "Contact BuildParlays", subtitle = "Have a question or request? Send us a message." }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState(""); // honeypot

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (hp) return; // bot caught

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });
      if (res.ok) {
        setSuccess("Thanks! Your message has been sent.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as any)?.error || "Something went wrong. Please try again later.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How can we help?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        Or email us directly at <span className="font-medium">contact@buildparlays.com</span>
      </div>
    </div>
  );
}


