import { BarChart3, ExternalLink, FileText, Gauge } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const links = [
  { label: "Grafana", href: "http://grafana.infraops.local", icon: BarChart3 },
  { label: "Prometheus", href: "http://prometheus.infraops.local", icon: Gauge },
  { label: "Loki Logs", href: "http://grafana.infraops.local/explore", icon: FileText }
];

export default function Monitoring() {
  return (
    <>
      <PageHeader title="Monitoring" eyebrow="Observability" />
      <section className="monitor-grid">
        {links.map(({ label, href, icon: Icon }) => (
          <a className="monitor-tile" href={href} target="_blank" rel="noreferrer" key={label}>
            <Icon size={26} />
            <strong>{label}</strong>
            <ExternalLink size={16} />
          </a>
        ))}
      </section>
      <section className="panel">
        <h2>API Metrics</h2>
        <pre className="code-block">GET /api/monitoring/metrics</pre>
      </section>
    </>
  );
}
