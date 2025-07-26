// src/components/Chatbot.jsx
import { useEffect } from "react";

const Chatbot = () => {
  useEffect(() => {
    // Load Dialogflow script
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
    script.async = true;
    script.id = "df-script"; // prevent duplicates
    if (!document.getElementById("df-script")) {
      document.body.appendChild(script);
    }

    // Create df-messenger
    const existingBot = document.querySelector("df-messenger");
    if (!existingBot) {
      const dfMessenger = document.createElement("df-messenger");
      dfMessenger.setAttribute("intent", "WELCOME");
      dfMessenger.setAttribute("chat-title", "SmartTrafficBot");
      dfMessenger.setAttribute("agent-id", "a2d60655-a65d-4869-b70d-66ed114063b4");
      dfMessenger.setAttribute("language-code", "en");
      document.body.appendChild(dfMessenger);
    }

    return () => {
      const bot = document.querySelector("df-messenger");
      const script = document.getElementById("df-script");
      if (bot) document.body.removeChild(bot);
      if (script) document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default Chatbot;
