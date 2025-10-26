import React, { useState, useEffect } from "react";
function Pantry({ onPantryChange, initialItems = [] }) {
  const [items, setItems] = useState(() => {
    try {
      return initialItems.length ? initialItems : JSON.parse(localStorage.getItem("pantry")) || [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({ name: "", expiry: "", quantity: 1, price: "", threshold: 1 });
  const [editingIndex, setEditingIndex] = useState(-1);
  useEffect(() => {
    localStorage.setItem("pantry", JSON.stringify(items));
    if (onPantryChange) onPantryChange(items);
  }, [items, onPantryChange]);
  useEffect(() => {
    if (!("Notification" in window)) return;
    const now = new Date();
    items.forEach((it, idx) => {
      if (it.expiry && !it.alertedExpiry) {
        const diff = Math.ceil((new Date(it.expiry) - now) / (1000 * 60 * 60 * 24));
        if (diff <= 3) {
          if (Notification.permission === "granted") new Notification(`${it.name} expires in ${diff} day(s)`);
          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, alertedExpiry: true } : p)));
        }
      }
      if (Number(it.quantity || 0) <= Number(it.threshold || 1) && !it.alertedLow) {
        if (Notification.permission === "granted") new Notification(`${it.name} is low (qty ${it.quantity})`);
        setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, alertedLow: true } : p)));
      }
    });
  }, [items]);
  const requestNotif = () => {
    if (!("Notification" in window)) return alert("Notifications not supported in this browser");
    Notification.requestPermission().then((perm) => { if (perm === "granted") alert("Notifications enabled"); });
  };
  function saveItem() {
    if (!form.name.trim()) return alert("Enter item name");
    const itemToSave = {
      ...form,
      quantity: Number(form.quantity || 0),
      price: form.price ? Number(form.price) : null,
      threshold: Number(form.threshold || 1),
      alertedExpiry: false,
      alertedLow: false,
    };
    if (editingIndex >= 0) {
      setItems((prev) => prev.map((p, i) => (i === editingIndex ? itemToSave : p)));
      setEditingIndex(-1);
    } else {
      setItems((prev) => [itemToSave, ...prev]);
    }
    setForm({ name: "", expiry: "", quantity: 1, price: "", threshold: 1 });
  }
  function editItem(idx) {
    setForm(items[idx]);
    setEditingIndex(idx);
  }
  function deleteItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function changeQty(idx, delta) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(0, Number(it.quantity || 0) + delta) } : it)));
  }
  return (
    <div className="section">
      <h2>🧺 Pantry & Inventory</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={requestNotif}>Enable Notifications</button>
      </div>
      <div className="pantry-form">
        <input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
        <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <input type="number" min="0" step="0.01" placeholder="Price/unit" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
        <button onClick={saveItem}>{editingIndex >= 0 ? "Update" : "Add"}</button>
      </div>
      <table className="inventory-table">
        <thead>
          <tr><th>Name</th><th>Qty</th><th>Threshold</th><th>Expiry</th><th>Price</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan="6">No items</td></tr>}
          {items.map((it, idx) => {
            const now = new Date();
            let expText = "N/A";
            if (it.expiry) {
              const d = Math.ceil((new Date(it.expiry) - now) / (1000 * 60 * 60 * 24));
              expText = d < 0 ? `Expired ${Math.abs(d)}d ago` : d === 0 ? "Expires today" : `In ${d} day(s)`;
            }
            const low = Number(it.quantity || 0) <= Number(it.threshold || 1);
            return (
              <tr key={idx} className={low ? "low-stock-row" : ""}>
                <td>{it.name}</td>
                <td>
                  <div className="qty-controls">
                    <button onClick={() => changeQty(idx, -1)}>-</button>
                    <span style={{ margin: "0 8px" }}>{it.quantity}</span>
                    <button onClick={() => changeQty(idx, +1)}>+</button>
                  </div>
                </td>
                <td>{it.threshold}</td>
                <td>{expText}</td>
                <td>{it.price != null ? `₹${Number(it.price).toFixed(2)}` : "-"}</td>
                <td>
                  <button onClick={() => editItem(idx)}>Edit</button>
                  <button onClick={() => deleteItem(idx)} style={{ marginLeft: 8 }}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Pantry;


