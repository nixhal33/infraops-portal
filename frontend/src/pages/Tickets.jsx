import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const initialForm = { title: "", description: "", status: "open", severity: "medium", asset_id: "" };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function loadData() {
    const [ticketData, assetData] = await Promise.all([apiRequest("/tickets"), apiRequest("/assets")]);
    setTickets(ticketData);
    setAssets(assetData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/tickets", {
        method: "POST",
        body: JSON.stringify({ ...form, asset_id: form.asset_id ? Number(form.asset_id) : null })
      });
      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(ticket, status) {
    await apiRequest(`/tickets/${ticket.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    await loadData();
  }

  async function remove(ticketId) {
    await apiRequest(`/tickets/${ticketId}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <>
      <PageHeader title="Tickets" eyebrow="Service Desk" />
      <section className="data-layout">
        <form className="panel form" onSubmit={submit}>
          <h2>New Ticket</h2>
          <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select value={form.asset_id} onChange={(event) => setForm({ ...form, asset_id: event.target.value })}>
            <option value="">Unassigned asset</option>
            {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.hostname}</option>)}
          </select>
          {error && <div className="error">{error}</div>}
          <button className="primary-button" type="submit"><Plus size={16} /> Add Ticket</button>
        </form>
        <section className="panel ticket-board">
          {["open", "in_progress", "closed"].map((status) => (
            <div className="ticket-column" key={status}>
              <h2>{status === "in_progress" ? "In Progress" : status[0].toUpperCase() + status.slice(1)}</h2>
              {tickets.filter((ticket) => ticket.status === status).length === 0 && <EmptyState title="No tickets" />}
              {tickets.filter((ticket) => ticket.status === status).map((ticket) => (
                <article className="ticket-card" key={ticket.id}>
                  <div>
                    <strong>{ticket.title}</strong>
                    <p>{ticket.description}</p>
                  </div>
                  <div className="ticket-meta">
                    <StatusBadge value={ticket.severity} />
                    <span>{ticket.asset?.hostname || "No asset"}</span>
                  </div>
                  <div className="ticket-actions">
                    <select value={ticket.status} onChange={(event) => updateStatus(ticket, event.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button className="icon-button danger" onClick={() => remove(ticket.id)} title="Delete ticket" aria-label="Delete ticket">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </section>
      </section>
    </>
  );
}
