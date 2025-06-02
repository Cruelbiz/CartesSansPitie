import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Play, Plus } from "lucide-react";
import type { Game, Player } from "@shared/schema";

interface GameWithPlayers extends Game {
  players: Player[];
}

interface GameSetupProps {
  onCreateGame: (config: { maxPlayers: number; winningScore: number }) => void;
  onJoinGame: (gameCode: string, name: string) => void;
  onStartGame: () => void;
  onAddBots: (botCount: number) => void;
  gameData?: GameWithPlayers;
  currentPlayer?: Player | null;
  isCreating: boolean;
  isJoining: boolean;
  isStarting: boolean;
  setGameCode: (code: string | null) => void;
}

export default function GameSetup({
  onCreateGame,
  onJoinGame,
  onStartGame,
  onAddBots,
  gameData,
  currentPlayer,
  isCreating,
  isJoining,
  isStarting,
  setGameCode,
}: GameSetupProps) {
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [winningScore, setWinningScore] = useState(5);
  const [playerName, setPlayerName] = useState("");
  const [joinGameCode, setJoinGameCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [botCount, setBotCount] = useState(2);

  const handleCreateGame = () => {
    onCreateGame({ maxPlayers, winningScore });
  };

  const handleJoinGame = () => {
    if (joinGameCode.trim() && playerName.trim()) {
      onJoinGame(joinGameCode.toUpperCase(), playerName);
    }
  };

  const handleJoinExistingGame = () => {
    if (gameData && playerName.trim()) {
      onJoinGame(gameData.gameCode, playerName);
    }
  };

  const handleStartGame = () => {
    if (gameData && gameData.players.length >= 3) {
      onStartGame();
    }
  };

  // If we're in a game lobby
  if (gameData && currentPlayer) {
    const isHost = gameData.players[0]?.id === currentPlayer.id;
    const canStart = gameData.players.length >= 3 && isHost;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">🃏 Cartes Sans Pitié</h1>
            <p className="text-white/90 text-xl">Le jeu de cartes le plus hilarant entre amis !</p>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-800">
                Salon de jeu - {gameData.gameCode}
              </CardTitle>
              <p className="text-gray-600">En attente de joueurs...</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Game Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                    <Users className="mr-2 text-blue-500" />
                    Joueurs ({gameData.players.length}/{gameData.maxPlayers})
                  </h3>
                  <div className="space-y-2">
                    {gameData.players.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {player.name[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{player.name}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Crown className="w-3 h-3 mr-1" />
                              Hôte
                            </Badge>
                          )}
                        </div>
                        {player.id === currentPlayer.id && (
                          <Badge variant="outline">Vous</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700">Règles du jeu</h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Chaque joueur reçoit 7 cartes réponses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Le juge lit une carte question</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Les autres joueurs choisissent leurs meilleures réponses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Le juge choisit la réponse la plus drôle</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Premier à {gameData.winningScore} points remporte la partie !</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {canStart ? (
                  <Button
                    onClick={handleStartGame}
                    disabled={isStarting}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-6 text-lg"
                  >
                    <Play className="mr-2" />
                    {isStarting ? "Démarrage..." : "Commencer la Partie !"}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">
                      {gameData.players.length < 2
                        ? `Il faut au moins 2 joueurs pour commencer (${2 - gameData.players.length} manquant${2 - gameData.players.length > 1 ? 's' : ''})`
                        : "Seul l'hôte peut démarrer la partie"
                      }
                    </p>
                    {gameData.players.length >= 1 && isHost && (
                      <div className="mb-4">
                        <Label htmlFor="botCount" className="text-sm font-medium text-gray-700 mb-2 block">
                          Nombre de bots à ajouter
                        </Label>
                        <Select value={botCount.toString()} onValueChange={(value) => setBotCount(parseInt(value))}>
                          <SelectTrigger className="w-full mb-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 bot</SelectItem>
                            <SelectItem value="2">2 bots</SelectItem>
                            <SelectItem value="3">3 bots</SelectItem>
                            <SelectItem value="4">4 bots</SelectItem>
                            <SelectItem value="5">5 bots</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => onAddBots(botCount)}
                          size="lg"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-4 w-full"
                        >
                          <Plus className="mr-2" />
                          Ajouter {botCount} bot{botCount > 1 ? 's' : ''}
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" disabled size="lg">
                      <Play className="mr-2" />
                      En attente...
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setGameCode(null);
                  }}
                  size="lg"
                >
                  Quitter le salon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If we have a game but no player (need to join)
  if (gameData && !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Rejoindre la partie</CardTitle>
            <p className="text-center text-gray-600">Code: {gameData.gameCode}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="playerName">Votre nom</Label>
              <Input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre nom"
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleJoinExistingGame}
              disabled={!playerName.trim() || isJoining}
              className="w-full"
            >
              {isJoining ? "Connexion..." : "Rejoindre"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setGameCode(null)}
              className="w-full"
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">🃏 Cartes Sans Pitié</h1>
          <p className="text-white/90 text-xl">Le jeu de cartes le plus hilarant entre amis !</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Game */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <Plus className="mr-2" />
                Créer une partie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxPlayers">Nombre de joueurs maximum</Label>
                <Select value={maxPlayers.toString()} onValueChange={(value) => setMaxPlayers(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 joueurs</SelectItem>
                    <SelectItem value="5">5 joueurs</SelectItem>
                    <SelectItem value="6">6 joueurs</SelectItem>
                    <SelectItem value="7">7 joueurs</SelectItem>
                    <SelectItem value="8">8 joueurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="winningScore">Score pour gagner</Label>
                <Select value={winningScore.toString()} onValueChange={(value) => setWinningScore(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 points</SelectItem>
                    <SelectItem value="5">5 points</SelectItem>
                    <SelectItem value="7">7 points</SelectItem>
                    <SelectItem value="10">10 points</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isCreating ? "Création..." : "Créer la partie"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Game */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <Users className="mr-2" />
                Rejoindre une partie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showJoinForm ? (
                <Button
                  onClick={() => setShowJoinForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  J'ai un code de partie
                </Button>
              ) : (
                <>
                  <div>
                    <Label htmlFor="gameCode">Code de la partie</Label>
                    <Input
                      id="gameCode"
                      type="text"
                      value={joinGameCode}
                      onChange={(e) => setJoinGameCode(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC123"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="playerName">Votre nom</Label>
                    <Input
                      id="playerName"
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Entrez votre nom"
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleJoinGame}
                      disabled={!joinGameCode.trim() || !playerName.trim() || isJoining}
                      className="w-full"
                    >
                      {isJoining ? "Connexion..." : "Rejoindre"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowJoinForm(false)}
                      className="w-full"
                    >
                      Retour
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Comment jouer ?</h3>
                <p className="text-sm text-gray-600">
                  Demandez à un ami de créer une partie et partagez le code avec tous les joueurs.
                  Minimum 3 joueurs requis !
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
