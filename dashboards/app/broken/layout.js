import '../globals.css';

export const metadata = {
  title: 'CI Pipeline Build Times (Broken)',
  description: 'Broken version for accessibility testing',
};

// A11y issues: html-has-lang (missing lang), html-lang-valid (invalid lang value)
export default function BrokenLayout({ children }) {
  return (
    <html lang="zz-invalid">
      <body>{children}</body>
    </html>
  );
}
