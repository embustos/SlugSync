import { supabase } from "../lib/supabaseClient";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Could not load your profile.");
  }

  return data;
}

export async function upsertProfile(userId, fields) {
  const payload = {
    id: userId,
    ...fields,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload)
    .select("*")
    .single();

  if (error) {
    if (/duplicate|unique/i.test(error.message) && "username" in fields) {
      throw new Error("That username is already taken.");
    }
    throw new Error(error.message || "Could not save your profile.");
  }

  return data;
}

// Returns an error message, or null when the file is good to upload.
export function validateAvatarFile(file) {
  if (!file) return "No file selected.";
  if (!ALLOWED_AVATAR_TYPES[file.type]) {
    return "Please choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return "Image must be smaller than 5 MB.";
  }
  return null;
}

export async function uploadAvatarFile(userId, file) {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = ALLOWED_AVATAR_TYPES[file.type];
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    throw new Error(uploadError.message || "Could not upload your photo.");
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return { publicUrl: data.publicUrl, path };
}

// Best-effort — an old/missing storage object should never block the caller
// from updating the profiles row.
export async function removeAvatarFile(path) {
  if (!path) return;
  try {
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  } catch {
    // ignored — orphaned storage objects are harmless
  }
}
