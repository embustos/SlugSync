import React from "react";

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "friends", label: "Friends" },
  { value: "public", label: "Public" },
];

const VISIBILITY_FIELDS = [
  { key: "schedule_visibility", label: "Schedule visibility" },
  { key: "event_title_visibility", label: "Event title visibility" },
  { key: "classes_visibility", label: "Classes visibility" },
  { key: "clubs_visibility", label: "Clubs visibility" },
];

const TOGGLE_FIELDS = [
  { key: "allow_friend_requests", label: "Allow friend requests" },
  { key: "allow_group_invites", label: "Allow group invitations" },
];

export default function PrivacySettings({ values, onChange }) {
  return (
    <div className="profile-card">
      <h2 className="profile-card-title">Privacy</h2>

      <div className="profile-row">
        {VISIBILITY_FIELDS.map((field) => (
          <label className="profile-label" key={field.key}>
            {field.label}
            <select
              className="profile-input"
              value={values[field.key] || "friends"}
              onChange={(e) => onChange(field.key, e.target.value)}
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="privacy-toggle-list">
        {TOGGLE_FIELDS.map((field) => (
          <label className="privacy-toggle-row" key={field.key}>
            <span className="privacy-toggle-label">{field.label}</span>
            <span className="privacy-toggle-switch">
              <input
                type="checkbox"
                className="privacy-toggle-input"
                checked={Boolean(values[field.key])}
                onChange={(e) => onChange(field.key, e.target.checked)}
              />
              <span className="privacy-toggle-track" aria-hidden="true" />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
