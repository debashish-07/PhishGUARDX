import './globals.css';

export const metadata = {
  title: "PhishGuardX",
  description: "Privacy-first client-side phishing detection with explainable URL analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-900 text-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}



