import './globals.css';

export const metadata = {
  title: 'CI Pipeline Build Times',
  description: 'Monitor and track your continuous integration builds',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
