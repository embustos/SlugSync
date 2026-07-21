import React, { useEffect, useState } from "react";
import {
  addSource,
  checkSourceForEvents,
  deleteSource,
  fetchSources,
  saveParsedEvents,
} from "../data/sourceService";

function formatWhen(event) {
  if (!event.date) return "Date not found";
  const parts = [event.date];
  if (event.startTime) parts.push(event.startTime);
  return parts.join(" · ");
}

function AddSourceForm({ onAdded }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const source = await addSource({ url, label });
      onAdded(source);
      setUrl("");
      setLabel("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="event-form-row">
        <label>
          Website URL
          <input
            type="url"
            placeholder="https://example.com/events"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>
        <label>
          Label (optional)
          <input
            type="text"
            placeholder="e.g. UCSC Events"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={saving} style={{ width: "auto" }}>
        {saving ? "Saving…" : "+ Add site"}
      </button>
    </form>
  );
}

function ConfirmEventsModal({ source, events, model, onClose, onSaved }) {
  const [selected, setSelected] = useState(() => events.map(() => true));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedCount = selected.filter(Boolean).length;

  function toggle(index, checked) {
    setSelected((prev) => prev.map((value, i) => (i === index ? checked : value)));
  }

  async function handleSave() {
    setError("");
    const chosen = events.filter((_, i) => selected[i]);
    if (chosen.length === 0) {
      setError("Select at least one event to save.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveParsedEvents(chosen, source);
      onSaved(saved.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="confirm-dialog event-form-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2>Confirm events from {source.label || source.url}</h2>
        <p>Review what we found. Uncheck anything you don't want to add.</p>
        {model ? <p className="event-when">Parsed using {model}</p> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
          {events.map((event, index) => (
            <label
              key={`${event.title || "untitled"}-${event.date || "no-date"}-${index}`}
              className="source-status-row"
              style={{ alignItems: "flex-start", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={selected[index]}
                onChange={(e) => toggle(index, e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <div style={{ flex: 1 }}>
                <div className="source-status-name">{event.title || "Untitled event"}</div>
                <div className="event-when">{formatWhen(event)}</div>
                {event.location ? <div className="event-when">{event.location}</div> : null}
              </div>
            </label>
          ))}
        </div>

        {error ? <p className="event-message event-message-error">{error}</p> : null}

        <div className="confirm-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : `Save ${selectedCount} event${selectedCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceRow({ source, onRemoved, onCheck }) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck() {
    setError("");
    setChecking(true);
    try {
      const { events, model } = await checkSourceForEvents(source);
      onCheck(source, events, model);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  async function handleRemove() {
    try {
      await deleteSource(source.id);
      onRemoved(source.id);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="source-status-row" style={{ padding: "11px 0", borderBottom: "1px solid #f2f3f6" }}>
      <div className="source-status-icon" style={{ background: "#eaf1ff", color: "#2f5ecb" }}>
        {(source.label || source.url).slice(0, 1).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="source-status-name">{source.label || source.url}</div>
        {source.label ? (
          <div className="event-when" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {source.url}
          </div>
        ) : null}
        {error ? <p className="field-error">{error}</p> : null}
      </div>
      <button type="button" className="btn-secondary" style={{ width: "auto" }} onClick={handleCheck} disabled={checking}>
        {checking ? "Checking…" : "Check for events"}
      </button>
      <button type="button" className="delete-event-button" onClick={handleRemove} aria-label="Remove site">
        Remove
      </button>
    </div>
  );
}

function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingReview, setPendingReview] = useState(null); // { source, events }
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchSources();
        if (!cancelled) setSources(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAdded(source) {
    setSources((prev) => [source, ...prev]);
  }

  function handleRemoved(id) {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCheck(source, events, model) {
    setPendingReview({ source, events, model });
  }

  function handleSaved(count) {
    setPendingReview(null);
    setSuccessMessage(`Saved ${count} event${count === 1 ? "" : "s"} to your calendar.`);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  return (
    <main className="dashboard">
      <section className="welcome-section">
        <div>
          <p className="eyebrow">Your sources</p>
          <h1>Add a website to pull events from</h1>
          <p>
            Save a link to any events page. We'll fetch it and pull out events for you to review
            before anything gets added to your calendar.
          </p>
        </div>
      </section>

      <div className="source-card welcome-section" style={{ marginTop: 24 }}>
        <AddSourceForm onAdded={handleAdded} />
      </div>

      {successMessage ? (
        <p className="event-message event-message-success">{successMessage}</p>
      ) : null}

      <div className="source-card welcome-section" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 14 }}>Saved sites</h2>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : loadError ? (
          <p className="event-message event-message-error">{loadError}</p>
        ) : sources.length === 0 ? (
          <p className="empty-state">You haven't saved any sites yet.</p>
        ) : (
          <div>
            {sources.map((source) => (
              <SourceRow
                key={source.id}
                source={source}
                onRemoved={handleRemoved}
                onCheck={handleCheck}
              />
            ))}
          </div>
        )}
      </div>

      {pendingReview ? (
        <ConfirmEventsModal
          source={pendingReview.source}
          events={pendingReview.events}
          model={pendingReview.model}
          onClose={() => setPendingReview(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </main>
  );
}

export default Sources;
