import React, { useState } from "react";
import data from "../MealMaster.json";

function MealPlanner({ lang = "english", initialPlan = [], onPlanChange }) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const allRecipes = Object.keys(data || {}).flatMap((cat) => data[cat] || []);
  const normalize = (plan) => {
    if (!Array.isArray(plan) || plan.length === 0) {
      return days.map(d => ({ day: d, meals: [] }));
    }
    if (plan[0] && Array.isArray(plan[0].meals)) return plan;
    return plan.map((p, i) => {
      const dayName = p.day || days[i];
      const meals = p.recipe ? [p.recipe] : [];
      return { day: dayName, meals };
    });
  };
  const [plan, setPlan] = useState(() => normalize(initialPlan));
  function addMeal(day, recipeEnglishName) {
    if (!recipeEnglishName) return;
    const recipe = allRecipes.find(r => r["recipe name"]?.english === recipeEnglishName);
    if (!recipe) return;
    setPlan(prev => prev.map(p => p.day === day ? { ...p, meals: [...p.meals, recipe] } : p));
  }
  function removeMeal(day, index) {
    setPlan(prev => prev.map(p => p.day === day ? { ...p, meals: p.meals.filter((_,i) => i !== index) } : p));
  }
  function savePlan() {
    localStorage.setItem("mealPlan", JSON.stringify(plan));
    if (onPlanChange) onPlanChange(plan);
    alert("Meal plan saved ✅");
  }
  function resetPlan() {
    const empty = days.map(d => ({ day: d, meals: [] }));
    setPlan(empty);
  }
  return (
    <div className="section">
      <h2>🗓️ Weekly Meal Planner</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={savePlan} style={{ backgroundColor: "#27ae60", color: "white" }}>Save Plan</button>
        <button onClick={resetPlan} style={{ marginLeft: 8, backgroundColor: "#e74c3c", color: "white" }}>Reset</button>
      </div>
      <div className="meal-plan-grid">
        {plan.map((p, idx) => (
          <div key={idx} className="meal-day-card">
            <h3>{p.day}</h3>

            {p.meals.length > 0 ? (
              <ul style={{ textAlign: "left" }}>
                {p.meals.map((m, i) => (
                  <li key={i}>
                    {m["recipe name"]?.[lang] || m["recipe name"]?.english}
                    <button style={{ marginLeft: 8 }} onClick={() => removeMeal(p.day, i)}>Remove</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No meals planned</p>
            )}
            <select defaultValue="" onChange={(e) => { if (e.target.value) addMeal(p.day, e.target.value); e.target.value = ""; }}>
              <option value="">-- Add recipe --</option>
              {allRecipes.map((r, i) => (
                <option key={i} value={r["recipe name"]?.english}>
                  {r["recipe name"]?.english}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MealPlanner;

