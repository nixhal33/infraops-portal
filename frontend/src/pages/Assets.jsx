import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const initialForm = { hostname: "", ip_address: "", asset_type: "server", location: "", status: "online" };

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function loadAssets() {
    setAssets(await apiRequest("/assets"));
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/assets", { method: "POST", body: JSON.stringify(form) });
      setForm(initialForm);
      await loadAssets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(assetId) {
    await apiRequest(`/assets/${assetId}`, { method: "DELETE" });
    await loadAssets();
  }

  return (
    <>
      <PageHeader title="Assets" eyebrow="Inventory" />
      <section className="data-layout">
        <form className="panel form" onSubmit={submit}>
          <h2>New Asset</h2>
          <input placeholder="Hostname" value={form.hostname} onChange={(event) => setForm({ ...form, hostname: event.target.value })} />
          <input placeholder="IP address" value={form.ip_address} onChange={(event) => setForm({ ...form, ip_address: event.target.value })} />
          <select value={form.asset_type} onChange={(event) => setForm({ ...form, asset_type: event.target.value })}>
            <option value="server">Server</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="vm">Virtual Machine</option>
            <option value="cluster">Cluster</option>
            <option value="firewall">Firewall</option>
          </select>
          <input placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {error && <div className="error">{error}</div>}
          <button className="primary-button" type="submit"><Plus size={16} /> Add Asset</button>
        </form>
        <section className="panel table-panel">
          <h2>Asset Inventory</h2>
          {assets.length === 0 ? <EmptyState title="No assets found" /> : (
            <table>
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>IP</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.hostname}</td>
                    <td>{asset.ip_address}</td>
                    <td>{asset.asset_type}</td>
                    <td>{asset.location}</td>
                    <td><StatusBadge value={asset.status} /></td>
                    <td>
                      <button className="icon-button danger" onClick={() => remove(asset.id)} title="Delete asset" aria-label="Delete asset">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </>
  );
}
