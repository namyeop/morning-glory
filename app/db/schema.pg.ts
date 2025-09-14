import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  bigint,
  doublePrecision,
  boolean,
  index,
} from "drizzle-orm/pg-core";

const nowMs = sql`(floor(extract(epoch from clock_timestamp())*1000))`;

// Users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  name: text("name"),
  nickname: text("nickname").notNull(),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").notNull().default("Asia/Seoul"),
  wakeWindowStartMin: integer("wake_window_start_min").notNull().default(300),
  wakeWindowEndMin: integer("wake_window_end_min").notNull().default(540),
  status: text("status").notNull().default("active"),
  authProvider: text("auth_provider").notNull(),
  lastLoginAt: bigint("last_login_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull().default(nowMs),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(nowMs),
});

// Photos
export const photos = pgTable("photos", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  format: text("format").notNull(),
  source: text("source").notNull().default("camera"),
  aspectRatio: doublePrecision("aspect_ratio"),
  capturedAt: bigint("captured_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull().default(nowMs),
});

// Check-ins
export const checkIns = pgTable(
  "check_ins",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    photoId: text("photo_id").references(() => photos.id, { onDelete: "set null" }),
    message: text("message"),
    capturedAt: bigint("captured_at", { mode: "number" }),
    deviceInfo: text("device_info"),
    lat: doublePrecision("lat"),
    lon: doublePrecision("lon"),
    verifiedSource: boolean("verified_source").notNull().default(false),
    verificationReason: text("verification_reason"),
    status: text("status").notNull().default("verified"),
    createdAt: bigint("created_at", { mode: "number" }).notNull().default(nowMs),
  },
  (t) => ({
    userDateIdx: index("checkins_user_date_idx").on(t.userId, t.date),
  })
);

// Matches
export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey(),
    checkinAId: text("checkin_a_id").notNull().references(() => checkIns.id, { onDelete: "cascade" }),
    checkinBId: text("checkin_b_id").notNull().references(() => checkIns.id, { onDelete: "cascade" }),
    matchedOn: text("matched_on").notNull(),
    status: text("status").notNull().default("active"),
    compatScore: integer("compat_score"),
    channelId: text("channel_id"),
    reason: text("reason"),
    createdAt: bigint("created_at", { mode: "number" }).notNull().default(nowMs),
  },
  (t) => ({
    matchedIdx: index("matches_matched_status_idx").on(t.matchedOn, t.status),
  })
);

// Sessions
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
    revokedAt: bigint("revoked_at", { mode: "number" }),
    createdAt: bigint("created_at", { mode: "number" }).notNull().default(nowMs),
  }
);

