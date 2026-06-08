import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--black)', color: 'var(--white)' }}>

      {/* TOP BORDER ACCENT */}
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--claret)' }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* BRAND */}
        <div className="flex flex-col gap-4">
          <h2 className="leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--white)' }}>
            BTH +
          </h2>
          <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(245,240,235,0.45)' }}>
            Premium streetwear designed for the bold. Minimal silhouettes, elevated fabrics, timeless identity.
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--claret-light)' }}>
            Navigate
          </p>
          <nav className="flex flex-col gap-3">
            {[
              { href: '/', label: 'Home' },
              { href: '/products', label: 'Shop' },
              { href: '/about', label: 'About' },
              { href: '/account', label: 'My Orders' },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium transition-colors hover:text-pink-400 w-fit"
                style={{ color: 'rgba(245,240,235,0.65)' }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* CONTACT */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--claret-light)' }}>
            Contact Us
          </p>
          <div className="flex flex-col gap-3">
            <a href="mailto:hello@BTH.store"
              className="text-sm font-medium transition-colors hover:text-pink-400 w-fit flex items-center gap-2"
              style={{ color: 'rgba(245,240,235,0.65)' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              hello@
              .store
            </a>

            <a href="https://instagram.com/bthstore" target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-pink-400 w-fit flex items-center gap-2"
              style={{ color: 'rgba(245,240,235,0.65)' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              @kavalistore
            </a>

            <a href="https://twitter.com/kavalistore" target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-pink-400 w-fit flex items-center gap-2"
              style={{ color: 'rgba(245,240,235,0.65)' }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
              @bthstore
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t px-6 md:px-12 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        style={{ borderColor: 'rgba(245,240,235,0.08)' }}>
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(245,240,235,0.25)' }}>
          © 2026 BTH LUXURY STORE
        </p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service'].map((label) => (
            <span key={label} className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(245,240,235,0.2)' }}>
              {label}
            </span>
          ))}
        </div>
      </div>

    </footer>
  );
}