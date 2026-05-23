import Link from 'next/link';

const footerLinks = {
  Buy: [
    { label: 'Buy in Indore', href: '/buy/indore' },
    { label: 'Buy in Bhopal', href: '/buy/bhopal' },
    { label: 'Plots in Indore', href: '/plots/indore' },
    { label: 'Plots in Bhopal', href: '/plots/bhopal' },
  ],
  Rent: [
    { label: 'Rent in Indore', href: '/rent/indore' },
    { label: 'Rent in Bhopal', href: '/rent/bhopal' },
  ],
  Projects: [
    { label: 'New Launch', href: '/projects/new-launch' },
    { label: 'Ongoing', href: '/projects/ongoing' },
    { label: 'Ready to Move', href: '/projects/ready-to-move' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Sell Property', href: '/sell' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-16">
      <div className="container-site py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-2xl font-bold">
              India<span className="text-gold">Township</span>
            </span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Premium real estate listings in Indore & Bhopal. Verified properties, expert team.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-3">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800 flex flex-col md:flex-row justify-between text-sm text-gray-400">
          <p>© {new Date().getFullYear()} IndiaTownship.com. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Indore &amp; Bhopal, Madhya Pradesh, India</p>
        </div>
      </div>
    </footer>
  );
}
