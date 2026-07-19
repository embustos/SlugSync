import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Profile from "./Profile";
import { useAuth } from "../context/AuthContext";
import { fetchProfile, upsertProfile, uploadAvatarFile, removeAvatarFile } from "../data/profileService";
import { fetchEvents } from "../data/eventService";
import { fetchGroups } from "../data/groupService";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../data/profileService", () => ({
  fetchProfile: vi.fn(),
  upsertProfile: vi.fn(),
  uploadAvatarFile: vi.fn(),
  removeAvatarFile: vi.fn(),
}));

vi.mock("../data/eventService", () => ({
  fetchEvents: vi.fn(),
}));

vi.mock("../data/groupService", () => ({
  fetchGroups: vi.fn(),
}));

vi.mock("./Auth", () => ({ default: () => <div>Auth Page</div> }));

const FULL_PROFILE_ROW = {
  id: "user-1",
  full_name: "Jane Slug",
  username: "janeslug",
  major: "Computer Science",
  year: "Senior",
  bio: "Hello fellow slugs!",
  avatar_url: "https://example.com/avatar.png",
  avatar_path: "user-1/avatar-123.png",
  interests: ["Hiking", "Reading"],
  clubs: ["Robotics Club", "Chess Club"],
  classes: ["CSE 101"],
  schedule_visibility: "friends",
  event_title_visibility: "friends",
  classes_visibility: "private",
  clubs_visibility: "public",
  allow_friend_requests: true,
  allow_group_invites: true,
};

function mockSession(email = "jane@ucsc.edu") {
  useAuth.mockReturnValue({
    session: { user: { id: "user-1", email } },
    loading: false,
    refreshProfile: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSession();
  fetchEvents.mockResolvedValue({ events: [] });
  fetchGroups.mockResolvedValue({ groups: [] });
  upsertProfile.mockResolvedValue(FULL_PROFILE_ROW);
});

describe("Profile view mode", () => {
  it("opens in view mode by default with an Edit Profile button", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    render(<Profile />);

    expect(await screen.findByRole("button", { name: "Edit Profile" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Full Name")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign Out" })).not.toBeInTheDocument();
  });

  it("renders clubs, classes, and interests as tags", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    render(<Profile />);

    await screen.findByRole("button", { name: "Edit Profile" });
    expect(screen.getByText("Robotics Club")).toBeInTheDocument();
    expect(screen.getByText("Chess Club")).toBeInTheDocument();
    expect(screen.getByText("CSE 101")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
  });

  it("renders the avatar image when avatar_url is set", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    render(<Profile />);

    const img = await screen.findByAltText("Jane Slug profile photo");
    expect(img).toHaveAttribute("src", FULL_PROFILE_ROW.avatar_url);
  });

  it("falls back to initials derived from email when there is no name or photo", async () => {
    fetchProfile.mockResolvedValue({ ...FULL_PROFILE_ROW, full_name: null, avatar_url: null });
    mockSession("jane@ucsc.edu");
    render(<Profile />);

    expect(await screen.findByText("JA")).toBeInTheDocument();
  });

  it("shows clean empty states when there are no upcoming events or groups", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    render(<Profile />);

    expect(await screen.findByText("No upcoming events yet.")).toBeInTheDocument();
    expect(screen.getByText("You're not in any groups yet.")).toBeInTheDocument();
  });

  it("calculates profile completeness for a fully filled profile", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    render(<Profile />);

    expect(await screen.findByText("100% complete")).toBeInTheDocument();
  });

  it("calculates profile completeness and suggests the next missing field", async () => {
    fetchProfile.mockResolvedValue({
      id: "user-1",
      full_name: "Jane Slug",
      username: "janeslug",
      major: null,
      year: null,
      bio: null,
      avatar_url: null,
      avatar_path: null,
      interests: [],
      clubs: [],
      classes: [],
    });
    render(<Profile />);

    expect(await screen.findByText("22% complete")).toBeInTheDocument();
    expect(
      screen.getByText("Add a profile photo to complete your profile."),
    ).toBeInTheDocument();
  });
});

describe("Profile edit mode", () => {
  it("switches to edit mode with editable fields when Edit Profile is clicked", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    const user = userEvent.setup();
    render(<Profile />);

    await user.click(await screen.findByRole("button", { name: "Edit Profile" }));

    expect(screen.getByLabelText("Full Name")).toHaveValue("Jane Slug");
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("restores the saved data and returns to view mode on Cancel", async () => {
    fetchProfile.mockResolvedValue(FULL_PROFILE_ROW);
    const user = userEvent.setup();
    render(<Profile />);

    await user.click(await screen.findByRole("button", { name: "Edit Profile" }));
    const nameInput = screen.getByLabelText("Full Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Changed Name");
    expect(nameInput).toHaveValue("Changed Name");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("heading", { name: "Jane Slug" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Profile" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Full Name")).not.toBeInTheDocument();
    expect(upsertProfile).not.toHaveBeenCalled();
  });
});
