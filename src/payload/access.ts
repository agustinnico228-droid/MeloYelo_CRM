import type { Access } from "payload";

/**
 * CMS roles (§12): admin = full control; manager = announcements and
 * known issues only; agents have no CMS access. These are Payload admin
 * accounts (provisioned in /admin), separate from the hub's Google
 * sign-in — the CMS holds content only, never customer data.
 */

export const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const isAdminOrManager: Access = ({ req }) =>
  req.user?.role === "admin" || req.user?.role === "manager";

export const anyone: Access = () => true;

export const nobody: Access = () => false;
