import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  questionCard: {
    text: string;
    blanks: number;
  } | null;
}

export default function QuestionCard({ questionCard }: QuestionCardProps) {
  if (!questionCard) {
    return (
      <Card className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <CardContent className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <p className="text-gray-500 text-lg">Chargement de la question...</p>
        </CardContent>
      </Card>
    );
  }

  // Replace blanks with highlighted placeholders
  const formatQuestionText = (text: string, blanks: number) => {
    let formattedText = text;
    for (let i = 0; i < blanks; i++) {
      formattedText = formattedText.replace(
        "_____",
        `<span class="bg-yellow-300 px-2 py-1 rounded font-bold text-gray-800">______</span>`
      );
    }
    return formattedText;
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 border-gray-200">
      <CardContent className="p-8">
        <div className="mb-4">
          <Badge className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Question
          </Badge>
        </div>
        <p 
          className="text-gray-800 text-2xl lg:text-3xl font-bold leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: formatQuestionText(questionCard.text, questionCard.blanks)
          }}
        />
        {questionCard.blanks > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <span className="text-blue-800 font-medium text-sm">
                💡 Choisissez {questionCard.blanks} cartes
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
