'use client'

export default function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: wire up newsletter subscription API
    const form = e.currentTarget
    const email = (form.elements.namedItem('footer-email') as HTMLInputElement).value
    console.log('Subscribe:', email)
    form.reset()
  }

  return (
    <form
      className="footer-newsletter"
      aria-label="Newsletter signup"
      onSubmit={handleSubmit}
    >
      <label htmlFor="footer-email" className="visually-hidden">
        Your email address
      </label>
      <input
        id="footer-email"
        name="footer-email"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        required
      />
      <button type="submit">Subscribe</button>
    </form>
  )
}
