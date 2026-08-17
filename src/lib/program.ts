/**
 * IESP program shape (cohort 1)
 * ---------------------------------------------------------------------------
 *   Week 1     — the compulsory core. Every learner does all of it. These are
 *                the modules with no topic attached (`route_id is null`).
 *   Weeks 2-4  — the topic catalogue. Each topic is one route's set of modules.
 *                A learner must finish TOPICS_REQUIRED of them; which ones is
 *                entirely their choice.
 *
 * There is deliberately NO "chosen topics" table. A learner's picks are simply
 * the topics they complete — derived from `progress` joined to
 * `modules.route_id`, both of which already exist. That keeps the whole
 * structure a pure read over current data: no schema change, no migration, and
 * nothing to undo if cohort 1 tells us the shape is wrong.
 *
 * `profiles.route_id` keeps its column but changes meaning: it is the learner's
 * PRIMARY topic (the one their capstone is written on), not a restriction on
 * what they may open.
 */

/** Topics a learner must complete, on top of the compulsory core. */
export const TOPICS_REQUIRED = 3;

/**
 * The helper is generic over the row shapes so callers can pass either a full
 * `Module`/`Route` (the program page, which renders titles and SDGs) or a
 * narrow `select(...)` (the certificate gate, which only needs the rule).
 */
export interface ProgramModuleFields {
  id: string;
  route_id: string | null;
  is_required: boolean;
  order_index: number;
}

export interface ProgramProgressFields {
  module_id: string;
  status: "in_progress" | "completed";
}

export interface ProgramRouteFields {
  id: string;
  sort_order: number;
}

export interface TopicProgress<
  M extends ProgramModuleFields,
  R extends ProgramRouteFields,
> {
  route: R;
  modules: M[];
  /** Required modules within this topic. */
  requiredCount: number;
  completedCount: number;
  isComplete: boolean;
  isStarted: boolean;
  /** 0-1, for the topic card's progress bar. */
  fraction: number;
}

export interface ProgramStructure<
  M extends ProgramModuleFields,
  R extends ProgramRouteFields,
> {
  /** Week 1 — compulsory for everyone. */
  coreModules: M[];
  coreRequired: number;
  coreCompleted: number;
  coreComplete: boolean;

  /** Weeks 2-4 — the topic catalogue, in route sort order. */
  topics: TopicProgress<M, R>[];
  topicsCompleted: number;
  /**
   * How many topics actually have to be finished. Normally TOPICS_REQUIRED,
   * but clamped to the number of topics that exist so the gate can never be
   * mathematically unsatisfiable while content is still being authored.
   */
  topicsRequired: number;

  /** Core done AND enough topics done. */
  isComplete: boolean;
  /** 0-100 across core modules + the required number of topics. */
  percent: number;
}

/**
 * Pure function — no I/O, so the same rule can be applied on the program page,
 * the dashboard, the certificate gate, and the admin cohort table without any
 * risk of the four drifting apart.
 */
export function getProgramStructure<
  M extends ProgramModuleFields,
  R extends ProgramRouteFields,
>(
  modules: M[],
  progress: ProgramProgressFields[],
  routes: R[],
): ProgramStructure<M, R> {
  const completedModuleIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.module_id),
  );
  const startedModuleIds = new Set(progress.map((p) => p.module_id));

  // ---- Week 1: modules with no topic --------------------------------------
  const coreModules = [...modules]
    .filter((m) => !m.route_id)
    .sort((a, b) => a.order_index - b.order_index);
  const coreRequiredModules = coreModules.filter((m) => m.is_required);
  const coreCompleted = coreRequiredModules.filter((m) =>
    completedModuleIds.has(m.id),
  ).length;
  // Vacuously true while the core curriculum is still being written — an empty
  // core must not block the whole program.
  const coreComplete = coreCompleted === coreRequiredModules.length;

  // ---- Weeks 2-4: one entry per route that actually has modules -----------
  const topics = [...routes]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((route) => {
      const topicModules = modules
        .filter((m) => m.route_id === route.id)
        .sort((a, b) => a.order_index - b.order_index);
      const required = topicModules.filter((m) => m.is_required);
      const completedCount = required.filter((m) =>
        completedModuleIds.has(m.id),
      ).length;
      return {
        route,
        modules: topicModules,
        requiredCount: required.length,
        completedCount,
        // A topic with no required modules is not "complete" — it's empty.
        isComplete: required.length > 0 && completedCount === required.length,
        isStarted: topicModules.some((m) => startedModuleIds.has(m.id)),
        fraction: required.length ? completedCount / required.length : 0,
      };
    })
    .filter((t) => t.modules.length > 0);

  const topicsCompleted = topics.filter((t) => t.isComplete).length;
  const topicsRequired = Math.min(TOPICS_REQUIRED, topics.length);

  // ---- Overall -------------------------------------------------------------
  // One "unit" = one core module, or one whole topic. Partial topics earn
  // fractional credit, counting only the learner's best `topicsRequired` ones,
  // so the bar moves as they work without ever exceeding 100%.
  const bestTopicUnits = topics
    .map((t) => t.fraction)
    .sort((a, b) => b - a)
    .slice(0, topicsRequired)
    .reduce((sum, f) => sum + f, 0);

  const totalUnits = coreRequiredModules.length + topicsRequired;
  const doneUnits = coreCompleted + bestTopicUnits;
  const percent = totalUnits
    ? Math.min(100, Math.round((doneUnits / totalUnits) * 100))
    : 0;

  return {
    coreModules,
    coreRequired: coreRequiredModules.length,
    coreCompleted,
    coreComplete,
    topics,
    topicsCompleted,
    topicsRequired,
    isComplete:
      topicsRequired > 0 && coreComplete && topicsCompleted >= topicsRequired,
    percent,
  };
}

/**
 * The single module a learner should do next, for "continue where you left
 * off" nudges. Priority order mirrors how the programme is meant to be walked:
 * unfinished core first, then the topic they are mid-way through, then the
 * first fresh topic while more are still needed. Null when nothing sensible
 * remains (programme complete, or nothing published yet).
 */
export function getNextModule<
  M extends ProgramModuleFields,
  R extends ProgramRouteFields,
>(structure: ProgramStructure<M, R>, progress: ProgramProgressFields[]): M | null {
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.module_id),
  );
  const nextIn = (mods: M[]) =>
    mods.find((m) => m.is_required && !completed.has(m.id)) ?? null;

  const core = nextIn(structure.coreModules);
  if (core) return core;

  // A topic already in motion beats starting another one.
  for (const t of structure.topics) {
    if (t.isStarted && !t.isComplete) {
      const m = nextIn(t.modules);
      if (m) return m;
    }
  }
  if (structure.topicsCompleted < structure.topicsRequired) {
    for (const t of structure.topics) {
      if (!t.isStarted && !t.isComplete) {
        const m = nextIn(t.modules);
        if (m) return m;
      }
    }
  }
  return null;
}
