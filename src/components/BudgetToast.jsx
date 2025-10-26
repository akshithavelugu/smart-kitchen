
import React from "react";

const BudgetToast = ({ message = "", type = "info" }) => {
  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default BudgetToast;
