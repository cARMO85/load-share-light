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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

    // Radar chart data for categories
    const radarData = Object.entries(TASK_CATEGORIES).map(([_, category]) => {
      const data = categoryBreakdown[category] || { mental: 0 };
      const result: any = {
        category: category,
        'My Load': Math.round(data.mental),
      };
      
      if (state.householdSetup.adults === 2) {
        // Calculate partner's mental load for this category
        let partnerCategoryMental = 0;
        applicableResponses.forEach(response => {
          const task = taskLookup[response.taskId];
          if (!task || task.category !== category) return;
          
          const minutes = response.estimatedMinutes;
          const mentalWeight = task.mental_load_weight;
          
          if (response.assignment === 'partner') {
            partnerCategoryMental += minutes * mentalWeight;
          } else if (response.assignment === 'shared') {
            const partnerShare = 1 - ((response.mySharePercentage || 50) / 100);
            partnerCategoryMental += minutes * mentalWeight * partnerShare;
          }
        });
        result['Partner Load'] = Math.round(partnerCategoryMental);
      }
      
      return result;
    });

    return { barData, radarData };
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

          {/* Radar Chart */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>Mental Load Profile</CardTitle>
              <CardDescription>
                Cognitive burden distribution across task categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData.radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 'dataMax']}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Radar
                    name="My Load"
                    dataKey="My Load"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  {state.householdSetup.adults === 2 && (
                    <Radar
                      name="Partner Load"
                      dataKey="Partner Load"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  )}
                  <Legend />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
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

        {/* What This Means Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle>What This Means: Understanding Your Results</CardTitle>
            <CardDescription>
              Mental load research and the importance of balance in household responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Explanations */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground mb-3">Mental Load Categories Explained</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h5 className="font-medium text-primary mb-2">Anticipation</h5>
                  <p className="text-sm text-muted-foreground">
                    Thinking ahead about what needs to be done - remembering upcoming deadlines, 
                    planning for future needs, and keeping track of household requirements before they become urgent.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <h5 className="font-medium text-secondary mb-2">Identification</h5>
                  <p className="text-sm text-muted-foreground">
                    Noticing what needs to be done - seeing when something is dirty, broken, or running low, 
                    and recognizing when household standards aren't being met.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <h5 className="font-medium text-accent mb-2">Decision-making</h5>
                  <p className="text-sm text-muted-foreground">
                    Choosing how, when, and what to do - making decisions about priorities, methods, 
                    standards, and resource allocation for household tasks.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <h5 className="font-medium text-success mb-2">Monitoring</h5>
                  <p className="text-sm text-muted-foreground">
                    Keeping track of progress and quality - ensuring tasks are completed properly, 
                    following up on delegated work, and maintaining household standards.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20 md:col-span-2">
                  <h5 className="font-medium text-warning mb-2">Emotional Labour</h5>
                  <p className="text-sm text-muted-foreground">
                    Managing feelings and relationships - providing emotional support, managing family conflicts, 
                    maintaining relationships with extended family, and ensuring everyone's emotional well-being.
                  </p>
                </div>
              </div>
            </div>

            {/* Research-Based Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground mb-3">Why Balance Matters: Research Insights</h4>
              
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <h5 className="font-medium text-destructive mb-2">Health Impact</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Research shows that excessive mental load can lead to chronic stress, anxiety, and burnout. 
                  <span className="font-medium"> Daminger (2019)</span> found that the cognitive demands of household management 
                  create a "second shift" of invisible work that can be mentally exhausting.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  "The mental work of running a household... requires sustained attention and creates cognitive fatigue" - Daminger, 2019
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <h5 className="font-medium text-warning mb-2">Relationship Impact</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Dean, Churchill, & Ruppanner (2022)</span> found that unequal distribution 
                  of mental load can create relationship tension and feelings of resentment. When one partner carries 
                  the majority of cognitive burden, it can affect relationship satisfaction and intimacy.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  "Invisible work imbalances contribute to relationship strain and reduced partnership satisfaction"
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                <h5 className="font-medium text-info mb-2">Economic Impact</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Holten (2025)</span> calculated that unpaid care work represents a significant 
                  economic burden, with the mental load component often undervalued but crucial for household functioning. 
                  The <span className="font-medium">International Labour Organization (2024)</span> estimates care work at 24% of global GDP.
                </p>
              </div>
            </div>

            {/* Personalized Insights based on results */}
            {(() => {
              if (state.householdSetup.adults !== 2) return null;
              
              const myHighestCategory = chartData.radarData.reduce((max, cat) => 
                cat['My Load'] > max['My Load'] ? cat : max, chartData.radarData[0]);
              const partnerHighestCategory = chartData.radarData.reduce((max, cat) => 
                cat['Partner Load'] > max['Partner Load'] ? cat : max, chartData.radarData[0]);
              
              return (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground mb-3">Your Results in Context</h4>
                  
                  {myHighestCategory['My Load'] > partnerHighestCategory['Partner Load'] && (
                    <div className="p-4 rounded-lg bg-orange/5 border border-orange/20">
                      <h5 className="font-medium text-orange mb-2">Mental Load Imbalance Detected</h5>
                      <p className="text-sm text-muted-foreground">
                        You appear to carry a higher mental load than your partner, particularly in <span className="font-medium">{myHighestCategory.category}</span>. 
                        Research suggests this imbalance can lead to cognitive fatigue and relationship strain over time. 
                        Consider discussing task redistribution, especially the invisible planning and monitoring aspects.
                      </p>
                    </div>
                  )}
                  
                  {myHighestCategory.category === 'Emotional Labour' && myHighestCategory['My Load'] > 50 && (
                    <div className="p-4 rounded-lg bg-purple/5 border border-purple/20">
                      <h5 className="font-medium text-purple mb-2">High Emotional Labour Load</h5>
                      <p className="text-sm text-muted-foreground">
                        You're carrying significant emotional labour responsibilities. This type of work is often undervalued 
                        but essential for family well-being. Consider sharing emotional support tasks and ensuring you have 
                        adequate support systems for your own well-being.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle>Next Steps & Recommendations</CardTitle>
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