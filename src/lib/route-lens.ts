import type { Module, ModuleVariant } from "@/lib/types";

/**
 * Resolves the content a learner should actually see for a module: a
 * lens-specific override if one has been authored, otherwise the module's own
 * base fields. This is the fallback rule content authoring depends on — it
 * means a route can ship with only a default/shared variant, and bespoke
 * per-lens content can be added incrementally without ever requiring all
 * (route × lens) combinations to exist.
 */
export interface EffectiveModuleContent {
  title: string;
  description: string | null;
  asset_path: string;
}

export function getEffectiveModuleContent(
  module: Pick<Module, "title" | "description" | "asset_path">,
  variants: Pick<ModuleVariant, "lens_id" | "title" | "description" | "asset_path">[],
  lensId: string | null,
): EffectiveModuleContent {
  const variant = lensId ? variants.find((v) => v.lens_id === lensId) : undefined;
  return {
    title: variant?.title || module.title,
    description: variant?.description ?? module.description,
    asset_path: variant?.asset_path || module.asset_path,
  };
}
