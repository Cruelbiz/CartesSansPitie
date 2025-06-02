import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertPlayerSchema } from "@shared/schema";
import { z } from "zod";

function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Handle bot submissions automatically
async function handleBotSubmissions(game: any) {
  const players = await storage.getGamePlayers(game.id);
  const bots = players.filter(p => p.sessionId.startsWith('bot_') && !p.isJudge && !p.hasSubmitted);
  const questionCard = game.questionCard as any;
  const requiredCards = questionCard?.blanks || 1;

  for (const bot of bots) {
    // Select random cards from bot's hand
    const hand = bot.hand as any[] || [];
    const shuffled = [...hand].sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, requiredCards);

    // Update bot as submitted
    await storage.updatePlayer(bot.id, { hasSubmitted: true });

    // Add to submitted answers
    const submittedAnswers = game.submittedAnswers as any[] || [];
    submittedAnswers.push({
      playerId: bot.id,
      playerName: bot.name,
      cards: selectedCards,
    });

    // Check if all players have submitted
    const allPlayers = await storage.getGamePlayers(game.id);
    const nonJudgePlayers = allPlayers.filter(p => !p.isJudge);
    const submittedCount = submittedAnswers.length;

    await storage.updateGame(game.gameCode, {
      submittedAnswers,
      gamePhase: submittedCount === nonJudgePlayers.length ? "judging" : "playing",
    });
  }
}

