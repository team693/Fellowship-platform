/**
 * Feature flags. Kept in one place so a future capability can be built behind
 * a flag and enabled later without a rebuild.
 */

/**
 * In-person / team delivery mode (paired or group work, on-site facilitation).
 * Reserved for a future release — there is currently no team-mode UI in this
 * codebase to hide behind this flag; it exists so that capability, when
 * built, ships disabled by default and can be turned on without a rebuild.
 */
export const ENABLE_TEAM_MODE = false;
