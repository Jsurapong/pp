import { IBM_Plex_Sans_Thai } from 'next/font/google';

const ibmFont = IBM_Plex_Sans_Thai({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: ibmFont.style.fontFamily }}>{children}</div>;
}
