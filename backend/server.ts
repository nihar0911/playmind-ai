import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock AI Engine Logic
app.post('/api/analyze', (req: Request, res: Response) => {
  const { sport, scenario, action } = req.body;

  console.log(`Received analysis request: Sport: ${sport}, Scenario: ${scenario}, Action: ${action}`);

  // Default values based on sport
  let bestAction = 'pass';
  if (sport === 'cricket') bestAction = 'bowl';
  if (sport === 'baseball') bestAction = 'pitch';
  if (sport === 'tennis') bestAction = 'serve';
  
  let decisionScore = 85;
  let performanceScore = 78;
  let tacticalAwareness = 82;
  let predictionScore = 88;
  let insight = "The selected action is generally solid, but consider field positioning.";
  let prediction = "Player shows consistent awareness but could improve under pressure.";
  let suggestions = [
    "Improve scanning before executing the action.",
    "Practice quicker reaction times."
  ];

  // Simple rule-based variations
  if (scenario === 'teammate_open') {
    if (action === 'shoot') {
      bestAction = 'pass';
      decisionScore = 45;
      performanceScore = 60;
      tacticalAwareness = 50;
      insight = "Passing to the open teammate increased scoring probability by 42%.";
      prediction = "Player occasionally suffers from tunnel vision in the final third.";
      suggestions = [
        "Increase teammate awareness in high-pressure zones.",
        "Practice 2-vs-1 finishing drills."
      ];
    } else if (action === 'pass') {
      bestAction = 'pass';
      decisionScore = 95;
      performanceScore = 88;
      tacticalAwareness = 92;
      insight = "Excellent vision. Finding the open man was the optimal tactical choice.";
      prediction = "Strong playmaker potential with excellent spatial awareness.";
      suggestions = [
        "Continue scanning the field continuously.",
        "Work on passing accuracy over longer distances."
      ];
    }
  } else if (scenario === 'high_pressure') {
    if (action === 'dribble') {
      bestAction = 'pass';
      decisionScore = 30;
      performanceScore = 55;
      tacticalAwareness = 40;
      predictionScore = 50;
      insight = "Dribbling under high pressure led to a high turnover risk.";
      prediction = "Player struggles under pressure situations and tends to hold the ball too long.";
      suggestions = [
        "Improve decision-making speed.",
        "Practice one-touch passing under-pressure drills."
      ];
    } else if (action === 'pass') {
      bestAction = 'pass';
      decisionScore = 88;
      performanceScore = 85;
      tacticalAwareness = 90;
      insight = "Quick release under pressure successfully bypassed the opposition press.";
      prediction = "Composed under pressure; reliable in buildup phases.";
      suggestions = [
        "Work on weak-foot passing to open up more angles.",
        "Maintain current composure levels."
      ];
    }
  } else if (scenario === 'clear_path') {
    if (action === 'shoot') {
      bestAction = 'shoot';
      decisionScore = 92;
      performanceScore = 90;
      tacticalAwareness = 85;
      insight = "Taking the shot with a clear path was the most threatening option.";
      prediction = "Strong attacking potential and directness towards goal.";
      suggestions = [
        "Practice shooting from various distances.",
        "Work on weak-foot finishing."
      ];
    } else if (action === 'pass') {
      bestAction = 'shoot';
      decisionScore = 55;
      performanceScore = 65;
      tacticalAwareness = 60;
      insight = "Passing when having a clear path to goal reduced the direct threat.";
      prediction = "Player might lack confidence in finishing situations.";
      suggestions = [
        "Encourage taking more shots when space is available.",
        "Practice 1-on-1 finishing drills."
      ];
    }
  }

  // Simulate a slight delay to make it feel like "AI processing"
  setTimeout(() => {
    res.json({
      bestAction,
      scores: {
        decision: decisionScore,
        performance: performanceScore,
        tactical: tacticalAwareness,
        prediction: predictionScore
      },
      insight,
      prediction,
      suggestions
    });
  }, 3000);
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Engine Online' });
});

app.listen(PORT, () => {
  console.log(`PlayMind AI Backend running on http://localhost:${PORT}`);
});
