
import "./globals.css";


export const metadata = {
  title: {
    default: "CharityStride",
    template: "%s | CharityStride",
  },
  description: "Empowering Kindness",
  metadataBase: new URL("https://charitystride.com"),
  icons: {
    icon: "/charitystride_icon.png",
  },
  manifest: "/site.webmanifest",

  openGraph: {
    title: "CharityStride",
    description: "Empowering Kindness",
    url: "/",
    siteName: "CharityStride",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CharityStride Open Graph Image",
      },
    ],
    locale: "en-US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CharityStride",
    description: "Empowering Kindness",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
