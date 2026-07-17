import { NewProjectForm } from "@/features/director/components/NewProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Novo projeto · GrokStage</h1>
        <p className="text-[var(--muted)] mt-1">
          Escolha o estilo (skill), escreva o prompt, envie assets e revise o
          harness SuperGrok antes de gerar o storyboard.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
