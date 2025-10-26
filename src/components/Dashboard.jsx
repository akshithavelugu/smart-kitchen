import React from "react";
import { Link } from "react-router-dom";
function Dashboard({ pantryItems = [], mealPlan = [], shoppingList = {} }) {
  const pantryCount = Array.isArray(pantryItems) ? pantryItems.length : 0;
  const mealsPlanned = Array.isArray(mealPlan)
    ? mealPlan.reduce((count, day) => {
        if (!day) return count;
        if (Array.isArray(day.meals)) return count + day.meals.length;
        if (day.recipe) return count + 1;
        return count;
      }, 0)
    : 0;
  const shoppingCount = shoppingList && typeof shoppingList === "object"
    ? Object.values(shoppingList).flat().length
    : 0;
  const lowStockCount = pantryItems.filter((it) => Number(it.quantity || 0) <= Number(it.threshold || 1)).length;
  return (
    <div className="section">
      <h1>📊 Dashboard</h1>
      <div className="dashboard-grid">
        <Link to="/pantry" className="dash-card">
          <h2>🧺 Pantry</h2>
          <p>{pantryCount} items</p>
          <p>{lowStockCount} low in stock</p>
        </Link>
        <Link to="/meal-planner" className="dash-card">
          <h2>🗓️ Meal Planner</h2>
          <p>{mealsPlanned} meals planned</p>
        </Link>
        <Link to="/shopping-list" className="dash-card">
          <h2>🛒 Shopping</h2>
          <p>{shoppingCount} items</p>
        </Link>
        <Link to="/budget" className="dash-card">
          <h2>💰 Budget</h2>
          <p>Track pantry & shopping costs</p>
        </Link>
        <Link to="/recipes" className="dash-card">
          <h2>📚 Recipes</h2>
          <p>Explore recipes in English & Telugu</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
