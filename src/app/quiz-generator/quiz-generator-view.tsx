
'use client';

import {
  generateQuiz,
  type GenerateQuizOutput,
} from '@/ai/flows/quiz-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  User,
  HelpCircle,
  Lightbulb,
  Check,
  X,
  Clipboard,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export function QuizGeneratorView() {
  const [text, setText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setQuizData(null);
    setUserAnswers({});
    setSubmitted(false);

    try {
      const result = await generateQuiz({ text, numQuestions });
      setQuizData(result);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the quiz. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answer,
    });
  };

  const handleQuizSubmit = () => {
    if (!quizData) return;
    setSubmitted(true);
    const correctAnswers = quizData.questions.filter(
      (q, i) => userAnswers[i] === q.answer
    ).length;
    toast({
      title: 'Quiz Submitted!',
      description: `You got ${correctAnswers} out of ${quizData.questions.length} correct.`,
    });
  };

  const getScore = () => {
    if (!quizData || !submitted) return null;
    const correctAnswers = quizData.questions.filter(
      (q, i) => userAnswers[i] === q.answer
    ).length;
    return `${correctAnswers} / ${quizData.questions.length}`;
  };

  const handleCopy = () => {
    if (!quizData) return;

    const quizText = `Title: ${quizData.title}\n\n${quizData.questions
      .map((q, i) => {
        const options = q.options
          .map((opt, j) => `  ${String.fromCharCode(97 + j)}) ${opt}`)
          .join('\n');
        return `${i + 1}. ${q.question}\n${options}\n   Answer: ${q.answer}`;
      })
      .join('\n\n')}`;

    navigator.clipboard.writeText(quizText);
    toast({
      title: 'Copied!',
      description: 'The quiz content has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Quiz Generator
        </h1>
        <p className="text-muted-foreground">
          Turn any text into an interactive quiz.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Text
              </CardTitle>
              <CardDescription>
                Paste the text you want to create a quiz from.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-to-quiz">Source Text</Label>
                  <Textarea
                    id="text-to-quiz"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste a long article or study notes here..."
                    className="h-64 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-questions">
                    Number of Questions: {numQuestions}
                  </Label>
                  <Slider
                    id="num-questions"
                    min={1}
                    max={10}
                    step={1}
                    value={[numQuestions]}
                    onValueChange={(value) => setNumQuestions(value[0])}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Quiz
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-primary" />{' '}
                  {quizData?.title || 'Generated Quiz'}
                </span>
                {submitted && (
                  <span className="text-lg font-bold text-primary">{getScore()}</span>
                )}
              </CardTitle>
              {quizData && (
                <CardDescription>
                  Test your knowledge with this quiz.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] w-full rounded-lg border bg-muted p-4">
                {isLoading && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating quiz...</p>
                  </div>
                )}
                {!isLoading && !quizData && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Lightbulb className="h-12 w-12" />
                    <p>Your quiz will appear here</p>
                  </div>
                )}
                {quizData && (
                  <div className="space-y-6">
                    {quizData.questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="font-semibold">
                          {i + 1}. {q.question}
                        </p>
                        <RadioGroup
                          value={userAnswers[i]}
                          onValueChange={(value) => handleAnswerChange(i, value)}
                          disabled={submitted}
                        >
                          {q.options.map((option, j) => {
                            const isCorrect = option === q.answer;
                            const isSelected = userAnswers[i] === option;
                            return (
                              <div
                                key={j}
                                className={cn(
                                  'flex items-center space-x-2 rounded-md border p-2',
                                  submitted && isCorrect && 'border-green-500 bg-green-500/10',
                                  submitted && isSelected && !isCorrect && 'border-red-500 bg-red-500/10'
                                )}
                              >
                                <RadioGroupItem value={option} id={`q${i}o${j}`} />
                                <Label htmlFor={`q${i}o${j}`} className="flex-1 cursor-pointer">{option}</Label>
                                {submitted && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                                {submitted && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    ))}
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleQuizSubmit} 
                            disabled={submitted || !quizData || Object.keys(userAnswers).length !== quizData.questions.length}
                        >
                            Submit Quiz
                        </Button>
                        <Button variant="outline" onClick={handleCopy} disabled={!quizData}>
                            <Clipboard className="mr-2 h-4 w-4" />
                            Copy Quiz
                        </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
