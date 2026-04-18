import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import { CheckinsComponent } from "./components/CheckinsComponent";
import { MessagesComponent } from "./components/MessagesComponent";
import { SightingsComponent } from "./components/SightingsComponent";
import { PersonalNotesComponent } from "./components/PersonalNotesComponent";
import { AnonymousTipsComponent } from "./components/AnonymousTipsComponent";
import { SearchPersonComponent } from "./components/SearchPersonComponent";
import { TimelineFlowComponent } from "./components/TimelineFlowComponent";

function App() {
  const [activeTab, setActiveTab] = useState("checkins");

  const renderComponent = () => {
    switch (activeTab) {
      case "checkins":
        return <CheckinsComponent />;
      case "messages":
        return <MessagesComponent />;
      case "sightings":
        return <SightingsComponent />;
      case "personalNotes":
        return <PersonalNotesComponent />;
      case "anonymousTips":
        return <AnonymousTipsComponent />;
      case "searchPerson":
        return <SearchPersonComponent />;
      case "timelineFlow":
        return <TimelineFlowComponent />;
      default:
        return <CheckinsComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 p-5 font-sans">
      <div className="bg-white rounded-xl p-8 mb-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Jotform Dashboard
        </h1>
        <div className="flex gap-3 flex-wrap">
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "checkins"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("checkins")}
          >
            📋 Checkins
          </button>
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "messages"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            💬 Messages
          </button>
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "sightings"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("sightings")}
          >
            👀 Sightings
          </button>
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "personalNotes"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("personalNotes")}
          >
            📝 Personal Notes
          </button>
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "anonymousTips"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("anonymousTips")}
          >
            🔒 Anonymous Tips
          </button>
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "searchPerson"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("searchPerson")}
          >
            🔍 Arama ve Filtreleme Yap
          </button>
          <button
            className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "timelineFlow"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("timelineFlow")}
          >
            ⏱️ Zaman Akışı
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl p-8 shadow-2xl">
        {renderComponent()}
      </div>
    </div>
  );
}

export default App;
