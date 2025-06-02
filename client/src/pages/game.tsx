import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GameSetup from "@/components/GameSetup";
import GameBoard from "@/components/GameBoard";
import ScoreBoard from "@/components/ScoreBoard";
import type { Game, Player } from "@shared/schema";

interface GameWithPlayers extends Game {
  players: Player[];
}

export default function Game() {
  const { gameCode } = useParams<{ gameCode?: string }>();
  const [currentGameCode, setCurrentGameCode] = useState<string | null>(gameCode || null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { toast } = useToast();

  // Fetch game data if we have a game code
  const { data: gameData, isLoading } = useQuery<GameWithPlayers>({
    queryKey: ["/api/games", currentGameCode],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/games/${currentGameCode}`);
      return res.json();
    },
    enabled: !!currentGameCode,
    refetchInterval: 2000, // Poll for updates
  });

  // Update current player from game data
  useEffect(() => {
    if (gameData && currentPlayer) {
      const updatedPlayer = gameData.players.find(p => p.id === currentPlayer.id);
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    }
  }, [gameData, currentPlayer?.id]);

  const createGameMutation = useMutation({
    mutationFn: async (gameConfig: { maxPlayers: number; winningScore: number; hostId: string }) => {
      const res = await apiRequest("POST", "/api/games", gameConfig);
      return res.json();
    },
    onSuccess: (game: Game) => {
      setCurrentGameCode(game.gameCode);
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la partie",
        variant: "destructive",
      });
    },
  });

  const joinGameMutation = useMutation({
    mutationFn: async ({ gameCode, name }: { gameCode: string; name: string }) => {
      const res = await apiRequest("POST", `/api/games/${gameCode}/join`, { name });
      return res.json();
    },
    onSuccess: (player: Player) => {
      setCurrentPlayer(player);
      queryClient.invalidateQueries({ queryKey: ["/api/games", currentGameCode] });
      toast({
        title: "Succès",
        description: "Vous avez rejoint la partie !",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rejoindre la partie",
        variant: "destructive",
      });
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async (gameCode: string) => {
      const res = await apiRequest("POST", `/api/games/${gameCode}/start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", currentGameCode] });
      toast({
        title: "Partie démarrée !",
        description: "Que le jeu commence !",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la partie",
        variant: "destructive",
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ gameCode, playerId, selectedCards }: {
      gameCode: string;
      playerId: number;
      selectedCards: any[];
    }) => {
      const res = await apiRequest("POST", `/api/games/${gameCode}/submit`, {
        playerId,
        selectedCards,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", currentGameCode] });
      toast({
        title: "Réponse soumise !",
        description: "En attente des autres joueurs...",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la réponse",
        variant: "destructive",
      });
    },
  });

  const judgeSelectionMutation = useMutation({
    mutationFn: async ({ gameCode, winningSubmissionIndex }: {
      gameCode: string;
      winningSubmissionIndex: number;
    }) => {
      const res = await apiRequest("POST", `/api/games/${gameCode}/judge`, {
        winningSubmissionIndex,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", currentGameCode] });
      toast({
        title: "Gagnant sélectionné !",
        description: "Tour terminé !",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sélectionner le gagnant",
        variant: "destructive",
      });
    },
  });

  const handleCreateGame = (config: { maxPlayers: number; winningScore: number }) => {
    createGameMutation.mutate({
      ...config,
      hostId: Math.random().toString(36).substring(2, 15),
    });
  };

  const handleJoinGame = (gameCode: string, name: string) => {
    joinGameMutation.mutate({ gameCode, name });
  };

  const handleStartGame = () => {
    if (currentGameCode) {
      startGameMutation.mutate(currentGameCode);
    }
  };

  const handleSubmitAnswer = (selectedCards: any[]) => {
    if (currentGameCode && currentPlayer) {
      submitAnswerMutation.mutate({
        gameCode: currentGameCode,
        playerId: currentPlayer.id,
        selectedCards,
      });
    }
  };

  const handleJudgeSelection = (winningSubmissionIndex: number) => {
    if (currentGameCode) {
      judgeSelectionMutation.mutate({
        gameCode: currentGameCode,
        winningSubmissionIndex,
      });
    }
  };

  const addBotsMutation = useMutation({
    mutationFn: async ({ gameCode, botCount }: { gameCode: string; botCount: number }) => {
      const res = await apiRequest("POST", `/api/games/${gameCode}/add-bots`, { botCount });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", currentGameCode] });
      toast({
        title: "Bots ajoutés !",
        description: data.message || "Les bots ont rejoint la partie",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les bots",
        variant: "destructive",
      });
    },
  });

  const handleAddBots = (botCount: number) => {
    if (currentGameCode) {
      addBotsMutation.mutate({ gameCode: currentGameCode, botCount });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Chargement...</div>
      </div>
    );
  }

  // Game setup phase
  if (!gameData || gameData.gamePhase === "setup") {
    return (
      <GameSetup
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        onStartGame={handleStartGame}
        onAddBots={handleAddBots}
        gameData={gameData}
        currentPlayer={currentPlayer}
        isCreating={createGameMutation.isPending}
        isJoining={joinGameMutation.isPending}
        isStarting={startGameMutation.isPending}
        setGameCode={setCurrentGameCode}
      />
    );
  }

  // Game over phase
  if (gameData.gamePhase === "ended") {
    return (
      <ScoreBoard
        gameData={gameData}
        onNewGame={() => {
          setCurrentGameCode(null);
          setCurrentPlayer(null);
        }}
      />
    );
  }

  // Active game phase
  return (
    <GameBoard
      gameData={gameData}
      currentPlayer={currentPlayer}
      onSubmitAnswer={handleSubmitAnswer}
      onJudgeSelection={handleJudgeSelection}
      isSubmitting={submitAnswerMutation.isPending}
      isJudging={judgeSelectionMutation.isPending}
    />
  );
}
