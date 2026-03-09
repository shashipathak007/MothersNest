import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp.js";
import AppShell from "../components/layout/AppShell.jsx";
import BrandLogo from "../components/layout/BrandLogo.jsx";
import SearchBar from "../components/dashboard/SearchBar.jsx";
import RiskFilterBar from "../components/dashboard/RiskFilterBar.jsx";
import StatsGrid from "../components/dashboard/StatsGrid.jsx";
import PatientTable from "../components/dashboard/PatientTable.jsx";
import PatientCardMobile from "../components/dashboard/PatientCardMobile.jsx";
import PostnatalTable from "../components/dashboard/PostnatalTable.jsx";
import PostnatalCardMobile from "../components/dashboard/PostnatalCardMobile.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import SectionLabel from "../components/ui/SectionLabel.jsx";

export default function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [riskFilter, setRisk] = useState("all");
  const [pnSearch, setPnSearch] = useState("");

  // Antenatal patients (active)
  const filtered = state.patients.filter(p => {
    const q = search.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
    const matchR = riskFilter === "all" || p.riskLevel === riskFilter;
    return matchQ && matchR;
  });

  // Postnatal patients
  const postnatal = (state.postnatalPatients || []).filter(p => {
    if (!pnSearch.trim()) return true;
    const q = pnSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
  });

  const header = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
      <BrandLogo />
      <SearchBar value={search} onChange={setSearch} className="flex-1 max-w-md hidden sm:block" />
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          {state.patients.length} active
        </span>
        <Button onClick={() => navigate("/register")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Patient</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );

  return (
    <AppShell header={header}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <SearchBar value={search} onChange={setSearch} className="sm:hidden" />
        <StatsGrid patients={state.patients} onFilter={setRisk} activeFilter={riskFilter} />
        <RiskFilterBar active={riskFilter} onChange={setRisk} count={filtered.length} />

        {/* Antenatal — Mobile */}
        <div className="lg:hidden space-y-3">
          {filtered.length === 0
            ? <Card className="p-10 text-center"><p className="text-stone-400 text-sm">No patients found.</p></Card>
            : filtered.map(p => <PatientCardMobile key={p.id} patient={p} />)
          }
        </div>
        {/* Antenatal — Desktop */}
        <PatientTable patients={filtered} />

        {/* ── Postnatal Section ── */}
        {(state.postnatalPatients || []).length > 0 && riskFilter === "all" && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                  Postnatal Patients
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">{postnatal.length} postnatal patient{postnatal.length !== 1 ? "s" : ""}</p>
              </div>
              <SearchBar value={pnSearch} onChange={setPnSearch} className="max-w-xs hidden sm:block" placeholder="Search postnatal..." />
            </div>
            <SearchBar value={pnSearch} onChange={setPnSearch} className="sm:hidden mb-3" placeholder="Search postnatal..." />

            {/* Postnatal — Mobile */}
            <div className="lg:hidden space-y-3">
              {postnatal.length === 0
                ? <Card className="p-10 text-center"><p className="text-stone-400 text-sm">No postnatal patients found.</p></Card>
                : postnatal.map(p => <PostnatalCardMobile key={p.id} patient={p} />)
              }
            </div>
            {/* Postnatal — Desktop */}
            <PostnatalTable patients={postnatal} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
