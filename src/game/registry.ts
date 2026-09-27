import type { GameDefinition } from "./types";
import { override } from "./games/override";

/**
 * Central place the rest of the app asks "what games exist" and "what game
 * is active." Adding a new season is: write `games/<season>.ts` exporting a
 * `GameDefinition`, then register it here. Nothing else should need to
 * change — the field editor, simulator, debugger, and codegen all consume
 * `GameDefinition`, never a specific season's module, directly.
 */
class GameRegistry {
  private games = new Map<string, GameDefinition>();
  private activeId: string;

  constructor(initial: GameDefinition[]) {
    for (const game of initial) this.register(game);
    if (initial.length === 0) {
      throw new Error("GameRegistry requires at least one registered game.");
    }
    this.activeId = initial[0].id;
  }

  register(game: GameDefinition): void {
    if (this.games.has(game.id)) {
      throw new Error(`Game with id "${game.id}" is already registered.`);
    }
    this.games.set(game.id, game);
  }

  list(): GameDefinition[] {
    return [...this.games.values()];
  }

  get(id: string): GameDefinition {
    const game = this.games.get(id);
    if (!game) throw new Error(`Unknown game id "${id}".`);
    return game;
  }

  setActive(id: string): void {
    if (!this.games.has(id)) throw new Error(`Unknown game id "${id}".`);
    this.activeId = id;
  }

  getActive(): GameDefinition {
    return this.get(this.activeId);
  }
}

/** App-wide singleton, pre-loaded with the current season. */
export const gameRegistry = new GameRegistry([override]);

export { GameRegistry };
