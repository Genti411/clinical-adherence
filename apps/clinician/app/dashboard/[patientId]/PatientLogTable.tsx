'use client';

import { toCsv } from '@/lib/csv';

interface LogRow {
  plan_item_id: string;
  date: string;
  completed: boolean;
}

interface Props {
  logs: LogRow[];
  patientName: string;
}

export default function PatientLogTable({ logs, patientName }: Props) {
  function handleExportCsv() {
    const rows = logs.map((l) => ({
      plan_item_id: l.plan_item_id,
      date: l.date,
      completed: l.completed,
    }));
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adherence-${patientName.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Activity Logs ({logs.length})</h2>
        <button
          onClick={handleExportCsv}
          disabled={logs.length === 0}
          style={{
            padding: '0.4rem 1rem',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
            opacity: logs.length === 0 ? 0.5 : 1,
          }}
        >
          Export CSV
        </button>
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: '#888', marginTop: '0.75rem' }}>No activity logs for this patient.</p>
      ) : (
        <table style={{ marginTop: '0.75rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '0.4rem 0.75rem' }}>Date</th>
              <th style={{ padding: '0.4rem 0.75rem' }}>Plan Item</th>
              <th style={{ padding: '0.4rem 0.75rem' }}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f4f4f4' }}>
                <td style={{ padding: '0.4rem 0.75rem' }}>{row.date}</td>
                <td style={{ padding: '0.4rem 0.75rem' }}>{row.plan_item_id}</td>
                <td style={{ padding: '0.4rem 0.75rem' }}>{row.completed ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
