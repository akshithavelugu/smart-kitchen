import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import RecipeList from "./components/RecipeList";
import Pantry from "./components/Pantry";
import MealPlanner from "./components/MealPlanner";
import ShoppingList from "./components/ShoppingList";
import BudgetDashboard from "./components/BudgetDashboard";
import "./App.css";
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const s = localStorage.getItem("darkMode");
      return s ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });
  const toggleMode = () => {
    setDarkMode((p) => {
      const n = !p;
      localStorage.setItem("darkMode", JSON.stringify(n));
      return n;
    });
  };
  const [lang, setLang] = useState("english");
  const [pantryItems, setPantryItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pantry")) || [];
    } catch {
      return [];
    }
  });
  const [mealPlan, setMealPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mealPlan")) || [];
    } catch {
      return [];
    }
  });
  const [shoppingList, setShoppingList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shoppingList")) || {};
    } catch {
      return {};
    }
  });
  return (
    <Router>
      <div className={darkMode ? "dark" : "light"}>
        <div className="container">
          <header className="top-bar">
            <h1>🍴 Smart Kitchen Manager</h1>
            <div className="top-controls">
              <button onClick={toggleMode}>
                {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </button>
              <div className="lang-toggle">
                <button onClick={() => setLang("english")}>English</button>
                <button onClick={() => setLang("telugu")}>తెలుగు</button>
              </div>
            </div>
          </header>
          <nav className="nav-bar">
            <Link to="/">Dashboard</Link>
            <Link to="/recipes">Recipes</Link>
            <Link to="/pantry">Pantry</Link>
            <Link to="/meal-planner">Meal Planner</Link>
            <Link to="/shopping-list">Shopping List</Link>
            <Link to="/budget">Budget</Link>
          </nav>
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    pantryItems={pantryItems}
                    mealPlan={mealPlan}
                    shoppingList={shoppingList}
                  />
                }
              />
              <Route path="/recipes" element={<RecipeList lang={lang} />} />
              <Route
                path="/pantry"
                element={<Pantry onPantryChange={setPantryItems} initialItems={pantryItems} />}
              />
              <Route
                path="/meal-planner"
                element={
                  <MealPlanner
                    lang={lang}
                    pantryItems={pantryItems}
                    initialPlan={mealPlan}
                    onPlanChange={(p) => {
                      setMealPlan(p);
                      localStorage.setItem("mealPlan", JSON.stringify(p));
                    }}
                  />
                }
              />
              <Route
                path="/shopping-list"
                element={
                  <ShoppingList
                    lang={lang}
                    mealPlan={mealPlan}
                    pantryItems={pantryItems}
                    onShoppingChange={(s) => {
                      setShoppingList(s);
                      localStorage.setItem("shoppingList", JSON.stringify(s));
                    }}
                  />
                }
              />
              <Route
                path="/budget"
                element={<BudgetDashboard pantryItems={pantryItems} shoppingList={shoppingList} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

