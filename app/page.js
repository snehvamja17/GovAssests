"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <div className="logo-box">🏛️</div>
          <h1>GovAssets</h1>
        </div>
        <p className="subtitle">
          Government Infrastructure Asset Inventory &amp; Lifecycle Management System
        </p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="officer@gov.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <span className="err">{error}</span>}
          <button className="btn btn-primary" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Signing in..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="demo-info">
          <p>🔑 Demo Credentials</p>
          <code>
            Create an account in Supabase Auth,
            <br />
            then sign in with those credentials.
          </code>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a
            href="/citizen"
            style={{ color: "#E8772E", fontSize: 14, fontWeight: 500 }}
          >
            🏠 Visit Citizen Portal →
          </a>
        </div>
      </div>
    </div>
  );
}
