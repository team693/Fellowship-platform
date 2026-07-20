import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ModuleEmbed } from "@/components/module-embed";
import { ActivityRunner } from "@/components/activity-runner";
import { requireUser, getProfile } from "@/lib/auth";
import { ensureOpenAccessEnrollments } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveModuleContent } from "@/lib/route-lens";
import type { CompletionConfig, Fellowship, Module, ModuleVariant, Progress } from "@/lib/types";

export const metadata = { title: "Module" };

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  await ensureOpenAccessEnrollments(user.id);
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS: returns the row only if the user is enrolled (or admin).
  const { data: moduleRow } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const mod = moduleRow as Module | null;
  if (!mod) notFound();

  const [{ data: fellowshipRow }, { data: siblingRows }, { data: progressRow }, { data: variantRows }] =
    await Promise.all([
      supabase
        .from("fellowships")
        .select("id, title")
        .eq("id", mod.fellowship_id)
        .maybeSingle(),
      supabase
        .from("modules")
        .select("id, order_index")
        .eq("fellowship_id", mod.fellowship_id)
        .order("order_index", { ascending: true }),
      supabase
        .from("progress")
        .select("*")
        .eq("module_id", id)
        .maybeSingle(),
      supabase
        .from("module_variants")
        .select("lens_id, title, description, asset_path")
        .eq("module_id", id),
    ]);

  const fellowship = fellowshipRow as Pick<Fellowship, "id" | "title"> | null;
  const siblings = (siblingRows as Pick<Module, "id" | "order_index">[]) ?? [];
  const progress = progressRow as Progress | null;
  const variants = (variantRows as Pick<ModuleVariant, "lens_id" | "title" | "description" | "asset_path">[]) ?? [];

  // A lens-specific content override, if one has been authored; otherwise the
  // module's own base fields (see src/lib/route-lens.ts for the fallback rule).
  const effective = getEffectiveModuleContent(mod, variants, profile?.lens_id ?? null);

  const idx = siblings.findIndex((s) => s.id === id);
  const nextModule = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const config = (mod.completion_config ?? {}) as CompletionConfig;
  const minSeconds =
    typeof config.min_seconds === "number" ? config.min_seconds : 20;
  const passScore =
    typeof config.pass_score === "number" ? config.pass_score : null;

  const fellowshipHref = `/fellowships/${mod.fellowship_id}`;
  const nextHref = nextModule ? `/modules/${nextModule.id}` : null;

  // Native activities scroll (long question lists) — keep the standard layout.
  if (mod.kind === "activity") {
    return (
      <div className="min-h-dvh">
        <AppHeader profile={profile} />
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Link href={fellowshipHref} className="text-sm text-ink-muted hover:text-ink">
            ← {fellowship?.title ?? "Program"}
          </Link>
          <div className="mb-6 mt-3">
            <h1 className="text-2xl font-extrabold">{effective.title}</h1>
            {effective.description && (
              <p className="mt-1 max-w-2xl text-ink-soft">{effective.description}</p>
            )}
          </div>
          <ActivityRunner
            moduleId={mod.id}
            nextHref={nextHref}
            fellowshipHref={fellowshipHref}
            alreadyCompleted={progress?.status === "completed"}
          />
        </main>
      </div>
    );
  }

  // Embedded sims: full-viewport player, no leftover page scroll.
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppHeader profile={profile} />
      <div className="flex shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4 py-2">
        <Link
          href={fellowshipHref}
          className="shrink-0 text-sm text-ink-muted hover:text-ink"
        >
          ← {fellowship?.title ?? "Program"}
        </Link>
        <span className="text-ink-muted">/</span>
        <h1 className="truncate font-semibold text-ink">{effective.title}</h1>
      </div>
      <div className="min-h-0 flex-1">
        <ModuleEmbed
          moduleId={mod.id}
          title={effective.title}
          completionRule={mod.completion_rule}
          minSeconds={minSeconds}
          passScore={passScore}
          initialStatus={progress?.status ?? null}
          initialScore={progress?.score ?? null}
          nextHref={nextHref}
          fellowshipHref={fellowshipHref}
        />
      </div>
    </div>
  );
}
