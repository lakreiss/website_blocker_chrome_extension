export interface GameConfig {
  visitCount: number;
  container: HTMLElement;
  onWin: () => void;
}

export interface Challenge {
  init: (config: GameConfig) => void;
}