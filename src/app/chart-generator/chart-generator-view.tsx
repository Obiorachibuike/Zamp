
'use client';

import {
  generateChart,
  type GenerateChartOutput,
} from '@/ai/flows/generate-chart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart as BarChartIcon,
  Loader2,
  User,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  LineChart,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ChartGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [chartData, setChartData] = useState<GenerateChartOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setChartData(null);

    try {
      const result = await generateChart({ prompt });
      setChartData(result);
    } catch (error) {
      console.error('Error generating chart:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the chart. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (chartData.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const getChartIcon = () => {
    if (!chartData) return <BarChartIcon className="h-6 w-6 text-primary" />;
    switch (chartData.type) {
      case 'bar':
        return <BarChartIcon className="h-6 w-6 text-primary" />;
      case 'line':
        return <LineChartIcon className="h-6 w-6 text-primary" />;
      case 'pie':
        return <PieChartIcon className="h-6 w-6 text-primary" />;
      default:
        return <BarChartIcon className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Smart Chart Generator
        </h1>
        <p className="text-muted-foreground">
          Create charts from data using natural language.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Data Prompt
              </CardTitle>
              <CardDescription>
                Describe the data you want to visualize.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Input
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Quarterly profits: Q1 $10k, Q2 $15k, Q3 $12k"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Chart
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getChartIcon()} {chartData?.title || 'Generated Chart'}
              </CardTitle>
              {chartData && (
                <CardDescription>{chartData.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating...</p>
                  </div>
                )}
                {!isLoading && !chartData && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BarChart className="h-12 w-12" />
                    <p>Your chart will appear here</p>
                  </div>
                )}
                {chartData && renderChart()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
