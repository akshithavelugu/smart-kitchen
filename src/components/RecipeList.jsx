import React, { useState } from "react";
import data from "../MealMaster.json";
import VoiceSearch from "./VoiceSearch";

function RecipeList({ lang = "english" }) {
  const [query, setQuery] = useState("");
  const [diabeticOnly, setDiabeticOnly] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const allRecipes = Object.keys(data || {}).flatMap((cat) =>
    (data[cat] || []).map((r) => ({ ...r, category: cat }))
  );

  const filtered = allRecipes.filter((r) => {
    const name = (r["recipe name"]?.[lang] || r["recipe name"]?.english || "").toLowerCase();
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      name.includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.ingredients?.[lang] || []).some((ing) => ing.toLowerCase().includes(q));
    const matchesDiet = !diabeticOnly || r["dietary profiles"]?.diabetic_friendly;
    return matchesQuery && matchesDiet;
  });

  function renderInstructions(recipe) {
    const instructions =
      recipe.instructions?.[lang] ||
      recipe.instructions?.english ||
      recipe.instructions ||
      [];
    if (Array.isArray(instructions)) return instructions;
    if (typeof instructions === "string")
      return instructions.split(/\n|(?:\.\s+)/).filter(Boolean);
    return [];
  }

  return (
    <div className="section">
      <h1>🍲 Recipes</h1>

      {!selectedRecipe && (
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="Search recipes, categories, or ingredients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <VoiceSearch setQuery={setQuery} />
          <label className="diabetic-filter">
            <input
              type="checkbox"
              checked={diabeticOnly}
              onChange={(e) => setDiabeticOnly(e.target.checked)}
            />{" "}
            Diabetic Friendly
          </label>
        </div>
      )}
      {!selectedRecipe ? (
        <div className="recipe-list-grid">
          {filtered.map((r, i) => (
            <div
              key={i}
              className="recipe-list-card"
              onClick={() => setSelectedRecipe(r)}
            >
              <h2 className="recipe-name-link">
                {r["recipe name"]?.[lang] || r["recipe name"]?.english}
              </h2>
              <p className="recipe-category">({r.category})</p>
            </div>
          ))}
          {filtered.length === 0 && <p>No recipes found.</p>}
        </div>
      ) : (
        <div className="recipe-details">
          <h2>
            {selectedRecipe["recipe name"]?.[lang] ||
              selectedRecipe["recipe name"]?.english}
          </h2>

          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe["recipe name"]?.english}
              className="recipe-image"
            />
          )}

          <p>
            <strong>Category:</strong> {selectedRecipe.category}
          </p>
          <p>
            <strong>Prep:</strong>{" "}
            {selectedRecipe["prep time (minutes)"] || 0} min |{" "}
            <strong>Cook:</strong>{" "}
            {selectedRecipe["cook time (minutes)"] || 0} min
          </p>

          <h4>Ingredients</h4>
          <ul>
            {(selectedRecipe.ingredients?.[lang] ||
              selectedRecipe.ingredients?.english ||
              []).map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>

          <h4>Instructions</h4>
          <ol>
            {renderInstructions(selectedRecipe).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>

          {selectedRecipe["nutrition per serving"] && (
            <div className="nutrition-box">
              <h4>Nutrition (per serving)</h4>
              <ul>
                {Object.entries(
                  selectedRecipe["nutrition per serving"]
                ).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedRecipe["dietary profiles"] && (
            <div style={{ marginTop: 12 }}>
              <h4>Dietary Profiles</h4>
              <div>
                {Object.entries(selectedRecipe["dietary profiles"]).map(
                  ([k, v]) => (
                    <span
                      key={k}
                      className="badge"
                      style={{
                        backgroundColor: v ? "#22c55e" : "#ef4444",
                        color: "white",
                        marginRight: 8,
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {k.replace(/_/g, " ")}: {v ? "Yes" : "No"}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={() => setSelectedRecipe(null)}>🔙 Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeList;


