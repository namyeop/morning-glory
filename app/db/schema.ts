import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

// Utility: now in ms using SQLite's unixepoch()
const nowMs = () => sql`(unixepoch() * 1000)`;

// Users
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // UUID string
    email: text("email"),
    phone: text("phone"),
    name: text("name"),
    nickname: text("nickname").notNull(),
    avatarUrl: text("avatar_url"),
    timezone: text("timezone").notNull().default("Asia/Seoul"),
    wakeWindowStartMin: integer("wake_window_start_min").notNull().default(300),
    wakeWindowEndMin: integer("wake_window_end_min").notNull().default(540),
    status: text("status")
      .notNull()
      .default("active"), // active | suspended | deleted
    authProvider: text("auth_provider").notNull(), // email | apple | google | kakao | ...
    lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => ({
    // Basic uniqueness
    emailUq: sql`unique(email)`,
    phoneUq: sql`unique(phone)`,
    // Case-insensitive unique nickname
    nicknameLowerUq: sql`unique (lower(${t.nickname}))`,
    // Field checks
    c1: sql`check (email is not null or phone is not null)`,
    c2: sql`check (length(${t.nickname}) between 2 and 20)`,
    c3: sql`check (${t.wakeWindowStartMin} between 0 and 1440)`,
    c4: sql`check (${t.wakeWindowEndMin} between 0 and 1440)`,
    c5: sql`check (${t.wakeWindowStartMin} <= ${t.wakeWindowEndMin})`,
    c6: sql`check (${t.status} in ('active','suspended','deleted'))`,
    c7: sql`check (${t.authProvider} in ('email','apple','google','kakao'))`,
  })
);

// Photos
export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(), // UUID
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storageKeyOriginal: text("storage_key_original").notNull(),
    storageKeyThumb: text("storage_key_thumb").notNull(),
    mimeType: text("mime_type"),
    width: integer("width"),
    height: integer("height"),
    takenAt: integer("taken_at", { mode: "timestamp_ms" }).notNull(),
    exif: text("exif"), // JSON string
    hashSha256: text("hash_sha256").notNull(),
    source: text("source").notNull().default("camera"), // camera | gallery | unknown
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => ({
    hashUq: sql`unique(${t.hashSha256})`,
    sourceCheck: sql`check (${t.source} in ('camera','gallery','unknown'))`,
  })
);

// Check-ins
export const checkIns = sqliteTable(
  "check_ins",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // User local date (YYYY-MM-DD)
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    message: text("message"),
    capturedAt: integer("captured_at", { mode: "timestamp_ms" }).notNull(),
    deviceInfo: text("device_info"), // JSON string
    lat: real("lat"),
    lon: real("lon"),
    verifiedSource: integer("verified_source", { mode: "boolean" })
      .notNull()
      .default(true),
    verificationReason: text("verification_reason"),
    status: text("status").notNull().default("pending"), // pending | verified | rejected
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => ({
    uniqUserDate: sql`unique(${t.userId}, ${t.date})`,
    dateStatusIdx: sql`index (date, status)`,
    statusCheck: sql`check (${t.status} in ('pending','verified','rejected'))`,
    verifiedImpliesSource: sql`check (${t.status} != 'verified' or ${t.verifiedSource} = 1)`,
  })
);

// Matches
export const matches = sqliteTable(
  "matches",
  {
    id: text("id").primaryKey(), // UUID
    checkinAId: text("checkin_a_id")
      .notNull()
      .references(() => checkIns.id, { onDelete: "cascade" }),
    checkinBId: text("checkin_b_id")
      .notNull()
      .references(() => checkIns.id, { onDelete: "cascade" }),
    matchedOn: text("matched_on").notNull(), // YYYY-MM-DD
    status: text("status").notNull().default("active"), // active | completed | cancelled | expired
    compatScore: integer("compat_score"), // 0-100
    channelId: text("channel_id"),
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => ({
    noSelf: sql`check (${t.checkinAId} != ${t.checkinBId})`,
    statusCheck: sql`check (${t.status} in ('active','completed','cancelled','expired'))`,
    compatCheck: sql`check (${t.compatScore} between 0 and 100)`,
    matchedIdx: sql`index (matched_on, status)`,
    // Unique per unordered pair per date
    uniqPairDate: sql`unique (
      case when ${t.checkinAId} < ${t.checkinBId} then ${t.checkinAId} else ${t.checkinBId} end,
      case when ${t.checkinAId} < ${t.checkinBId} then ${t.checkinBId} else ${t.checkinAId} end,
      ${t.matchedOn}
    )`,
  })
);

// Sessions / Auth tokens
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs()),
  },
  (t) => ({
    refreshUq: sql`unique(${t.refreshTokenHash})`,
    // Partial index: active sessions lookup
    userActiveIdx: sql`create index if not exists sessions_user_active_idx on sessions(user_id) where revoked_at is null`,
  })
);

// Notes:
// - Some cross-table business rules (e.g., Photo.source must be 'camera' for a verified CheckIn,
//   or preventing self-match by user) should be enforced in application logic or triggers.
// - Date strings are stored as YYYY-MM-DD; timestamps are stored as ms since epoch (UTC).
