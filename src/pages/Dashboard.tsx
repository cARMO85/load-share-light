import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { allTaskLookup } from '@/data/allTasks';
import { calculatePersonLoad } from '@/lib/calculationUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { RotateCcw, Download, ExternalLink, BarChart3, Info, Lightbulb } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, resetAssessment } = useAssessment();

  // Use the existing task lookups from allTasks
  const taskLookup = allTaskLookup;

  // Calculate load data using the simplified system
  const loadData = useMemo(() => {
    return calculatePersonLoad(state.taskResponses, allTaskLookup);
  }, [state.taskResponses]);

  // Chart data calculations
  const chartData = useMemo(() => {
    // Create bar chart data for categories
    const barData = Object.entries(loadData.categoryScores).map(([category, score]) => ({
      category: category === 'Decision-making' ? 'Decisions' : 
                category === 'Emotional Labour' ? 'Emotional' :
                category,
      'Mental Load': Math.round(score * 100) // Convert to display scale
    }));

    // Create comparison data for both partners
    const comparisonData = [
      {
        partner: 'You',
        'Mental Load': loadData.myMentalLoad
      },
      {
        partner: 'Partner', 
        'Mental Load': loadData.partnerMentalLoad
      }
    ];

    return {
      barData,
      comparisonData,
      myMentalLoad: loadData.myMentalLoad,
      partnerMentalLoad: loadData.partnerMentalLoad
    };
  }, [loadData]);

  const steps = [
    { title: 'Household Setup', description: 'Define your household composition' },
    { title: 'Task Assessment', description: 'Evaluate your household tasks' },
    { title: 'Perception & Impact', description: 'Understand emotional impact' },
    { title: 'Results & Insights', description: 'View your mental load analysis' }
  ];

  const handleStartOver = () => {
    resetAssessment();
    navigate('/');
  };

  const handleAdviceLink = () => {
    navigate('/advice');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <ProgressSteps currentStep={4} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Your Mental Load Report
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here's what we discovered about how mental load is distributed in your household
          </p>
        </div>

        {/* Partner Comparison - Visible vs Mental Load */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Load Distribution by Partner
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAdviceLink}
                className="ml-auto text-muted-foreground hover:text-primary"
              >
                <Info className="h-4 w-4 mr-1" />
                Learn More
              </Button>
            </CardTitle>
            <CardDescription>
              Comparison of mental load between partners (load units)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="partner" 
                    tick={{ fontSize: 12 }}
                  />
                   <YAxis 
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Load Units', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} load units`,
                      name
                    ]}
                  />
                  <Bar dataKey="Mental Load" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mental Load by Category - Bar Chart */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Your Mental Load by Category
            </CardTitle>
            <CardDescription>
              Your mental load across different types of household work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Mental Load', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} load units`,
                      name
                    ]}
                  />
                  <Bar dataKey="Mental Load" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-warning" />
              Key Insights
            </CardTitle>
            <CardDescription>
              What these results reveal about your mental load
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Your Mental Load</h4>
                <p className="text-sm text-muted-foreground">
                  You're carrying {chartData.myMentalLoad} load units ({loadData.myMentalPercentage}% of total).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <h4 className="font-semibold text-secondary mb-2">Highest Category</h4>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const highest = chartData.barData.reduce((max, cat) => 
                      cat['Mental Load'] > max['Mental Load'] ? cat : max, chartData.barData[0] || {category: 'None', 'Mental Load': 0});
                    return `${highest?.category} requires the most effort with ${highest?.['Mental Load']} load units.`;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center pt-8">
          <Button variant="outline" onClick={handleAdviceLink}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Detailed Advice
          </Button>
          <Button variant="warm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleStartOver}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;