import { listProjects } from "@/lib/storage/projects";
import { grokStatus } from "@/lib/grok/runner";
import { STYLE_PACKS } from "@/features/styles/catalog";
import { HomeView } from "@/features/projects/components/HomeView";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const projects = listProjects();
  const engine = grokStatus();
  return (
    <HomeView projects={projects} engine={engine} styles={STYLE_PACKS} />
  );
}
