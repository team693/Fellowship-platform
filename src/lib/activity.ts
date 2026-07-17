/**
 * Native activity engine — types, answer-stripping, and server-side grading.
 *
 * An activity `spec` is authored by admins and stored in the `activities` table
 * (never sent to the browser with answers). The student receives a stripped
 * version; grading compares submitted answers to the keys on the server.
 */

export type QuestionType =
  | "mcq" // single correct option
  | "multi" // multiple correct options
  | "matching" // match left items to right items
  | "order" // drag items into the correct order
  | "numeric" // math / numeric answer with tolerance
  | "essay"; // free text, stored for admin review (not auto-scored)

interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points?: number; // default 1 (ignored for essay)
}

export interface McqQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  answer: number; // index of correct option
}
export interface MultiQuestion extends BaseQuestion {
  type: "multi";
  options: string[];
  answers: number[]; // indices of correct options
}
export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  left: string[];
  right: string[];
  pairs: Record<string, number>; // left index (string) -> right index
}
export interface OrderQuestion extends BaseQuestion {
  type: "order";
  items: string[];
  correctOrder: number[]; // item indices in the correct sequence
}
export interface NumericQuestion extends BaseQuestion {
  type: "numeric";
  answer: number;
  tolerance?: number; // default 0
  unit?: string;
}
export interface EssayQuestion extends BaseQuestion {
  type: "essay";
  minWords?: number;
}

export type Question =
  | McqQuestion
  | MultiQuestion
  | MatchingQuestion
  | OrderQuestion
  | NumericQuestion
  | EssayQuestion;

export interface ActivitySpec {
  intro?: string;
  pass_score?: number; // 0-100; default 70
  questions: Question[];
}

/** Student-facing question: answer keys removed. */
export type PublicQuestion =
  | Omit<McqQuestion, "answer">
  | Omit<MultiQuestion, "answers">
  | (Omit<MatchingQuestion, "pairs"> & { right: string[] })
  | Omit<OrderQuestion, "correctOrder">
  | Omit<NumericQuestion, "answer" | "tolerance">
  | EssayQuestion;

export interface PublicActivity {
  intro?: string;
  pass_score: number;
  questions: PublicQuestion[];
}

/** Remove everything that would reveal the correct answers. */
export function toPublicActivity(spec: ActivitySpec): PublicActivity {
  const questions: PublicQuestion[] = (spec.questions ?? []).map((q) => {
    switch (q.type) {
      case "mcq": {
        const { answer: _a, ...rest } = q;
        void _a;
        return rest;
      }
      case "multi": {
        const { answers: _a, ...rest } = q;
        void _a;
        return rest;
      }
      case "matching": {
        const { pairs: _p, ...rest } = q;
        void _p;
        // Present the right-hand options in a fixed order; the student maps to them.
        return rest;
      }
      case "order": {
        const { correctOrder: _c, ...rest } = q;
        void _c;
        return rest;
      }
      case "numeric": {
        const { answer: _a, tolerance: _t, ...rest } = q;
        void _a;
        void _t;
        return rest;
      }
      case "essay":
        return q;
    }
  });
  return {
    intro: spec.intro,
    pass_score: typeof spec.pass_score === "number" ? spec.pass_score : 70,
    questions,
  };
}

export type AnswerMap = Record<string, unknown>;

export interface GradeResult {
  score: number; // 0-100 over objective questions
  earned: number;
  total: number;
  passed: boolean;
  essayOk: boolean; // all essay questions satisfied (min words met)
  needsReview: boolean; // has essay content to review
  perQuestion: Record<string, boolean>;
}

function arraysEqualAsSets(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Grade a submission server-side. Pure function — no I/O. */
export function gradeActivity(spec: ActivitySpec, answers: AnswerMap): GradeResult {
  let earned = 0;
  let total = 0;
  let essayOk = true;
  let needsReview = false;
  const perQuestion: Record<string, boolean> = {};

  for (const q of spec.questions ?? []) {
    const points = typeof q.points === "number" ? q.points : 1;
    const a = answers[q.id];

    switch (q.type) {
      case "mcq": {
        total += points;
        const ok = typeof a === "number" && a === q.answer;
        if (ok) earned += points;
        perQuestion[q.id] = ok;
        break;
      }
      case "multi": {
        total += points;
        const arr = Array.isArray(a) ? (a as number[]).filter((n) => typeof n === "number") : [];
        const ok = arraysEqualAsSets(arr, q.answers);
        if (ok) earned += points;
        perQuestion[q.id] = ok;
        break;
      }
      case "numeric": {
        total += points;
        const tol = q.tolerance ?? 0;
        const ok = typeof a === "number" && Math.abs(a - q.answer) <= tol;
        if (ok) earned += points;
        perQuestion[q.id] = ok;
        break;
      }
      case "matching": {
        total += points;
        const submitted = (a ?? {}) as Record<string, number>;
        const keys = Object.keys(q.pairs);
        const correctPairs = keys.filter(
          (k) => Number(submitted[k]) === q.pairs[k],
        ).length;
        const frac = keys.length ? correctPairs / keys.length : 0;
        earned += points * frac;
        perQuestion[q.id] = frac === 1;
        break;
      }
      case "order": {
        total += points;
        const arr = Array.isArray(a) ? (a as number[]) : [];
        const n = q.correctOrder.length;
        const correctPos = arr.filter((v, i) => v === q.correctOrder[i]).length;
        const frac = n ? correctPos / n : 0;
        earned += points * frac;
        perQuestion[q.id] = frac === 1;
        break;
      }
      case "essay": {
        const text = typeof a === "string" ? a : "";
        const min = q.minWords ?? 0;
        const ok = wordCount(text) >= min && text.trim().length > 0;
        if (!ok) essayOk = false;
        if (text.trim().length > 0) needsReview = true;
        perQuestion[q.id] = ok;
        break;
      }
    }
  }

  // Score over objective questions. If there are none, an essay-only activity
  // scores 100 when its essay requirement is met.
  const score = total > 0 ? Math.round((earned / total) * 100) : essayOk ? 100 : 0;
  const passScore = typeof spec.pass_score === "number" ? spec.pass_score : 70;
  const passed = score >= passScore && essayOk;

  return { score, earned, total, passed, essayOk, needsReview, perQuestion };
}

/** Collect the essay text (concatenated) for storage/review. */
export function extractEssayText(spec: ActivitySpec, answers: AnswerMap): string | null {
  const parts: string[] = [];
  for (const q of spec.questions ?? []) {
    if (q.type === "essay") {
      const text = typeof answers[q.id] === "string" ? (answers[q.id] as string) : "";
      if (text.trim()) parts.push(`### ${q.prompt}\n${text.trim()}`);
    }
  }
  return parts.length ? parts.join("\n\n") : null;
}
