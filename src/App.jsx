import { useState } from "react";
import AskAI from "./Components/AskAI";
// import SocketChat from "./Components/SocketChat";

function App() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  return (
    <div style={{ fontFamily: "Roboto", padding: "20px" }}>
      {/* Uncomment to enable Socket Chat */}
      {/* <SocketChat /> */}

      <AskAI
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        aiResponse={aiResponse}
        setAiResponse={setAiResponse}
        isAiLoading={isAiLoading}
        setIsAiLoading={setIsAiLoading}
      />
    </div>
  );
}

export default App;