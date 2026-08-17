/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as coreValues from "../coreValues.js";
import type * as executiveMembers from "../executiveMembers.js";
import type * as gallery from "../gallery.js";
import type * as jntukPlayers from "../jntukPlayers.js";
import type * as notifications from "../notifications.js";
import type * as registrations from "../registrations.js";
import type * as rules from "../rules.js";
import type * as settings from "../settings.js";
import type * as sports from "../sports.js";
import type * as students from "../students.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  coreValues: typeof coreValues;
  executiveMembers: typeof executiveMembers;
  gallery: typeof gallery;
  jntukPlayers: typeof jntukPlayers;
  notifications: typeof notifications;
  registrations: typeof registrations;
  rules: typeof rules;
  settings: typeof settings;
  sports: typeof sports;
  students: typeof students;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
