// ============================================================================
// components/Navbar.tsx   →   the bar across the top of every page
// ============================================================================
// This one is deliberately simple: it just shows the app's name. All the
// login logic lives in app/page.tsx, so the navbar has nothing to think about.
// ----------------------------------------------------------------------------

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-bold text-gray-900">Auth Demo</h1>
        <p className="text-xs text-gray-400">CPRG 306 · Week 11</p>
      </div>
    </header>
  );
}
 