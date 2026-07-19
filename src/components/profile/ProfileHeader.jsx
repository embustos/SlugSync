import React from "react";

export default function ProfileHeader({
  profile,
  initials,
  mode,
  onEditClick,
  fileInputRef,
  onFileChange,
  onUploadClick,
  onRemoveClick,
  avatarBusy,
  avatarError,
}) {
  return (
    <section className="profile-header-card">
      <div className="profile-banner-gradient" />
      <div className="profile-header-body">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-lg">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.full_name || "Your"} profile photo`}
                className="profile-avatar-img"
              />
            ) : (
              <span aria-hidden="true">{initials}</span>
            )}
          </div>

          {mode === "edit" && (
            <div className="profile-avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="profile-avatar-file-input"
                onChange={onFileChange}
                aria-label="Choose a profile photo"
              />
              <button
                type="button"
                className="btn-secondary profile-avatar-btn"
                onClick={onUploadClick}
                disabled={avatarBusy}
              >
                {avatarBusy
                  ? "Uploading…"
                  : profile.avatar_url
                    ? "Change Photo"
                    : "Upload Photo"}
              </button>
              {profile.avatar_url && (
                <button
                  type="button"
                  className="profile-avatar-remove"
                  onClick={onRemoveClick}
                  disabled={avatarBusy}
                >
                  Remove Photo
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-header-info">
          <h1 className="profile-banner-name">{profile.full_name || "Your name"}</h1>
          <div className="profile-banner-meta">
            {profile.username && (
              <span className="profile-username">@{profile.username}</span>
            )}
            {profile.username && (profile.major || profile.year) && (
              <span className="profile-banner-dot" />
            )}
            {profile.major && <span className="profile-major">{profile.major}</span>}
            {profile.year && <span className="profile-year-badge">{profile.year}</span>}
          </div>
          {avatarError && <p className="profile-avatar-error">{avatarError}</p>}
        </div>

        {mode === "view" && (
          <div className="profile-banner-actions">
            <button
              type="button"
              className="btn-primary profile-edit-btn"
              onClick={onEditClick}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
