import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Server-side spam protection: basic length limits
    if (message.length > 5000 || subject.length > 200 || name.length > 200) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    // Configure Titan SMTP via environment variables
    const host = process.env.SMTP_HOST || 'smtp.titan.email'
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER // e.g. contact@buildparlays.com
    const pass = process.env.SMTP_PASS
    const to = process.env.CONTACT_TO || process.env.SMTP_USER || 'contact@buildparlays.com'
    const from = process.env.CONTACT_FROM || process.env.SMTP_USER || 'contact@buildparlays.com'

    if (!user || !pass) {
      console.error('Email not configured: missing SMTP_USER/SMTP_PASS')
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass },
    })

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>
    `

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


