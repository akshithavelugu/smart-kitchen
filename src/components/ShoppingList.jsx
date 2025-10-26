// src/components/ShoppingList.jsx
import React, { useEffect, useState } from "react";

function ShoppingList({ lang = "english", mealPlan = [], pantryItems = [], onShoppingChange }) {
  const [shoppingList, setShoppingList] = useState({});

  // Ingredient Prices (₹ per unit)
  const ingredientPrices = {
        rice: { price: 60, unit: "kg" },
    coconut: { price: 40, unit: "piece" },
    onion: { price: 30, unit: "kg" },
    tomato: { price: 35, unit: "kg" },
    potato: { price: 30, unit: "kg" },
    green_chilies: { price: 40, unit: "kg" },
    red_chilies: { price: 100, unit: "kg" },
    mustard_seeds: { price: 20, unit: "g" },
    urad_dal: { price: 70, unit: "kg" },
    chana_dal: { price: 110, unit: "kg" },
    curry_leaves: { price: 10, unit: "bunch" },
    hing: { price: 10, unit: "g" },
    salt: { price: 20, unit: "kg" },
    oil: { price: 150, unit: "litre" },
    wheat: { price: 55, unit: "kg" },
    flour: { price: 50, unit: "kg" },
    ghee: { price: 10, unit: "ml" },
    butter: { price: 8, unit: "cube" },
    milk: { price: 65, unit: "litre" },
    curd: { price: 50, unit: "litre" },
    paneer: { price: 100, unit: "g" },
    cheese: { price: 100, unit: "g" },
    sugar: { price: 45, unit: "kg" },
    jaggery: { price: 80, unit: "kg" },
    turmeric: { price: 1, unit: "g" },
    coriander: { price: 20, unit: "bunch" },
    cumin: { price: 2, unit: "g" },
    pepper: { price: 2, unit: "g" },
    clove: { price: 1, unit: "g" },
    cinnamon: { price: 1, unit: "g" },
    chicken: { price: 0.3, unit: "g" },
    mutton: { price: 0.8, unit: "g" },
    fish: { price: 0.6, unit: "g" },
    egg: { price: 7, unit: "piece" },
    banana: { price: 60, unit: "dozen" },
    apple: { price: 120, unit: "dozen" },
    mango: { price: 80, unit: "dozen" },
    orange: { price: 90, unit: "dozen" },
    grapes: { price: 100, unit: "kg" },
    lemon: { price: 40, unit: "dozen" },
    tamarind: { price: 50, unit: "g" },
    garlic: { price: 40, unit: "g" },
    ginger: { price: 45, unit: "g" },
    dal: { price: 110, unit: "kg" },
    beans: { price: 40, unit: "kg" },
    carrot: { price: 40, unit: "kg" },
    cabbage: { price: 35, unit: "kg" },
    brinjal: { price: 45, unit: "kg" },
    capsicum: { price: 60, unit: "kg" },
    spinach: { price: 40, unit: "bunch" },
    cauliflower: { price: 50, unit: "piece" },
    okra: { price: 45, unit: "kg" },
    beetroot: { price: 35, unit: "kg" },
  };

  const normalize = (str = "") =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  // Fuzzy name check: "cooked rice" → "rice"
  const findIngredientKey = (text) => {
    const n = normalize(text);
    for (const k of Object.keys(ingredientPrices)) {
      if (n.includes(k)) return k;
      if (n.includes(k.replace(/_/g, " "))) return k;
    }
    // plural fix
    for (const k of Object.keys(ingredientPrices)) {
      if (n.includes(k + "s") || n.includes(k + "es")) return k;
    }
    return "others";
  };

  // Extract quantity number
  const extractQty = (str) => {
    const match = str.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 1;
  };

  const inPantry = (ingredient) => {
    const norm = normalize(ingredient);
    return pantryItems.some((p) => normalize(p.name).includes(norm));
  };

  useEffect(() => {
    const list = {};

    mealPlan.forEach((day) => {
      const recs = Array.isArray(day?.meals) ? day.meals : [day.recipe];
      recs.forEach((recipe) => {
        const items = recipe?.ingredients?.[lang] || recipe?.ingredients?.english || [];
        items.forEach((ing) => {
          if (inPantry(ing)) return;
          const key = findIngredientKey(ing);
          const { price, unit } = ingredientPrices[key] || { price: 100, unit: "unit" };
          const qty = extractQty(ing);
          const cost = (price / 1) * qty * 0.1; // approximate factor

          if (!list[key]) list[key] = { qty: 0, total: 0, unit, price };
          list[key].qty += qty;
          list[key].total += cost;
        });
      });
    });

    setShoppingList(list);
    localStorage.setItem("shoppingList", JSON.stringify(list));
    if (onShoppingChange) onShoppingChange(list);
  }, [mealPlan, pantryItems, lang]);

  const total = Object.values(shoppingList).reduce((s, i) => s + i.total, 0);

  return (
    <div className="section">
      <h2>🛒 Shopping List</h2>
      {Object.keys(shoppingList).length === 0 ? (
        <p>✅ You already have everything in your pantry!</p>
      ) : (
        <>
          <div className="shopping-grid header">
            <div>Item</div>
            <div>Needed (qty)</div>
            <div>Unit Price (₹)</div>
            <div>Total (₹)</div>
          </div>
          {Object.entries(shoppingList).map(([name, data]) => (
            <div className="shopping-grid" key={name}>
              <div>{name.replace(/_/g, " ")}</div>
              <div>{data.qty.toFixed(2)} {data.unit}</div>
              <div>{data.price}</div>
              <div>₹{data.total.toFixed(2)}</div>
            </div>
          ))}
          <div className="total-summary">
            Grand Total: ₹{total.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
}

export default ShoppingList;
