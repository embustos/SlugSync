import React from "react";

export default function TagList({ tags, emptyText }) {
  if (!tags || tags.length === 0) {
    return <p className="empty-state profile-empty-inline">{emptyText}</p>;
  }

  return (
    <div className="profile-tag-row">
      {tags.map((tag) => (
        <span className="profile-tag" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}
