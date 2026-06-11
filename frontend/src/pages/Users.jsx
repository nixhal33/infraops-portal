import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/users").then(setUsers).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHeader title="Users" eyebrow="Admin" />
      <section className="panel table-panel">
        {error && <div className="error">{error}</div>}
        {users.length === 0 ? <EmptyState title="No users found" /> : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
