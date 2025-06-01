import { games, players, questionCards, answerCards, type Game, type Player, type QuestionCard, type AnswerCard, type InsertGame, type InsertPlayer } from "@shared/schema";

export interface IStorage {
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
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
  getRandomQuestionCard(): Promise<QuestionCard | undefined>;
  getRandomAnswerCards(count: number): Promise<AnswerCard[]>;
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private players: Map<number, Player>;
  private questionCards: QuestionCard[];
  private answerCards: AnswerCard[];
  private currentGameId: number;
  private currentPlayerId: number;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.currentGameId = 1;
    this.currentPlayerId = 1;
    
    // Initialize with French cards
    this.questionCards = [
      { id: 1, text: "La chose la plus embarrassante que j'ai faite pour _____ c'est _____.", blanks: 2, category: "general" },
      { id: 2, text: "_____ + _____ = le combo parfait pour ruiner une soirée.", blanks: 2, category: "general" },
      { id: 3, text: "Maman, pourquoi il y a _____ dans mon _____ ?", blanks: 2, category: "general" },
      { id: 4, text: "_____ : c'est ce qui manquait à ma vie pour être vraiment pathétique.", blanks: 1, category: "general" },
      { id: 5, text: "Comment j'ai découvert que _____ et _____ ne font pas bon ménage.", blanks: 2, category: "general" },
      { id: 6, text: "Mon pire cauchemar ? _____.", blanks: 1, category: "general" },
      { id: 7, text: "Le secret de ma réussite ? _____.", blanks: 1, category: "general" },
      { id: 8, text: "_____ : parfait pour impressionner belle-maman.", blanks: 1, category: "general" },
      { id: 9, text: "Qu'est-ce qui rend _____ si irrésistible ?", blanks: 1, category: "general" },
      { id: 10, text: "Lors de mon dernier rendez-vous galant, j'ai été surpris par _____.", blanks: 1, category: "general" },
    ];

    this.answerCards = [
      { id: 1, text: "de l'argent et ma dignité", category: "general" },
      { id: 2, text: "mes économies", category: "general" },
      { id: 3, text: "un pingouin unijambiste", category: "general" },
      { id: 4, text: "pleurer en position fœtale", category: "general" },
      { id: 5, text: "ma belle-mère en maillot de bain", category: "general" },
      { id: 6, text: "une vidéo YouTube qui dure 3 heures", category: "general" },
      { id: 7, text: "faire semblant d'être un expert", category: "general" },
      { id: 8, text: "des chaussettes sales", category: "general" },
      { id: 9, text: "mon ex en réunion Zoom", category: "general" },
      { id: 10, text: "un sandwich au nutella périmé", category: "general" },
      { id: 11, text: "danser nu devant mon miroir", category: "general" },
      { id: 12, text: "mes photos de profil Tinder", category: "general" },
      { id: 13, text: "un cours de yoga pour chats", category: "general" },
      { id: 14, text: "mes recherches Google à 3h du matin", category: "general" },
      { id: 15, text: "mon patron en slip de bain", category: "general" },
      { id: 16, text: "une collection de figurines de licornes", category: "general" },
      { id: 17, text: "des tacos qui se battent", category: "general" },
      { id: 18, text: "une licorne dépressive", category: "general" },
      { id: 19, text: "des pâtes qui parlent", category: "general" },
      { id: 20, text: "le WiFi de ma grand-mère", category: "general" },
      { id: 21, text: "un chat en costard", category: "general" },
      { id: 22, text: "ma dignité perdue", category: "general" },
      { id: 23, text: "des chaussettes qui sentent le fromage", category: "general" },
      { id: 24, text: "une moustache de hipster", category: "general" },
      { id: 25, text: "mon ex qui mange des céréales", category: "general" },
      { id: 26, text: "un tatouage de ma grand-mère", category: "general" },
      { id: 27, text: "pleurer en regardant des vidéos de chatons", category: "general" },
      { id: 28, text: "mon historique de recherche Google", category: "general" },
      { id: 29, text: "une passion secrète pour les romans à l'eau de rose", category: "general" },
      { id: 30, text: "mentionner mon ex 47 fois pendant le repas", category: "general" },
    ];
  }

  async createGame(game: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const newGame: Game = {
      ...game,
      id,
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
      ...player,
      id,
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

  async getRandomQuestionCard(): Promise<QuestionCard | undefined> {
    if (this.questionCards.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * this.questionCards.length);
    return this.questionCards[randomIndex];
  }

  async getRandomAnswerCards(count: number): Promise<AnswerCard[]> {
    const shuffled = [...this.answerCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const storage = new MemStorage();
