import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext.jsx";

export default function Login() {
  const { login, token } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-brand">
          <ShieldCheck size={38} />
          <div>
            <h1>InfraOps Portal</h1>
            <p>Infrastructure operations dashboard</p>
          </div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary-button" type="submit">Sign in</button>
        </form>
      </section>
      <section className="login-visual">
        <div className="network-map">
          <span className="node node-a" />
          <span className="node node-b" />
          <span className="node node-c" />
          <span className="node node-d" />
          <span className="node node-e" />
          <span className="line line-one" />
          <span className="line line-two" />
          <span className="line line-three" />
        </div>
      </section>
    </main>
  );
}
