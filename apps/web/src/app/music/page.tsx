import { MUSIC_TRACKS } from "@/features/music/catalog";
import { MusicList } from "@/features/music/components/MusicList";

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Música de fundo</h1>
        <p className="text-muted mt-1">
          Preview local + import de Pixabay / YouTube Audio Library /
          Incompetech. SuperGrok não gera trilha — o assemble usa o banco limpo.
        </p>
      </div>
      <MusicList tracks={MUSIC_TRACKS} />
    </div>
  );
}
