'use client';

import BuildTimesDashboard from '../components/BuildTimesDashboard';

export default function Home() {
  return (
    <div className="App">
      {/* INTENTIONAL: demo regression for AccessLint/audit PR check */}
      <img src="/logo512.png" />
      <button onClick={() => alert('hi')}></button>
      <BuildTimesDashboard />
    </div>
  );
}
