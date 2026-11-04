export default function AdminSettings() {
  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Settings</h1>
        <p>Platform-wide configuration for Manntattva.</p>
      </header>

      <div className="admin-panel">
        <h2>Coming soon</h2>
        <div className="admin-soon">
          <p style={{ marginBottom: 12 }}>
            Planned settings: booking limits, default session length, payment integration, email templates, and
            crisis-line copy on the footer.
          </p>
          <p className="fine">Use counsellor and user management in the sidebar for day-to-day operations today.</p>
        </div>
      </div>
    </>
  );
}
