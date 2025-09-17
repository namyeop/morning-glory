import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/auth/google", "routes/auth.google.ts"),
  route("/auth/google/callback", "routes/auth.google.callback.ts"),
  route("/camera", "routes/camera.tsx"),
  route("/mypage", "routes/mypage.tsx"),
] satisfies RouteConfig;
