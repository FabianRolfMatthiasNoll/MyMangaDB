import React, { useState } from "react";
import { createSource } from "../services/apiService";

const SettingsPage: React.FC = () => {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createSource({ name, language });
    if (result) {
      setMessage("Source created successfully!");
      setName("");
      setLanguage("");
    } else {
      setMessage("Failed to create source. Please check your input or try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2>Create New Source</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="source-name">Name:</label>
          <input
            id="source-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="source-language">Language:</label>
          <input
            id="source-language"
            type="text"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Creating..." : "Create Source"}
        </button>
      </form>
      {message && <div style={{ marginTop: 16 }}>{message}</div>}
    </div>
  );
};

export default SettingsPage; 