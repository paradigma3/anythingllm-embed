import { SEND_TEXT_EVENT } from "../../../ChatContainer";
import { ArrowUpRight, ChatText } from "@phosphor-icons/react";
import { useEffect } from "react";

const Suggestions = ({ suggestions = [] }) => {
  useEffect(() => {
    console.log("Suggestions component received suggestions:", suggestions);
  }, [suggestions]);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="allm-flex allm-overflow-x-auto allm-gap-x-2 allm-mt-4 allm-ml-[54px] allm-mr-6">
      {suggestions.map((suggestion) => {
        if (suggestion.type === "redirect") {
          return (
            <a
              key={suggestion.id}
              href={suggestion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="allm-flex allm-items-center allm-px-4 allm-py-2 allm-rounded-lg allm-text-white allm-bg-blue-500 hover:allm-bg-blue-600 allm-transition-colors allm-duration-200 allm-text-sm allm-font-medium allm-shadow-sm"
            >
              {suggestion.text} <ArrowUpRight size={16} className="allm-ml-2" />
            </a>
          );
        } else if (suggestion.type === "message") {
          return (
            <button
              key={suggestion.id}
              onClick={() => window.dispatchEvent(new CustomEvent(SEND_TEXT_EVENT, { detail: { command: suggestion.text } }))}
              className="allm-flex allm-items-center allm-px-4 allm-py-2 allm-rounded-lg allm-text-white allm-bg-gray-600 hover:allm-bg-gray-700 allm-transition-colors allm-duration-200 allm-text-sm allm-font-medium allm-shadow-sm allm-text-left"
            >
              {suggestion.text} <ChatText size={16} className="allm-ml-2" />
            </button>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Suggestions; 