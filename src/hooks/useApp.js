import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be called inside <AppProvider>");
  return ctx;
}
