import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, Settings } from "lucide-react";
import type { Game, Player } from "@shared/schema";

interface GameWithPlayers extends Game {
  players: Player[];
}

interface ScoreBoardProps {
  gameData: GameWithPlayers;
  onNewGame: () => void;
}

export default function ScoreBoard({ gameData, onNewGame }: ScoreBoardProps) {
  const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "🏅";
    }
  };

  const getPlayerTitle = (position: number) => {
    switch (position) {
      case 0: return "Maître de l'humour";
      case 1: return "Spécialiste du sarcasme";
      case 2: return "Apprenti comédien";
      default: return "Participant dévoué";
    }
  };

  const getGradientClass = (position: number) => {
    switch (position) {
      case 0: return "from-yellow-400 to-orange-500";
      case 1: return "from-gray-300 to-gray-400";
      case 2: return "from-amber-600 to-yellow-700";
      default: return "from-blue-400 to-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-5xl font-bold text-gray-800 mb-4">
              Victoire !
            </CardTitle>
            <p className="text-2xl text-gray-700">
              <span className="font-bold text-gray-800">{winner.name}</span> remporte la partie !
            </p>
            <Badge variant="secondary" className="bg-white/20 text-gray-800 text-lg px-4 py-2 mt-4">
              {winner.score} points sur {gameData.winningScore}
            </Badge>
          </CardHeader>

          <CardContent className="p-8">
            {/* Final Leaderboard */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
                <Trophy className="mr-2 text-yellow-500" />
                Classement final
              </h3>

              <div className="space-y-4">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-6 bg-gradient-to-r ${getGradientClass(index)} rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {getMedalEmoji(index)}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-xl">{player.name}</h4>
                        <p className="text-sm opacity-90">{getPlayerTitle(index)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{player.score}</p>
                      <p className="text-sm opacity-90">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-bold text-gray-800">Tours joués</h4>
                <p className="text-2xl font-bold text-blue-600">{gameData.currentRound - 1}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl mb-2">👥</div>
                <h4 className="font-bold text-gray-800">Joueurs</h4>
                <p className="text-2xl font-bold text-green-600">{gameData.players.length}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-2">😂</div>
                <h4 className="font-bold text-gray-800">Fous rires</h4>
                <p className="text-2xl font-bold text-purple-600">∞</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onNewGame}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-6 text-lg"
              >
                <RotateCcw className="mr-2" />
                Nouvelle partie
              </Button>
              <Button
                onClick={onNewGame}
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:bg-gray-50 font-bold px-8 py-6 text-lg"
              >
                <Settings className="mr-2" />
                Changer les paramètres
              </Button>
            </div>

            {/* Footer Message */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-lg">
                🎮 Merci d'avoir joué à Cartes Sans Pitié !
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Amusez-vous bien et restez fair-play ! 😄
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
