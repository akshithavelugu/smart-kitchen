import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import BudgetToast from "./BudgetToast"; 

const normalize = (s) =>
  (s || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function levenshtein(a, b) {
  a = a || "";
  b = b || "";
  const an = a.length,
    bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: an + 1 }, () =>
    new Array(bn + 1).fill(0)
  );

  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[an][bn];
}

function fuzzyMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return maxLen > 0 && dist / maxLen <= 0.25;
}

function BudgetDashboard({ pantryItems = [], shoppingList = {}, mealPlan = [] }) {
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem("budget_limit");
    return saved ? Number(saved) : 1000;
  });
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    localStorage.setItem("budget_limit", String(budgetLimit));
  }, [budgetLimit]);

  const pantryValue = useMemo(
    () =>
      pantryItems.reduce(
        (sum, it) =>
          sum +
          (it.price && it.quantity
            ? Number(it.price) * Number(it.quantity)
            : 0),
        0
      ),
    [pantryItems]
  );

  const shoppingCost = useMemo(() => {
    if (!shoppingList || typeof shoppingList !== "object") return 0;

    let total = 0;
    Object.values(shoppingList).forEach((entry) => {
      if (Array.isArray(entry)) {
        entry.forEach((item) => {
          total += item.totalCost || item.price || 0;
        });
      } else if (typeof entry === "object" && entry.total) {
        total += Number(entry.total) || 0;
      }
    });
    return total;
  }, [shoppingList]);

  const totalSpending = pantryValue + shoppingCost;

  const usedIngredients = useMemo(() => {
    const set = new Set();
    mealPlan.forEach((day) => {
      const recs = Array.isArray(day?.meals) ? day.meals : [day.recipe];
      recs.forEach((r) => {
        r?.ingredients?.english?.forEach((i) => set.add(normalize(i)));
      });
    });
    return set;
  }, [mealPlan]);

  const unusedPantry = useMemo(
    () =>
      pantryItems.filter((it) => {
        const name = it.name || "";
        for (const u of usedIngredients) {
          if (fuzzyMatch(name, u)) return false;
        }
        return true;
      }),
    [pantryItems, usedIngredients]
  );

  const overBudgetItems = unusedPantry.filter(
    (it) =>
      it.price &&
      it.quantity &&
      it.price * it.quantity > budgetLimit / 3
  );

  const [lastToastState, setLastToastState] = useState({
    spending: null,
    limit: null,
    count: 0,
  });

  useEffect(() => {
    if (
      lastToastState.spending !== totalSpending ||
      lastToastState.limit !== budgetLimit
    ) {
      setLastToastState({
        spending: totalSpending,
        limit: budgetLimit,
        count: overBudgetItems.length,
      });

      if (totalSpending > budgetLimit) {
        addToast(
          `⚠️ Budget exceeded! Total ₹${totalSpending.toFixed(
            2
          )} > limit ₹${budgetLimit}.`,
          "danger"
        );
      } else {
        addToast(`✅ Within budget. You’re doing great!`, "success");
      }

      if (overBudgetItems.length > 0) {
        overBudgetItems.forEach((it) =>
          addToast(
            `🚨 ${it.name} costs ₹${(it.price * it.quantity).toFixed(
              2
            )} — above safe limit!`,
            "warning"
          )
        );
      }
    }
  }, [totalSpending, budgetLimit, overBudgetItems]);


  const chartData = [
    { name: "Pantry Value", amount: pantryValue },
    { name: "Shopping Cost", amount: shoppingCost },
    { name: "Total Spending", amount: totalSpending },
  ];

 
  const barColors = [
    "#22c55e", 
    "#2563eb", 
        totalSpending > budgetLimit ? "#ef4444" : "#f59e0b", 
  ];

  return (
    <div className="card budget-section">
      <h2>💰 Smart Budget Dashboard</h2>

      {/* Controls */}
      <div className="budget-controls">
        <label htmlFor="budget-limit">Set Your Budget (₹):</label>
        <input
          id="budget-limit"
          type="number"
          value={budgetLimit}
          onChange={(e) => setBudgetLimit(Number(e.target.value))}
          min="0"
        />
      </div>

      {/* Summary */}
      <div className="budget-summary">
        <p><strong>Pantry Value:</strong> ₹{pantryValue.toFixed(2)}</p>
        <p><strong>Shopping Cost:</strong> ₹{shoppingCost.toFixed(2)}</p>
        <p><strong>Total Spending:</strong> ₹{totalSpending.toFixed(2)}</p>
        <p><strong>Budget Limit:</strong> ₹{budgetLimit.toFixed(2)}</p>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 320, marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#e6edf3",
              }}
            />
            <Bar
              dataKey="amount"
              radius={[8, 8, 0, 0]}
              label={{ position: "top", fill: "#cbd5e1", fontSize: 12 }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Unused Pantry */}
      <div className="unused-section">
        <h3>🥫 Unused Pantry Items</h3>
        {unusedPantry.length === 0 ? (
          <p>🎉 All pantry items are being used in your meal plan.</p>
        ) : (
          <table className="unused-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {unusedPantry.map((it, idx) => (
                <tr
                  key={idx}
                  className={
                    it.price * it.quantity > budgetLimit / 3 ? "high-cost" : ""
                  }
                >
                  <td>{it.name}</td>
                  <td>{it.quantity || 1}</td>
                  <td>₹{(it.price || 0).toFixed(2)}</td>
                  <td>₹{((it.price || 0) * (it.quantity || 1)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toasts */}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        {toasts.map((toast) => (
          <BudgetToast key={toast.id} message={toast.msg} type={toast.type} />
        ))}
      </div>
    </div>
  );
}

export default BudgetDashboard;
