const statusLabels = {
  online: "Online",
  warning: "Warning",
  offline: "Offline",
  maintenance: "Maintenance",
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

export default function StatusBadge({ value }) {
  return <span className={`badge badge-${value}`}>{statusLabels[value] || value}</span>;
}
