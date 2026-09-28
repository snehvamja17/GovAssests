import "./globals.css";

export const metadata = {
  title: "GovAssets — Infrastructure Lifecycle Management",
  description: "Government Infrastructure Asset Inventory & Lifecycle Management System for tracking roads, bridges, buildings, and public infrastructure across Gujarat.",
  keywords: "government, infrastructure, asset management, roads, bridges, buildings, Gujarat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏗️</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
