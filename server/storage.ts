import { games, players, questionCards, answerCards, type Game, type Player, type QuestionCard, type AnswerCard, type InsertGame, type InsertPlayer } from "@shared/schema";
import { QUESTION_CARDS, ANSWER_CARDS } from "../client/src/lib/gameData";

export interface IStorage {
  // Game methods
  createGame(game: InsertGame & { gameCode: string }): Promise<Game>;
  getGame(gameCode: string): Promise<Game | undefined>;
  updateGame(gameCode: string, updates: Partial<Game>): Promise<Game | undefined>;
  deleteGame(gameCode: string): Promise<boolean>;

  // Player methods
  addPlayer(player: InsertPlayer): Promise<Player>;
  getGamePlayers(gameId: number): Promise<Player[]>;
  updatePlayer(playerId: number, updates: Partial<Player>): Promise<Player | undefined>;
  removePlayer(playerId: number): Promise<boolean>;

  // Card methods
  getQuestionCards(): Promise<QuestionCard[]>;
  getAnswerCards(): Promise<AnswerCard[]>;
  getRandomQuestionCard(gameCode?: string): Promise<QuestionCard | undefined>;
  getRandomAnswerCards(count: number, gameCode?: string): Promise<AnswerCard[]>;

  // Bot methods
  addBotsToGame(gameId: number, botCount: number): Promise<Player[]>;
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private players: Map<number, Player>;
  private questionCards: QuestionCard[];
  private answerCards: AnswerCard[];
  private currentGameId: number;
  private currentPlayerId: number;
  private botNames: string[];

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.currentGameId = 1;
    this.currentPlayerId = 1;
    
    // Bot names for solo play
    this.botNames = [
      "Capitaine Sarcasme",
      "Maître Blague",
      "Professeur Humour",
      "Docteur Rire",
      "Comique Bot",
      "Sir Ironie",
      "Lady Moquerie"
    ];
    
    // Initialize with 100 question cards and 300 answer cards
    this.questionCards = QUESTION_CARDS;
    this.answerCards = ANSWER_CARDS;
  }

  async createGame(game: InsertGame & { gameCode: string }): Promise<Game> {
    const id = this.currentGameId++;
    const newGame: Game = {
      id,
      gameCode: game.gameCode,
      hostId: game.hostId,
      maxPlayers: game.maxPlayers || 6,
      winningScore: game.winningScore || 5,
      currentRound: game.currentRound || 1,
      currentJudgeIndex: game.currentJudgeIndex || 0,
      gamePhase: game.gamePhase || "setup",
      questionCard: game.questionCard || null,
      submittedAnswers: game.submittedAnswers || [],
      usedQuestionCardIds: [],
      usedAnswerCardIds: [],
      isActive: game.isActive !== undefined ? game.isActive : true,
      createdAt: new Date(),
    };
    this.games.set(game.gameCode, newGame);
    return newGame;
  }

  async getGame(gameCode: string): Promise<Game | undefined> {
    return this.games.get(gameCode);
  }

  async updateGame(gameCode: string, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(gameCode);
    if (game) {
      const updatedGame = { ...game, ...updates };
      this.games.set(gameCode, updatedGame);
      return updatedGame;
    }
    return undefined;
  }

  async deleteGame(gameCode: string): Promise<boolean> {
    return this.games.delete(gameCode);
  }

  async addPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const newPlayer: Player = {
      id,
      gameId: player.gameId || null,
      name: player.name,
      sessionId: player.sessionId,
      score: player.score || 0,
      hand: player.hand || [],
      isJudge: player.isJudge || false,
      hasSubmitted: player.hasSubmitted || false,
      joinedAt: new Date(),
    };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async getGamePlayers(gameId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.gameId === gameId);
  }

  async updatePlayer(playerId: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(playerId);
    if (player) {
      const updatedPlayer = { ...player, ...updates };
      this.players.set(playerId, updatedPlayer);
      return updatedPlayer;
    }
    return undefined;
  }

  async removePlayer(playerId: number): Promise<boolean> {
    return this.players.delete(playerId);
  }

  async getQuestionCards(): Promise<QuestionCard[]> {
    return this.questionCards;
  }

  async getAnswerCards(): Promise<AnswerCard[]> {
    return this.answerCards;
  }

  async getRandomQuestionCard(gameCode?: string): Promise<QuestionCard | undefined> {
    if (this.questionCards.length === 0) return undefined;
    
    let availableCards = this.questionCards;
    
    // Filter out used cards for this game
    if (gameCode) {
      const game = this.games.get(gameCode);
      if (game && game.usedQuestionCardIds) {
        const usedIds = Array.isArray(game.usedQuestionCardIds) ? game.usedQuestionCardIds : [];
        availableCards = this.questionCards.filter(card => !usedIds.includes(card.id));
      }
    }
    
    if (availableCards.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];
    
    // Mark card as used for this game
    if (gameCode && selectedCard) {
      const game = this.games.get(gameCode);
      if (game) {
        const usedIds = Array.isArray(game.usedQuestionCardIds) ? game.usedQuestionCardIds : [];
        const updatedGame = {
          ...game,
          usedQuestionCardIds: [...usedIds, selectedCard.id]
        };
        this.games.set(gameCode, updatedGame);
      }
    }
    
    return selectedCard;
  }

  async getRandomAnswerCards(count: number, gameCode?: string): Promise<AnswerCard[]> {
    let availableCards = this.answerCards;
    
    // Filter out used cards for this game
    if (gameCode) {
      const game = this.games.get(gameCode);
      if (game && game.usedAnswerCardIds) {
        const usedIds = Array.isArray(game.usedAnswerCardIds) ? game.usedAnswerCardIds : [];
        availableCards = this.answerCards.filter(card => !usedIds.includes(card.id));
      }
    }
    
    if (availableCards.length < count) {
      // If not enough cards available, return what we have
      count = availableCards.length;
    }
    
    const shuffled = [...availableCards].sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, count);
    
    // Mark cards as used for this game
    if (gameCode && selectedCards.length > 0) {
      const game = this.games.get(gameCode);
      if (game) {
        const usedIds = Array.isArray(game.usedAnswerCardIds) ? game.usedAnswerCardIds : [];
        const newUsedIds = selectedCards.map(card => card.id);
        const updatedGame = {
          ...game,
          usedAnswerCardIds: [...usedIds, ...newUsedIds]
        };
        this.games.set(gameCode, updatedGame);
      }
    }
    
    return selectedCards;
  }

  async addBotsToGame(gameId: number, botCount: number): Promise<Player[]> {
    const bots: Player[] = [];
    const availableBotNames = [...this.botNames];
    
    // Find the game to get the gameCode
    let gameCode: string | undefined;
    for (const [code, game] of this.games.entries()) {
      if (game.id === gameId) {
        gameCode = code;
        break;
      }
    }
    
    for (let i = 0; i < Math.min(botCount, availableBotNames.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableBotNames.length);
      const botName = availableBotNames.splice(randomIndex, 1)[0];
      
      // Get unused answer cards for this game
      const hand = await this.getRandomAnswerCards(7, gameCode);
      const bot = await this.addPlayer({
        gameId,
        name: botName,
        sessionId: `bot_${this.currentPlayerId}`,
        score: 0,
        hand,
        isJudge: false,
        hasSubmitted: false,
      });
      
      bots.push(bot);
    }
    
    return bots;
  }
}

export const storage = new MemStorage();
