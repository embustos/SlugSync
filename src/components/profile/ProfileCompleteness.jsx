import React from "react";

export default function ProfileCompleteness({ percent, suggestion, privacyNote }) {
  return (
    <div className="panel profile-completeness-card">
      <div className="sidebar-card-title">Profile completeness</div>
      <div
        className="completeness-bar-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completeness"
      >
        <div className="completeness-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="completeness-percent">{percent}% complete</p>
      {suggestion && <p className="completeness-suggestion">{suggestion}</p>}
      {privacyNote && <p className="profile-privacy-summary">{privacyNote}</p>}
    </div>
  );
}
