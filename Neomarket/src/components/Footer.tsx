import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Instagram, Youtube, MessageSquare, Globe, Mail, Shield, FileText, Code, Facebook, Music, Send } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
}

export default function Footer({ onPageChange }: FooterProps) {
  const navigate = useNavigate();
  
  const socialLinks = {
    instagram: 'https://www.instagram.com/scavenjer.game/',
    twitter: 'https://x.com/ScavenjerGame',
    youtube: 'https://www.youtube.com/@ScavenjerZaidek',
    discord: 'https://discord.gg/cp7jUyENEC',
    facebook: 'https://www.facebook.com/scavenjergame',
    tiktok: 'https://www.tiktok.com/@scavenjergame'
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onPageChange(path.replace('/', ''));
  };

  return (
    <footer className="relative mt-auto bg-[#0A0A0A] border-t border-[#2DD4BF]/20">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2DD4BF]/5 to-[#EC4899]/5 pointer-events-none" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675"
                alt="Scavenjer Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] bg-clip-text text-transparent">
                NEOMARKET
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              NeoMarket - Your gateway to exclusive Eko collections and digital collectibles.
            </p>
            <div className="flex gap-4">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors"
              >
                <Instagram size={20} />
              </a>
              {/* X (formerly Twitter) */}
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors"
              >
                <Youtube size={20} />
              </a>
              <a
                href={socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors"
              >
                <MessageSquare size={20} />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors"
              >
                <Music size={20} />
              </a>
            </div>
          </div>

          {/* NeoMarket Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-3">
              <li><Link to="/neomarket" className="footer-link">NeoMarket</Link></li>
              <li><Link to="/collection" className="footer-link">Eko Collection</Link></li>
              <li><Link to="/activity" className="footer-link">Activity</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://app.marblever.se/i/37KypfA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-center gap-2"
                >
                  <Globe size={16} /> Marbleverse
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="footer-link flex items-center gap-2">
                  <Shield size={16} /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link flex items-center gap-2">
                  <FileText size={16} /> Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#2DD4BF]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} NeoMarket. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="mailto:contact@scavenjer.com"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors text-sm flex items-center gap-2"
              >
                <Mail size={16} />
                Contact
              </a>
              <a
                href="https://app.marblever.se/i/37KypfA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#2DD4BF] transition-colors text-sm flex items-center gap-2"
              >
                <Globe size={16} />
                Marbleverse
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}