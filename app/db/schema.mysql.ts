import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  int,
  bigint,
  double,
  text,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

// Users (minimal set for current app usage)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 191 }),
  phone: varchar("phone", { length: 32 }),
  name: varchar("name", { length: 191 }),
  nickname: varchar("nickname", { length: 191 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Asia/Seoul"),
  wakeWindowStartMin: int("wake_window_start_min").notNull().default(300),
  wakeWindowEndMin: int("wake_window_end_min").notNull().default(540),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  authProvider: varchar("auth_provider", { length: 32 }).notNull(),
  lastLoginAt: bigint("last_login_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull().default(sql`(unix_timestamp(now(3))*1000)`),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(sql`(unix_timestamp(now(3))*1000)`),
});

// Check-ins (used by home route)
export const checkIns = mysqlTable(
  "check_ins",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(),
    photoId: varchar("photo_id", { length: 36 }),
    message: text("message"),
    capturedAt: bigint("captured_at", { mode: "number" }),
    deviceInfo: text("device_info"),
    lat: double("lat"),
    lon: double("lon"),
    verifiedSource: boolean("verified_source").notNull().default(false),
    verificationReason: text("verification_reason"),
    status: varchar("status", { length: 32 }).notNull().default("verified"),
    createdAt: bigint("created_at", { mode: "number" }).notNull().default(sql`(unix_timestamp(now(3))*1000)`),
  },
  (t) => ({
    userDateIdx: index("checkins_user_date_idx").on(t.userId, t.date),
  })
);

// Extend with other tables as needed (photos, matches, sessions)

