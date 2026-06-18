import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const whatsappNumber = '+923199934457';
  const whatsappLink = `https://wa.me/923199934457`;
  const instagramLink = 'https://instagram.com/dreamers_society_27';
  const tiktokLink = 'https://tiktok.com/@dreamers_society_27';

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-xl">Dreamers Society</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making the world a greener place, one action at a time.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp hello: {whatsappNumber}
            </a>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors hover:scale-105"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </a>
              <a
                href={tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Created by <span className="font-semibold text-foreground">Engnr-Qasim</span></p>
          <p className="mt-1">Computer System Engineering – UET Peshawar</p>
          <p className="mt-2">© {new Date().getFullYear()} Dreamers Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
