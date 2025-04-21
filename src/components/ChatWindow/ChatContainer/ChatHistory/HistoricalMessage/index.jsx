import React, { memo, forwardRef } from "react";
import { Warning } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import { embedderSettings } from "@/main";
import { v4 } from "uuid";
import createDOMPurify from "dompurify";
import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import { formatDate } from "@/utils/date";
// import Suggestions from "../Suggestions";
// import GalleryWidget from "../PromptReply/GalleryWidget";

const DOMPurify = createDOMPurify(window);
const HistoricalMessage = forwardRef(
  (
    {
      uuid = v4(),
      message,
      role,
      sources = [],
      error = false,
      errorMsg = null,
      sentAt,
      suggestions = [],
      widgets = [],
    },
    ref
  ) => {
    const textSize = !!embedderSettings.settings.textSize
      ? `allm-text-[${embedderSettings.settings.textSize}px]`
      : "allm-text-sm";
    if (error) console.error(`ANYTHING_LLM_CHAT_WIDGET_ERROR: ${error}`);

    return (
      <div className="allm-mb-4 allm-w-full">
        {role === "assistant" && (
          <div
            className="allm-text-[10px] allm-text-gray-400 allm-ml-12 allm-mb-1 allm-text-left allm-font-sans"
          >
            {embedderSettings.settings.assistantName ||
              "Anything LLM Chat Assistant"}
          </div>
        )}
        <div
          key={uuid}
          ref={ref}
          className={`allm-flex allm-items-start allm-w-full ${
            role === "user" ? "allm-justify-end" : "allm-justify-start"
          }`}
        >
          {role === "assistant" && (
            <img
              src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
              alt="Anything LLM Icon"
              className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
              id="anything-llm-icon"
            />
          )}
          <div
            style={{
              wordBreak: "break-word",
              backgroundColor:
                role === "user"
                  ? embedderSettings.USER_STYLES.msgBg
                  : embedderSettings.ASSISTANT_STYLES.msgBg,
            }}
            className={`allm-p-3 allm-flex allm-flex-col allm-font-sans allm-min-h-fit ${
              error
                ? "allm-bg-red-200 allm-rounded-lg allm-mx-4"
                : role === "user"
                  ? `${embedderSettings.USER_STYLES.base} allm-anything-llm-user-message`
                  : `${embedderSettings.ASSISTANT_STYLES.base} allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)]`
            }`}
          >
            <div className="allm-flex allm-flex-col allm-w-full">
              {error ? (
                <div className="allm-p-2 allm-rounded-lg allm-bg-red-50 allm-text-red-500">
                  <span className="allm-inline-block">
                    <Warning className="allm-h-4 allm-w-4 allm-mb-1 allm-inline-block" />{" "}
                    Could not respond to message.
                  </span>
                  <p className="allm-text-xs allm-font-mono allm-mt-2 allm-border-l-2 allm-border-red-500 allm-pl-2 allm-bg-red-300 allm-p-2 allm-rounded-sm">
                    {errorMsg || "Server error"}
                  </p>
                </div>
              ) : (
                <span
                  className={`allm-whitespace-pre-line allm-flex allm-flex-col allm-w-full ${textSize} allm-leading-[20px]`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(renderMarkdown(message)),
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {sentAt && (
          <div
            className={`allm-font-sans allm-text-[10px] allm-text-gray-400 allm-ml-12 allm-mt-1 ${
              role === "user" ? "allm-text-right" : "allm-text-left"
            }`}
          >
            {formatDate(sentAt)}
          </div>
        )}
      </div>
    );
  }
);

export default memo(HistoricalMessage);
