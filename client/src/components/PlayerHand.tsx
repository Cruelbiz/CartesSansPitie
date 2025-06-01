import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Hand } from "lucide-react";
import type { AnswerCard } from "@shared/schema";

interface PlayerHandProps {
  hand: AnswerCard[];
  selectedCards: AnswerCard[];
  onCardSelect: (card: AnswerCard) => void;
  onSubmitAnswer: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  requiredCards: number;
  hasSubmitted: boolean;
}

export default function PlayerHand({
  hand,
  selectedCards,
  onCardSelect,
  onSubmitAnswer,
  canSubmit,
  isSubmitting,
  requiredCards,
  hasSubmitted,
}: PlayerHandProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-white text-xl mb-4 flex items-center justify-between font-bold">
        <span>
          <Hand className="text-yellow-400 mr-2 inline" />
          Vos Cartes Réponse
        </span>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100">
          {hand.length} cartes
        </Badge>
      </h3>

      {hasSubmitted ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-white text-2xl font-bold mb-2">Réponse soumise !</h3>
          <p className="text-white/80">
            Patientez pendant que les autres joueurs terminent...
          </p>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            {hand.map((card) => {
              const isSelected = selectedCards.some(c => c.id === card.id);
              return (
                <Card
                  key={card.id}
                  className={`cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-yellow-400 bg-gray-800 scale-105"
                      : "border-transparent bg-gray-900 hover:border-yellow-400"
                  } text-white min-h-[120px] flex flex-col justify-between`}
                  onClick={() => onCardSelect(card)}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <p className="text-sm font-semibold leading-tight flex-grow">
                      {card.text}
                    </p>
                    <div className="mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-bold ${
                          isSelected 
                            ? "bg-yellow-500 text-yellow-900" 
                            : "bg-red-500 text-white"
                        }`}
                      >
                        RÉPONSE
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Section */}
          <div className="text-center">
            <p className="text-white/80 mb-4">
              Sélectionnez {requiredCards} carte{requiredCards > 1 ? 's' : ''} pour répondre
              {selectedCards.length > 0 && (
                <span className="text-yellow-400 font-bold">
                  {" "}({selectedCards.length}/{requiredCards} sélectionnée{selectedCards.length > 1 ? 's' : ''})
                </span>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onSubmitAnswer}
                disabled={!canSubmit || isSubmitting}
                size="lg"
                className={`bg-gradient-to-r font-bold text-lg px-8 py-6 ${
                  canSubmit
                    ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    : "from-gray-500 to-gray-600"
                } text-white transition-all duration-200 hover:scale-105 disabled:hover:scale-100`}
              >
                <Send className="mr-2" />
                {isSubmitting 
                  ? "Envoi..." 
                  : `Soumettre ${selectedCards.length > 0 ? `(${selectedCards.length}/${requiredCards})` : ''}`
                }
              </Button>
              
              {selectedCards.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Clear selection
                    selectedCards.forEach(card => onCardSelect(card));
                  }}
                  size="lg"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
