import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ModuleEmbed } from "@/components/module-embed";
import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CompletionConfig, Fellowship, Module, Progress } from "@/lib/types";

export const metadata = { title: "Module" };

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();
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

  const [{ data: fellowshipRow }, { data: siblingRows }, { data: progressRow }] =
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
    ]);

  const fellowship = fellowshipRow as Pick<Fellowship, "id" | "title"> | null;
  const siblings = (siblingRows as Pick<Module, "id" | "order_index">[]) ?? [];
  const progress = progressRow as Progress | null;

  const idx = siblings.findIndex((s) => s.id === id);
  const nextModule = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const config = (mod.completion_config ?? {}) as CompletionConfig;
  const minSeconds =
    typeof config.min_seconds === "number" ? config.min_seconds : 20;
  const passScore =
    typeof config.pass_score === "number" ? config.pass_score : null;

  const fellowshipHref = `/fellowships/${mod.fellowship_id}`;

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href={fellowshipHref} className="text-sm text-ink-muted hover:text-ink">
          ← {fellowship?.title ?? "Fellowship"}
        </Link>

        <div className="mb-6 mt-3">
          <h1 className="text-2xl font-extrabold">{mod.title}</h1>
          {mod.description && (
            <p className="mt-1 max-w-2xl text-ink-soft">{mod.description}</p>
          )}
        </div>

        <ModuleEmbed
          moduleId={mod.id}
          title={mod.title}
          completionRule={mod.completion_rule}
          minSeconds={minSeconds}
          passScore={passScore}
          initialStatus={progress?.status ?? null}
          initialScore={progress?.score ?? null}
          nextHref={nextModule ? `/modules/${nextModule.id}` : null}
          fellowshipHref={fellowshipHref}
        />
      </main>
    </div>
  );
}
