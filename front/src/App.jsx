import { useState } from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import LoginModal from "./components/LoginModal";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffafb] text-black">
      <Header onLogin={() => setLoginOpen(true)} />

      <Home
        onLogin={() => setLoginOpen(true)}
        onBrowse={() => alert("Recipe archive coming soon.")}
      />

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}
    </div>
  );
}