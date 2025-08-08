import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks, TASK_CATEGORIES } from '@/data/tasks';
import { CalculatedResults, TaskResponse } from '@/types/assessment';
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
import { RotateCcw, Download, Share2, Lightbulb, Calendar, Eye, Monitor, HeartHandshake, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, resetAssessment } = useAssessment();

  // Helper function to calculate loads using exact formula
  const calculateLoadFromResponses = (responses: typeof state.taskResponses, taskLookup: Record<string, typeof mentalLoadTasks[0]>, hasTwoAdults: boolean) => {
    let myVisibleTime = 0;
    let myMentalLoad = 0;
    let partnerVisibleTime = 0;
    let partnerMentalLoad = 0;

    const applicableResponses = responses.filter(response => !response.notApplicable);

    applicableResponses.forEach(response => {
      const task = taskLookup[response.taskId];
      if (!task) return;

      const timeInMinutes = response.estimatedMinutes;
      const mentalLoadWeight = task.mental_load_weight;

      if (response.assignment === 'me') {
        const sharePercent = (response.mySharePercentage || 100) / 100;
        myVisibleTime += timeInMinutes * sharePercent;
        myMentalLoad += timeInMinutes * mentalLoadWeight * sharePercent;
        
        const partnerSharePercent = 1 - sharePercent;
        if (hasTwoAdults && partnerSharePercent > 0) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      } else if (response.assignment === 'partner') {
        const sharePercent = (response.mySharePercentage || 0) / 100;
        myVisibleTime += timeInMinutes * sharePercent;
        myMentalLoad += timeInMinutes * mentalLoadWeight * sharePercent;
        
        const partnerSharePercent = 1 - sharePercent;
        if (hasTwoAdults) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      } else if (response.assignment === 'shared') {
        const mySharePercent = 50 / 100;
        const partnerSharePercent = 1 - mySharePercent;
        
        myVisibleTime += timeInMinutes * mySharePercent;
        myMentalLoad += timeInMinutes * mentalLoadWeight * mySharePercent;
        
        if (hasTwoAdults) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      }
    });

    const totalVisibleTime = myVisibleTime + partnerVisibleTime;
    const totalMentalLoad = myMentalLoad + partnerMentalLoad;

    return {
      myVisibleTime: Math.round(myVisibleTime),
      myMentalLoad: Math.round(myMentalLoad),
      partnerVisibleTime: hasTwoAdults ? Math.round(partnerVisibleTime) : undefined,
      partnerMentalLoad: hasTwoAdults ? Math.round(partnerMentalLoad) : undefined,
      totalVisibleTime: Math.round(totalVisibleTime),
      totalMentalLoad: Math.round(totalMentalLoad),
      myVisiblePercentage: totalVisibleTime > 0 ? Math.round((myVisibleTime / totalVisibleTime) * 100) : 0,
      myMentalPercentage: totalMentalLoad > 0 ? Math.round((myMentalLoad / totalMentalLoad) * 100) : 0,
      partnerVisiblePercentage: hasTwoAdults && totalVisibleTime > 0 
        ? Math.round((partnerVisibleTime / totalVisibleTime) * 100) : undefined,
      partnerMentalPercentage: hasTwoAdults && totalMentalLoad > 0 
        ? Math.round((partnerMentalLoad / totalMentalLoad) * 100) : undefined,
    };
  };

  // Calculate results
  const results = useMemo((): CalculatedResults => {
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);

    const myCalculations = calculateLoadFromResponses(state.taskResponses, taskLookup, state.householdSetup.adults === 2);
    
    return {
      ...myCalculations
    };
  }, [state.taskResponses, state.householdSetup]);

  // Category analysis for detailed insights
  const categoryAnalysis = useMemo(() => {
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);

    const categories = Object.values(TASK_CATEGORIES);
    const analysis: Record<string, {
      myMentalLoad: number;
      partnerMentalLoad: number;
      myPercentage: number;
      partnerPercentage: number;
      taskCount: number;
    }> = {};

    categories.forEach(category => {
      let myLoad = 0;
      let partnerLoad = 0;
      let taskCount = 0;

      state.taskResponses.forEach(response => {
        const task = taskLookup[response.taskId];
        if (!task || task.category !== category || response.notApplicable) return;

        taskCount++;
        const timeInMinutes = response.estimatedMinutes;
        const mentalLoadWeight = task.mental_load_weight;

        if (response.assignment === 'me') {
          const sharePercent = (response.mySharePercentage || 100) / 100;
          myLoad += timeInMinutes * mentalLoadWeight * sharePercent;
          if (state.householdSetup.adults === 2) {
            partnerLoad += timeInMinutes * mentalLoadWeight * (1 - sharePercent);
          }
        } else if (response.assignment === 'partner') {
          const sharePercent = (response.mySharePercentage || 0) / 100;
          myLoad += timeInMinutes * mentalLoadWeight * sharePercent;
          if (state.householdSetup.adults === 2) {
            partnerLoad += timeInMinutes * mentalLoadWeight * (1 - sharePercent);
          }
        } else if (response.assignment === 'shared') {
          const mySharePercent = 0.5;
          myLoad += timeInMinutes * mentalLoadWeight * mySharePercent;
          if (state.householdSetup.adults === 2) {
            partnerLoad += timeInMinutes * mentalLoadWeight * (1 - mySharePercent);
          }
        }
      });

      const totalLoad = myLoad + partnerLoad;
      analysis[category] = {
        myMentalLoad: Math.round(myLoad),
        partnerMentalLoad: Math.round(partnerLoad),
        myPercentage: totalLoad > 0 ? Math.round((myLoad / totalLoad) * 100) : 0,
        partnerPercentage: totalLoad > 0 ? Math.round((partnerLoad / totalLoad) * 100) : 0,
        taskCount
      };
    });

    return analysis;
  }, [state.taskResponses, state.householdSetup]);

  // Generate comprehensive personalized advice
  const personalizedAdvice = useMemo(() => {
    const advice: string[] = [];
    const isTwoAdults = state.householdSetup.adults === 2;
    
    if (!isTwoAdults) {
      advice.push("🏠 **Single Household Management**: You're managing all mental load responsibilities. This is completely normal for a single-adult household, but consider strategies for reducing overall burden through simplification, automation, and external support when possible.");
      advice.push("💡 **Self-Care Priority**: Since you're handling everything, prioritize efficiency and self-care. Consider which tasks can be simplified, automated, or delegated to services when budget allows.");
      return advice;
    }

    // Find dominant categories for each person
    const myDominantCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => data.myPercentage > 70 && data.taskCount > 0)
      .map(([category, _]) => category);

    const partnerDominantCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => data.partnerPercentage > 70 && data.taskCount > 0)
      .map(([category, _]) => category);

    // Overall mental load balance analysis
    const myTotalPercentage = results.myMentalPercentage;
    const partnerTotalPercentage = results.partnerMentalPercentage || 0;

    if (Math.abs(myTotalPercentage - 50) > 20) {
      if (myTotalPercentage > 70) {
        advice.push(`⚖️ **Significant Workload Imbalance**: You're carrying ${myTotalPercentage}% of the mental load, which is substantially higher than your partner's ${partnerTotalPercentage}%. Research by Daminger (2019) shows this level of imbalance can lead to chronic stress, relationship tension, and burnout over time.`);
        advice.push(`🔄 **Rebalancing Recommendation**: Consider having a conversation about redistributing some responsibilities. This isn't about blame - it's about creating a more sustainable household dynamic that supports both partners' well-being.`);
      } else if (myTotalPercentage < 30) {
        advice.push(`⚖️ **Partner Carries Heavier Load**: Your partner is handling ${partnerTotalPercentage}% of the mental load. While this distribution might work for your relationship dynamics, it's worth periodically checking if this feels fair and sustainable for both of you.`);
        advice.push(`🤝 **Consider Offering Support**: Look for opportunities to take on additional mental load responsibilities, especially in areas where you have capacity or interest.`);
      }
    } else {
      advice.push(`✅ **Healthy Distribution**: You have a well-balanced mental load distribution (${myTotalPercentage}% vs ${partnerTotalPercentage}%). This suggests strong collaboration in household management and is associated with better relationship satisfaction according to research by Dean et al. (2022).`);
    }

    // Detailed category-specific insights with actionable advice
    if (myDominantCategories.includes(TASK_CATEGORIES.ANTICIPATION)) {
      advice.push(`📅 **Chief Household Planner**: You're handling most **Anticipation** tasks, making you the primary forward-thinker for your household. This invisible cognitive work includes meal planning, scheduling, and thinking ahead about family needs. While crucial, this constant mental planning can be exhausting.`);
      advice.push(`💡 **Planning Tips**: Consider sharing the planning load by having your partner take ownership of specific areas (e.g., they handle all vacation planning while you handle meal planning). Digital tools like shared calendars and meal planning apps can also reduce the cognitive burden.`);
    }

    if (myDominantCategories.includes(TASK_CATEGORIES.EMOTIONAL_LABOUR)) {
      advice.push(`💕 **Emotional Manager**: You're carrying most of the **Emotional Labour** - managing family conflicts, providing emotional support, and maintaining relationships. This type of work requires constant emotional availability and can be particularly draining, as noted in Hochschild's seminal research on emotional labor.`);
      advice.push(`🗣️ **Communication Strategy**: Consider discussing emotional labor explicitly with your partner. Many people don't realize how much emotional work goes into relationship maintenance. Setting boundaries and asking for support in this area is completely valid.`);
    }

    if (myDominantCategories.includes(TASK_CATEGORIES.MONITORING)) {
      advice.push(`👀 **The Family Memory Bank**: You're responsible for most **Monitoring** tasks - tracking appointments, following up on delegated work, and ensuring quality standards. This makes you the household's memory and quality controller, but can create a sense that you're constantly "nagging."`)
      advice.push(`📋 **Delegation Strategy**: Consider creating systems that transfer monitoring responsibility to your partner for specific areas. For example, they could own all pet-related appointments and follow-ups, reducing your mental tracking load.`);
    }

    if (myDominantCategories.includes(TASK_CATEGORIES.IDENTIFICATION)) {
      advice.push(`🔍 **The Household Scanner**: You're the primary person **Identifying** what needs attention - noticing when things are dirty, broken, or running low. This constant environmental scanning is mentally taxing because it never switches off.`);
      advice.push(`👁️ **Awareness Building**: Help your partner develop their "noticing" skills by explicitly pointing out what you're seeing. Over time, this can help redistribute the identification load more evenly.`);
    }

    if (myDominantCategories.includes(TASK_CATEGORIES.DECISION_MAKING)) {
      advice.push(`🎯 **Chief Decision Maker**: You're handling most **Decision-Making** tasks - from choosing service providers to making daily priority calls. This decision fatigue can be cognitively exhausting and may impact your energy for other life decisions.`);
      advice.push(`⚖️ **Decision Distribution**: Consider creating "decision ownership" areas where your partner has full authority. This reduces your decision load and can actually improve efficiency by eliminating back-and-forth discussions.`);
    }

    // Partner strengths recognition
    if (partnerDominantCategories.length > 0) {
      const partnerStrengths = partnerDominantCategories.map(cat => {
        switch(cat) {
          case TASK_CATEGORIES.ANTICIPATION: return "future planning";
          case TASK_CATEGORIES.EMOTIONAL_LABOUR: return "emotional support";
          case TASK_CATEGORIES.MONITORING: return "progress tracking";
          case TASK_CATEGORIES.IDENTIFICATION: return "need identification";
          case TASK_CATEGORIES.DECISION_MAKING: return "decision making";
          default: return cat.toLowerCase();
        }
      }).join(" and ");
      
      advice.push(`🌟 **Partner's Strengths**: Your partner excels in ${partnerStrengths}. This contribution is valuable and helps maintain household balance. Acknowledging these strengths can improve relationship dynamics and encourage continued engagement.`);
    }

    // Shared responsibilities insight
    const sharedCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => Math.abs(data.myPercentage - 50) < 20 && data.taskCount > 0)
      .map(([category, _]) => category);

    if (sharedCategories.length > 0) {
      advice.push(`🤝 **Collaborative Success**: You're effectively sharing responsibilities in **${sharedCategories.join(', ')}**. This balanced approach helps prevent individual overwhelm and models healthy partnership dynamics.`);
    }

    // Specific recommendations based on household composition
    if (state.householdSetup.children > 0 && myDominantCategories.includes(TASK_CATEGORIES.EMOTIONAL_LABOUR)) {
      advice.push(`👨‍👩‍👧‍👦 **Parenting Load**: With children in the household, emotional labor becomes even more complex. Consider explicitly discussing how to share the emotional support, school communication, and social coordination that children require.`);
    }

    if (state.householdSetup.isEmployed && state.householdSetup.partnerEmployed) {
      advice.push(`💼 **Dual Career Considerations**: Both partners being employed adds complexity to mental load management. Consider how work schedules and stress levels impact household responsibilities, and adjust mental load distribution accordingly.`);
    }

    // Future-focused advice
    if (myDominantCategories.length > 2) {
      advice.push(`⚠️ **Overwhelm Risk**: You're dominant in multiple mental load categories (${myDominantCategories.join(', ')}), which puts you at risk for burnout. Research shows that carrying multiple types of mental load simultaneously is particularly stressful.`);
      advice.push(`🎯 **Strategic Redistribution**: Consider prioritizing one category to redistribute first. Start with the category that feels most burdensome or time-consuming, and work with your partner to transfer ownership gradually.`);
    }

    if (partnerDominantCategories.length === 0 && isTwoAdults) {
      advice.push(`🔄 **Growth Opportunity**: Your partner isn't leading in any mental load category yet. This represents an opportunity for them to take ownership of a specific area that aligns with their interests or schedule.`);
      advice.push(`💬 **Conversation Starter**: Frame this as an opportunity for your partner to contribute more meaningfully, rather than as criticism. For example: "Would you be interested in taking full ownership of [specific category] so I can focus more energy on other areas?"`);
    }

    return advice;
  }, [categoryAnalysis, results, state.householdSetup]);

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