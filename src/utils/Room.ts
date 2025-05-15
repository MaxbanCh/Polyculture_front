// types/Room.ts
interface Room {
  id: string;
  code: string;
  host: string;
  players: Player[];
  selectedThemes: string[];
  status: "waiting" | "playing" | "finished";
  currentQuestion?: Question;
  scores: Record<string, number>;
}

interface Player {
  id: string;
  username: string;
  ready: boolean;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  theme?: string;
  subtheme?: string;
  type?: string;
}