import useGetScriptAttributes from "@/hooks/useScriptAttributes";
import useSessionId from "@/hooks/useSessionId";
import useOpenChat from "@/hooks/useOpen";
import Head from "@/components/Head";
import OpenButton from "@/components/OpenButton";
import ChatWindow from "./components/ChatWindow";
import { useEffect } from "react";
import './index.css';

export default function App() {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const embedSettings = useGetScriptAttributes();
  const sessionId = useSessionId();

  useEffect(() => {
    if (embedSettings.openOnLoad === "on") {
      toggleOpenChat(true);
    }
  }, [embedSettings.loaded]);

  if (!embedSettings.loaded) return null;

  const positionClasses = {
    "bottom-left": "allm-left-0 allm-ml-4",
    "bottom-right": "allm-right-0 allm-mr-4",
    "top-left": "allm-top-0 allm-left-0 allm-ml-4 allm-mt-4",
    "top-right": "allm-top-0 allm-right-0 allm-mr-4 allm-mt-4",
  };

  const position = embedSettings.position || "bottom-right";
  const windowWidth = embedSettings.windowWidth ?? "400px";
  const windowHeight = embedSettings.windowHeight ?? "700px";

  return (
    <>
      <Head />
      <div
        id="anything-llm-embed-chat-container"
        className={`allm-fixed allm-bottom-[80px] ${positionClasses[position]} allm-z-50 ${isChatOpen ? "allm-block" : "allm-hidden"}`}
        style={{
          width: windowWidth,
          height: windowHeight,
        }}
      >
        <div
          className={`allm-h-full allm-w-full allm-bg-white allm-rounded-2xl allm-border allm-border-gray-300 allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)] ${
            isChatOpen ? "allm-animate-slide-in" : "allm-animate-slide-out"
          }`}
          id="anything-llm-chat"
        >
          {isChatOpen && (
            <ChatWindow
              closeChat={() => toggleOpenChat(false)}
              settings={embedSettings}
              sessionId={sessionId}
              isChatOpen={isChatOpen}
            />
          )}
        </div>
      </div>
  
      {/* Ensure the button is always visible */}
      <div
        id="anything-llm-embed-chat-button-container"
        className={`allm-fixed allm-bottom-0 ${positionClasses[position]} allm-mb-4 allm-z-[60]`}
      >
        <OpenButton
          settings={embedSettings}
          isOpen={isChatOpen}
          toggleOpen={() => toggleOpenChat(!isChatOpen)}
        />
      </div>
    </>
  );
}