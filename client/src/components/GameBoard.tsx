import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Clock, Trophy, History } from "lucide-react";
import QuestionCard from "./QuestionCard";
import PlayerHand from "./PlayerHand";
import type { Game, Player, AnswerCard } from "@shared/schema";

interface GameWithPlayers extends Game {
  players: Player[];
}

interface GameBoardProps {
  gameData: GameWithPlayers;
  currentPlayer: Player | null;
  onSubmitAnswer: (selectedCards: AnswerCard[]) => void;
  onJudgeSelection: (winningSubmissionIndex: number) => void;
  isSubmitting: boolean;
  isJudging: boolean;
}

export default function GameBoard({
  gameData,
  currentPlayer,
  onSubmitAnswer,
  onJudgeSelection,
  isSubmitting,
  isJudging,
}: GameBoardProps) {
  const [selectedCards, setSelectedCards] = useState<AnswerCard[]>([]);
  const [selectedWinnerIndex, setSelectedWinnerIndex] = useState<number | null>(null);

  const currentJudge = gameData.players.find(p => p.isJudge);
  const isCurrentPlayerJudge = currentPlayer?.isJudge || false;
  const submittedAnswers = (gameData.submittedAnswers as any[]) || [];
  const questionCard = gameData.questionCard as any;

  const handleCardSelect = (card: AnswerCard) => {
    const maxCards = questionCard?.blanks || 1;
    
    if (selectedCards.find(c => c.id === card.id)) {
      // Deselect card
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else if (selectedCards.length < maxCards) {
      // Select card
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedCards.length === (questionCard?.blanks || 1)) {
      onSubmitAnswer(selectedCards);
      setSelectedCards([]);
    }
  };

  const handleJudgeSelect = (index: number) => {
    setSelectedWinnerIndex(index);
    onJudgeSelection(index);
  };

  const requiredCards = questionCard?.blanks || 1;
  const canSubmit = selectedCards.length === requiredCards && !currentPlayer?.hasSubmitted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <span className="text-2xl">🃏</span>
            </div>
            <div>
              <h1 className="text-white text-2xl lg:text-3xl font-bold">Cartes Sans Pitié</h1>
              <p className="text-white/80 text-sm">Code: {gameData.gameCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white text-center hidden md:block">
              <div className="text-lg font-bold">Tour {gameData.currentRound}</div>
              <div className="text-sm opacity-80">sur {gameData.winningScore} pts</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Game Status Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-sm">JUGE ACTUEL</div>
                <div className="text-white font-bold text-lg">{currentJudge?.name}</div>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-sm">PHASE</div>
                <div className="text-white font-bold text-lg">
                  {gameData.gamePhase === "playing" ? "Sélection" : "Jugement"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Question and Submitted Answers */}
          <div className="xl:col-span-8">
            <div className="text-center mb-6">
              <h2 className="text-white text-2xl lg:text-3xl font-bold mb-4">Question du Tour</h2>
              <QuestionCard questionCard={questionCard} />
            </div>

            {/* Submitted Answers (visible during judging phase) */}
            {gameData.gamePhase === "judging" && submittedAnswers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white text-xl text-center font-bold">Réponses Soumises</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submittedAnswers.map((submission, index) => (
                    <Card
                      key={index}
                      className={`bg-gray-900 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 border-2 ${
                        selectedWinnerIndex === index
                          ? "border-yellow-400"
                          : "border-transparent hover:border-yellow-400"
                      }`}
                      onClick={() => isCurrentPlayerJudge && handleJudgeSelect(index)}
                    >
                      <CardContent className="p-6">
                        <div className="mb-2">
                          <Badge variant="secondary" className="bg-red-500 text-white">
                            Réponse {String.fromCharCode(65 + index)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {submission.cards.map((card: any, cardIndex: number) => (
                            <p key={cardIndex} className="text-lg font-semibold">
                              {card.text}
                            </p>
                          ))}
                        </div>
                        {isCurrentPlayerJudge && (
                          <Button
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJudgeSelect(index);
                            }}
                            disabled={isJudging}
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Choisir
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Players Sidebar */}
          <div className="xl:col-span-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-white text-xl mb-4 flex items-center font-bold">
                <Trophy className="text-yellow-400 mr-2" />
                Classement
              </h3>
              <div className="space-y-3">
                {gameData.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`rounded-lg p-4 ${
                        player.isJudge
                          ? "bg-yellow-500/20 border-l-4 border-yellow-400"
                          : "bg-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {player.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-bold">{player.name}</div>
                            <div className="text-white/60 text-sm">
                              {player.isJudge ? (
                                <span className="flex items-center">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Juge
                                </span>
                              ) : player.hasSubmitted ? (
                                "✓ Réponse soumise"
                              ) : gameData.gamePhase === "playing" ? (
                                "⏳ En réflexion"
                              ) : (
                                "En attente"
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-white font-bold text-xl">{player.score}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player Hand - Only show if not judge and game is in playing phase */}
        {!isCurrentPlayerJudge && gameData.gamePhase === "playing" && currentPlayer && (
          <div className="mt-8">
            <PlayerHand
              hand={currentPlayer.hand as AnswerCard[] || []}
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
              onSubmitAnswer={handleSubmitAnswer}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              requiredCards={requiredCards}
              hasSubmitted={currentPlayer.hasSubmitted}
            />
          </div>
        )}

        {/* Judge waiting message */}
        {isCurrentPlayerJudge && gameData.gamePhase === "playing" && (
          <div className="mt-8">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-8 text-center">
                <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-2">Vous êtes le juge !</h3>
                <p className="text-white/80 text-lg">
                  Patientez pendant que les autres joueurs soumettent leurs réponses...
                </p>
                <div className="mt-4">
                  <p className="text-white/60">
                    {submittedAnswers.length} / {gameData.players.filter(p => !p.isJudge).length} réponses reçues
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
