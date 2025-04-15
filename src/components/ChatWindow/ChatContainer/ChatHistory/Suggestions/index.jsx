import React, { useEffect } from "react";
import { SEND_TEXT_EVENT } from "../../../ChatContainer";
import { ArrowUpRight, ChatText } from "@phosphor-icons/react";

const ITEM_CLASSES =
  "allm-flex allm-items-center allm-px-3 allm-py-1.5 allm-rounded-full " +
  "allm-bg-gray-100 allm-text-gray-800 hover:allm-bg-gray-200 " +
  "allm-transition-all allm-duration-300 allm-text-xs allm-font-medium " +
  "allm-whitespace-nowrap allm-snap-start allm-flex-shrink-0 allm-shadow-sm hover:allm-shadow-md " +
  "allm-cursor-pointer allm-border-0 allm-outline-none focus:allm-outline-none";

export default function Suggestions({ suggestions = [] }) {
  useEffect(() => {
    console.debug("Suggestions received:", suggestions);
  }, [suggestions]);

  if (!suggestions.length) return null;

  // only scroll if 3+ suggestions
  const containerMode =
    suggestions.length >= 3
      ? "allm-overflow-x-auto allm-snap-x allm-snap-mandatory allm-gap-x-2"
      : "allm-flex allm-justify-center allm-gap-x-2";

  return (
    <div className="allm-fixed allm-bottom-20 allm-left-0 allm-right-0 allm-px-4 allm-z-10">
      <div className={`allm-flex allm-pb-2 ${containerMode} allm-no-scrollbar`}>
        {suggestions.map((s) => {
          const isRedirect = s.type === "redirect";
          const Icon = isRedirect ? ArrowUpRight : ChatText;
          const commonProps = {
            className: ITEM_CLASSES,
          };

          return isRedirect ? (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              {...commonProps}
            >
              {s.text} <Icon size={16} className="allm-ml-1.5" />
            </a>
          ) : (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(SEND_TEXT_EVENT, {
                    detail: { command: s.text },
                  })
                )
              }
              {...commonProps}
            >
              {s.text} <Icon size={16} className="allm-ml-1.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
