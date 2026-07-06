export default function Footer() {
  return (
    <footer className="bg-surface-dark border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-8 mt-auto max-w-max-width mx-auto gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <span className="text-primary font-bold text-headline-md">IPH CERO</span>
          <span className="text-on-surface-variant text-label-sm font-label-sm">
            © {new Date().getFullYear()} IPH SAICF
          </span>
        </div>
        <nav className="flex gap-6">
          <a className="text-on-surface-variant hover:text-primary-fixed transition-colors text-label-sm font-label-sm" href="https://iphglobal.com/ar/es" target="_blank" rel="noopener noreferrer">
            IPH Website
          </a>
          <a className="text-on-surface-variant hover:text-primary-fixed transition-colors text-label-sm font-label-sm" href="https://www.linkedin.com/company/iph-saicf/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className="text-on-surface-variant hover:text-primary-fixed transition-colors text-label-sm font-label-sm" href="https://www.youtube.com/channel/UC7zUJfmTdnEyohVHtGFu2Iw" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
        </nav>
      </div>
    </footer>
  )
}
