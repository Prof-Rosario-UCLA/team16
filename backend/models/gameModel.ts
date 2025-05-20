export interface GameState {
  id: string;
  players: string[];
  round: number;
  winner: string | null;
  gameStarted: boolean;
  gameOver: boolean;
}
