/**
 * Single source of truth for all route path segments.
 * Use `AppRoutes` for route definitions and `AppPaths` for routerLink / navigation.
 */

// export const AppRoutes = {
//   PerTe: 'per-te',
//   Seguiti: 'seguiti',
//   Account: 'account',
//   Ricerca: 'ricerca',
//   Preferiti: 'preferiti',
// } as const;

/** Union of every known route segment */
// export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

/** Absolute paths ready to use in routerLink and router.navigate() */
// export const AppPaths = {
//   PerTe: `/${AppRoutes.PerTe}`,
//   Seguiti: `/${AppRoutes.Seguiti}`,
//   Account: `/${AppRoutes.Account}`,
//   Ricerca: `/${AppRoutes.Ricerca}`,
//   Preferiti: `/${AppRoutes.Preferiti}`,
// } as const;

/** Union of every known absolute path */
// export type AppPath = (typeof AppPaths)[keyof typeof AppPaths];
