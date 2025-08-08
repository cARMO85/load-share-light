import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks, TASK_CATEGORIES } from '@/data/tasks';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';
import { RotateCcw, Download, Share2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, resetAssessment } = useAssessment();

  const chartData = useMemo(() => {
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);

    // Calculate totals
    let myVisibleTime = 0;
    let myMentalLoad = 0;
    let partnerVisibleTime = 0;
    let partnerMentalLoad = 0;

    // Category breakdown
    const categoryBreakdown: Record<string, { visible: number; mental: number }> = {};
    Object.values(TASK_CATEGORIES).forEach(category => {
      categoryBreakdown[category] = { visible: 0, mental: 0 };
    });

    // Filter out not applicable tasks
    const applicableResponses = state.taskResponses.filter(response => !response.notApplicable);

    applicableResponses.forEach(response => {
      const task = taskLookup[response.taskId];
      if (!task) return;

      const minutes = response.estimatedMinutes;
      const mentalWeight = task.mental_load_weight;

      if (response.assignment === 'me') {
        // Me: 100% to me, 0% to partner
        const visibleContrib = minutes;
        const mentalContrib = minutes * mentalWeight;
        
        myVisibleTime += visibleContrib;
        myMentalLoad += mentalContrib;
        categoryBreakdown[task.category].visible += visibleContrib;
        categoryBreakdown[task.category].mental += mentalContrib;
      } else if (response.assignment === 'partner') {
        // Partner: 0% to me, 100% to partner
        if (state.householdSetup.adults === 2) {
          partnerVisibleTime += minutes;
          partnerMentalLoad += minutes * mentalWeight;
        }
      } else if (response.assignment === 'shared') {
        // Shared: use mySharePercentage (default 50%)
        const myShare = (response.mySharePercentage || 50) / 100;
        const partnerShare = 1 - myShare;
        
        const myVisibleContrib = minutes * myShare;
        const myMentalContrib = minutes * mentalWeight * myShare;
        
        myVisibleTime += myVisibleContrib;
        myMentalLoad += myMentalContrib;
        categoryBreakdown[task.category].visible += myVisibleContrib;
        categoryBreakdown[task.category].mental += myMentalContrib;
        
        if (state.householdSetup.adults === 2) {
          partnerVisibleTime += minutes * partnerShare;
          partnerMentalLoad += minutes * mentalWeight * partnerShare;
        }
      }
    });

    // Bar chart data
    const barData = [
      {
        name: 'You',
        'Visible Time (min)': Math.round(myVisibleTime),
        'Mental Load': Math.round(myMentalLoad),
      }
    ];

    if (state.householdSetup.adults === 2) {
      barData.push({
        name: 'Partner',
        'Visible Time (min)': Math.round(partnerVisibleTime),
        'Mental Load': Math.round(partnerMentalLoad),
      });
    }

    // Pie chart data for categories
    const pieData = Object.entries(categoryBreakdown)
      .filter(([_, data]) => data.mental > 0)
      .map(([category, data]) => ({
        name: category,
        value: Math.round(data.mental),
        visible: Math.round(data.visible)
      }));

    return { barData, pieData };
  }, [state.taskResponses, state.householdSetup]);

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const handleStartOver = () => {
    resetAssessment();
    navigate('/');
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--muted-foreground))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <ProgressSteps currentStep={4} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Mental Load Visualization Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive charts showing the distribution of household mental load and visible work.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>Workload Comparison</CardTitle>
              <CardDescription>
                Visible time vs mental load burden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Visible Time (min)" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="Mental Load" 
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>Mental Load by Category</CardTitle>
              <CardDescription>
                Breakdown of cognitive burden by task type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary mb-2">
                {chartData.barData.reduce((sum, item) => sum + item['Visible Time (min)'], 0)} min/week
              </div>
              <div className="text-sm text-muted-foreground">Total Visible Work</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-secondary mb-2">
                {chartData.barData.reduce((sum, item) => sum + item['Mental Load'], 0)} points
              </div>
              <div className="text-sm text-muted-foreground">Total Mental Load</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardContent className="pt-6">
               <div className="text-2xl font-bold text-accent mb-2">
                 {state.taskResponses.filter(r => !r.notApplicable).length}
               </div>
               <div className="text-sm text-muted-foreground">Tasks Assessed</div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.householdSetup.adults === 2 ? (
              <>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Partnership Balance</h4>
                  <p className="text-sm text-muted-foreground">
                    Mental load distribution can often be more uneven than visible task distribution. 
                    Consider regular check-ins to discuss invisible work and emotional labor.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <h4 className="font-semibold text-secondary mb-2">Communication Opportunity</h4>
                  <p className="text-sm text-muted-foreground">
                    Share these results with your partner to open up conversations about workload balance 
                    and identify areas where tasks could be redistributed.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Self-Awareness</h4>
                <p className="text-sm text-muted-foreground">
                  Understanding your mental load can help you make informed decisions about delegating tasks, 
                  hiring help, or adjusting expectations.
                </p>
              </div>
            )}
            
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">Highest Impact Categories</h4>
              <p className="text-sm text-muted-foreground">
                Focus on redistributing tasks in categories with the highest mental load weights: 
                Emotional Labour, Anticipation, and Decision-making typically create the most cognitive burden.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/results')}>
            View Results Summary
          </Button>
          <Button variant="soft">
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
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