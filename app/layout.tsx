import './globals.css';

export const metadata = {
  title: "Phishing Detector",
  description: "Client-side phishing detection with transformers.js and WebGPU",
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



