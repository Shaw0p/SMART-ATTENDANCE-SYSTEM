export default function StatusBadge({ value }) {
    if (value === undefined || value === null) return null;
    const pct = parseFloat(value);
    if (pct >= 75) return <span className="badge badge-success">✓ GOOD</span>;
    if (pct >= 65) return <span className="badge badge-warning">⚠ LOW</span>;
    return <span className="badge badge-danger">✗ CRITICAL</span>;
}
