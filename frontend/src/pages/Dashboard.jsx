import { AlertTriangle, CheckCircle2, HardDrive, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    apiRequest("/monitoring/summary").then(setSummary);
  }, []);

  const cards = [
    { label: "Total Assets", value: summary?.total_assets ?? "-", icon: HardDrive, tone: "blue" },
    { label: "Online Assets", value: summary?.online_assets ?? "-", icon: CheckCircle2, tone: "green" },
    { label: "Open Tickets", value: summary?.open_tickets ?? "-", icon: Ticket, tone: "amber" },
    { label: "Critical Tickets", value: summary?.critical_tickets ?? "-", icon: AlertTriangle, tone: "red" }
  ];

  return (
    <>
      <PageHeader title="Dashboard" eyebrow="Operations" />
      <section className="metric-grid">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article className={`metric-card ${tone}`} key={label}>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <Icon size={24} />
          </article>
        ))}
      </section>
      <section className="split-grid">
        <article className="panel">
          <h2>Infrastructure Summary</h2>
          <div className="bar-list">
            <Bar label="Online" value={summary?.online_assets || 0} total={summary?.total_assets || 1} tone="green" />
            <Bar label="Warning" value={summary?.warning_assets || 0} total={summary?.total_assets || 1} tone="amber" />
            <Bar label="Offline" value={summary?.offline_assets || 0} total={summary?.total_assets || 1} tone="red" />
          </div>
        </article>
        <article className="panel">
          <h2>Ticket Flow</h2>
          <div className="bar-list">
            <Bar label="Open" value={summary?.open_tickets || 0} total={(summary?.open_tickets || 0) + (summary?.in_progress_tickets || 0) + (summary?.closed_tickets || 0) || 1} tone="amber" />
            <Bar label="In Progress" value={summary?.in_progress_tickets || 0} total={(summary?.open_tickets || 0) + (summary?.in_progress_tickets || 0) + (summary?.closed_tickets || 0) || 1} tone="blue" />
            <Bar label="Closed" value={summary?.closed_tickets || 0} total={(summary?.open_tickets || 0) + (summary?.in_progress_tickets || 0) + (summary?.closed_tickets || 0) || 1} tone="green" />
          </div>
        </article>
      </section>
    </>
  );
}

function Bar({ label, value, total, tone }) {
  const width = Math.round((value / total) * 100);
  return (
    <div className="bar-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="bar-track">
        <span className={`bar-fill ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
