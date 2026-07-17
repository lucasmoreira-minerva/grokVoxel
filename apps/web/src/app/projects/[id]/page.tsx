import { DirectorBoard } from "@/features/storyboard/components/DirectorBoard";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DirectorBoard projectId={id} />;
}