// Handle bot judge decisions automatically
async function handleBotJudging(gameCode: string) {
  const game = await storage.getGame(gameCode);
  if (!game || game.gamePhase !== "judging") return;
  
  const players = await storage.getGamePlayers(game.id);
  const currentJudge = players.find(p => p.isJudge);
  
  if (currentJudge && currentJudge.sessionId.startsWith('bot_')) {
    // Bot judge selects random winning submission
    const submittedAnswers = game.submittedAnswers as any[] || [];
    if (submittedAnswers.length > 0) {
      const randomWinnerIndex = Math.floor(Math.random() * submittedAnswers.length);
      
      // Simulate judge selection API call
      setTimeout(async () => {
        try {
          const winningSubmission = submittedAnswers[randomWinnerIndex];
          
          // Award point to winning player
          const botGamePlayers = await storage.getGamePlayers(game.id);
          const botCurrentWinningPlayer = botGamePlayers.find(p => p.id === winningSubmission.playerId);
          if (!botCurrentWinningPlayer) return;
          
          const winningPlayer = await storage.updatePlayer(winningSubmission.playerId, {
            score: botCurrentWinningPlayer.score + 1,
          });
          
          // Check if game is over
          const isGameOver = winningPlayer!.score >= game.winningScore;
          
          // Reset for next round
          const allPlayers = await storage.getGamePlayers(game.id);
          await Promise.all(
            allPlayers.map(player => 
              storage.updatePlayer(player.id, {
                hasSubmitted: false,
                isJudge: false,
              })
            )
          );
          
          // Set next judge
          const nextJudgeIndex = (game.currentJudgeIndex + 1) % allPlayers.length;
          await storage.updatePlayer(allPlayers[nextJudgeIndex].id, { isJudge: true });
          
          // Get new question if not game over
          let newQuestionCard = null;
          if (!isGameOver) {
            newQuestionCard = await storage.getRandomQuestionCard();
          }
          
          let updatedGame = await storage.updateGame(gameCode, {
            gamePhase: isGameOver ? "ended" : "playing",
            currentJudgeIndex: nextJudgeIndex,
            currentRound: game.currentRound + 1,
            questionCard: newQuestionCard,
            submittedAnswers: [],
          });
          
          // Auto-submit for bots in new round
          if (!isGameOver && updatedGame) {
            await handleBotSubmissions(updatedGame);
          }
        } catch (error) {
          console.error("Bot judging error:", error);
        }
      }, 2000); // 2 second delay to simulate thinking
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new game
  app.post("/api/games", async (req, res) => {
    try {
      console.log("Received game creation request:", req.body);
      const gameData = insertGameSchema.parse(req.body);
      const gameCode = generateGameCode();
      
      const game = await storage.createGame({
        ...gameData,
        gameCode,
      });
      
      res.json(game);
    } catch (error) {
      console.error("Game creation error:", error);
      res.status(400).json({ error: "Invalid game data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get game by code
  app.get("/api/games/:gameCode", async (req, res) => {
    try {
      const { gameCode } = req.params;
      const game = await storage.getGame(gameCode);
      
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const players = await storage.getGamePlayers(game.id);
      
      res.json({ ...game, players });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  // Update game
  app.patch("/api/games/:gameCode", async (req, res) => {
    try {
      const { gameCode } = req.params;
      const updates = req.body;
      
      const updatedGame = await storage.updateGame(gameCode, updates);
      
      if (!updatedGame) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      res.json(updatedGame);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game" });
    }
  });

  // Join game
  app.post("/api/games/:gameCode/join", async (req, res) => {
    try {
      const { gameCode } = req.params;
      const { name } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Player name is required" });
      }
      
      const game = await storage.getGame(gameCode);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      if (!game.isActive) {
        return res.status(400).json({ error: "Game is not active" });
      }
      
      const existingPlayers = await storage.getGamePlayers(game.id);
      if (existingPlayers.length >= game.maxPlayers) {
        return res.status(400).json({ error: "Game is full" });
      }
      
      // Check if name is already taken
      if (existingPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ error: "Player name already taken" });
      }
      
      // Generate session ID
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Deal initial hand
      const hand = await storage.getRandomAnswerCards(7);
      
      const player = await storage.addPlayer({
        gameId: game.id,
        name: name.trim(),
        sessionId,
        score: 0,
        hand,
        isJudge: existingPlayers.length === 0, // First player is judge
        hasSubmitted: false,
      });
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to join game" });
    }
  });

  // Add bots to game
  app.post("/api/games/:gameCode/add-bots", async (req, res) => {
    try {
      const { gameCode } = req.params;
      const { botCount } = req.body;
      
      const game = await storage.getGame(gameCode);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const existingPlayers = await storage.getGamePlayers(game.id);
      const availableSlots = game.maxPlayers - existingPlayers.length;
      const botsToAdd = Math.min(botCount || 2, availableSlots);
      
      const bots = await storage.addBotsToGame(game.id, botsToAdd);
      
      res.json({ bots, message: `${bots.length} bots ajoutés à la partie` });
    } catch (error) {
      res.status(500).json({ error: "Failed to add bots" });
    }
  });

  // Start game
  app.post("/api/games/:gameCode/start", async (req, res) => {
    try {
      const { gameCode } = req.params;
      
      const game = await storage.getGame(gameCode);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const players = await storage.getGamePlayers(game.id);
      if (players.length < 2) {
        return res.status(400).json({ error: "Need at least 2 players to start" });
      }
      
      // Get random question card
      const questionCard = await storage.getRandomQuestionCard();
      
      let updatedGame = await storage.updateGame(gameCode, {
        gamePhase: "playing",
        questionCard,
        submittedAnswers: [],
        currentRound: 1,
      });
      
      // Auto-submit for bots at the start
      if (updatedGame) {
        await handleBotSubmissions(updatedGame);
        updatedGame = await storage.getGame(gameCode);
      }
      
      res.json(updatedGame);
    } catch (error) {
      res.status(500).json({ error: "Failed to start game" });
    }
  });

  // Submit answer
  app.post("/api/games/:gameCode/submit", async (req, res) => {
    try {
      const { gameCode } = req.params;
      const { playerId, selectedCards } = req.body;
      
      const game = await storage.getGame(gameCode);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      if (game.gamePhase !== "playing") {
        return res.status(400).json({ error: "Game is not in playing phase" });
      }
      
      const player = await storage.updatePlayer(playerId, {
        hasSubmitted: true,
      });
      
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Add to submitted answers
      const submittedAnswers = game.submittedAnswers as any[] || [];
      submittedAnswers.push({
        playerId,
        playerName: player.name,
        cards: selectedCards,
      });
      
      // Check if all non-judge players have submitted
      const players = await storage.getGamePlayers(game.id);
      const nonJudgePlayers = players.filter(p => !p.isJudge);
      const submittedCount = submittedAnswers.length;
      
      let updatedGame = await storage.updateGame(gameCode, {
        submittedAnswers,
        gamePhase: submittedCount === nonJudgePlayers.length ? "judging" : "playing",
      });
      
      // Auto-submit for bots if needed
      if (updatedGame && updatedGame.gamePhase === "playing") {
        await handleBotSubmissions(updatedGame);
        updatedGame = await storage.getGame(gameCode);
      }
      
      // Check if bot should judge
      if (updatedGame && updatedGame.gamePhase === "judging") {
        handleBotJudging(gameCode);
      }
      
      res.json(updatedGame);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  // Judge selection
  app.post("/api/games/:gameCode/judge", async (req, res) => {
    try {
      const { gameCode } = req.params;
      const { winningSubmissionIndex } = req.body;
      
      const game = await storage.getGame(gameCode);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      if (game.gamePhase !== "judging") {
        return res.status(400).json({ error: "Game is not in judging phase" });
      }
      
      const submittedAnswers = game.submittedAnswers as any[] || [];
      const winningSubmission = submittedAnswers[winningSubmissionIndex];
      
      if (!winningSubmission) {
        return res.status(400).json({ error: "Invalid winning submission" });
      }
      
      // Get current players state and award point to winning player
      const currentPlayers = await storage.getGamePlayers(game.id);
      const currentWinningPlayer = currentPlayers.find(p => p.id === winningSubmission.playerId);
      if (!currentWinningPlayer) {
        return res.status(404).json({ error: "Winning player not found" });
      }
      
      const winningPlayer = await storage.updatePlayer(winningSubmission.playerId, {
        score: currentWinningPlayer.score + 1,
      });
      
      // Check if game is over
      const isGameOver = winningPlayer!.score >= game.winningScore;
      
      // Reset for next round
      await Promise.all(
        currentPlayers.map(player => 
          storage.updatePlayer(player.id, {
            hasSubmitted: false,
            isJudge: false,
          })
        )
      );
      
      // Set next judge (get fresh player list after reset)
      const refreshedPlayers = await storage.getGamePlayers(game.id);
      const nextJudgeIndex = (game.currentJudgeIndex + 1) % refreshedPlayers.length;
      await storage.updatePlayer(refreshedPlayers[nextJudgeIndex].id, { isJudge: true });
      
      // Get new question if not game over
      let newQuestionCard = null;
      if (!isGameOver) {
        newQuestionCard = await storage.getRandomQuestionCard();
      }
      
      let updatedGame = await storage.updateGame(gameCode, {
        gamePhase: isGameOver ? "ended" : "playing",
        currentJudgeIndex: nextJudgeIndex,
        currentRound: game.currentRound + 1,
        questionCard: newQuestionCard,
        submittedAnswers: [],
      });
      
      // Auto-submit for bots in new round
      if (!isGameOver && updatedGame) {
        await handleBotSubmissions(updatedGame);
        updatedGame = await storage.getGame(gameCode);
      }
      
      res.json({ game: updatedGame, winner: winningPlayer });
    } catch (error) {
      res.status(500).json({ error: "Failed to process judge selection" });
    }
  });

  // Get cards
  app.get("/api/cards/questions", async (req, res) => {
    try {
      const cards = await storage.getQuestionCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch question cards" });
    }
  });

  app.get("/api/cards/answers", async (req, res) => {
    try {
      const cards = await storage.getAnswerCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch answer cards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
