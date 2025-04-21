import { forwardRef, memo, useEffect } from "react";
import { Warning, CircleNotch } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import { embedderSettings } from "@/main";
import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import { formatDate } from "@/utils/date";
// import Suggestions from "../Suggestions";
// import GalleryWidget from "./GalleryWidget";

const PromptReply = forwardRef(
  ({ uuid, reply, pending, error, sources = [], sentAt, suggestions = [], widgets = [], animate = true, closed = false }, ref) => {
    if (!reply && sources.length === 0 && !pending && !error) return null;
    if (error) console.error(`ANYTHING_LLM_CHAT_WIDGET_ERROR: ${error}`);

    useEffect(() => {
      if (!animate || closed) {
        const element = document.getElementById(`prompt-reply-${uuid}`);
        if (element) {
          element.classList.add('allm-opacity-100');
        }
      }
    }, [animate, closed, uuid]);

    if (pending) {
      return (
        <div className="allm-mb-8 allm-w-full">
          <div className="allm-text-[10px] allm-text-gray-400 allm-ml-12 allm-mb-1 allm-text-left allm-font-sans">
            {embedderSettings.settings.assistantName || "Anything LLM Chat Assistant"}
          </div>
          <div className="allm-flex allm-items-start allm-gap-4 allm-opacity-100">
            <img
              src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
              alt="Anything LLM Icon"
              className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
            />
            <div
              className="allm-p-4 allm-mb-2 allm-flex allm-flex-col allm-flex-grow allm-min-h-fit allm-text-[#222628] allm-rounded-t-[18px] allm-rounded-br-[18px] allm-rounded-bl-[4px] allm-mr-[37px] allm-ml-[9px] allm-shadow-md"
              style={{ wordBreak: "break-word", backgroundColor: "#FFFFFF" }}
            >
              <div className="allm-flex allm-items-center allm-gap-x-2">
                <CircleNotch size={16} className="allm-text-gray-400 allm-animate-spin" />
                <span className="allm-text-gray-400 allm-text-sm">Thinking...</span>
              </div>
            </div>
          </div>
          <div className="allm-text-[10px] allm-text-gray-400 allm-ml-12 allm-mt-1 allm-text-left allm-font-sans">
            {formatDate(Date.now() / 1000)}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="allm-flex allm-items-start allm-w-full allm-justify-start allm-mb-2"
        >
          <img
            src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
            alt="Anything LLM Icon"
            className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
          />
          <div
            style={{ wordBreak: "break-word" }}
            className="allm-p-3 allm-rounded-lg allm-flex allm-flex-col allm-bg-red-200 allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)] allm-mx-4"
          >
            <div className="allm-flex allm-gap-x-5">
              <span className="allm-inline-block allm-p-2 allm-rounded-lg allm-bg-red-50 allm-text-red-500">
                <Warning className="allm-h-4 allm-w-4 allm-mb-1 allm-inline-block" />{" "}
                Could not respond to message.
                <span className="allm-text-xs">Server error</span>
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="allm-mb-8 allm-w-full">
        <div className="allm-text-[10px] allm-text-gray-400 allm-ml-12 allm-mb-1 allm-text-left allm-font-sans">
          {embedderSettings.settings.assistantName ||
            "Anything LLM Chat Assistant"}
        </div>
        <div
          className="allm-flex allm-items-start allm-gap-4 allm-opacity-100"
          id={`prompt-reply-${uuid}`}
          style={{
            wordBreak: "break-word",
            backgroundColor: embedderSettings.ASSISTANT_STYLES.msgBg,
          }}
        >
          <img
            src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
            alt="Anything LLM Icon"
            className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
          />
          <div
            className="allm-p-4 allm-mb-2 allm-flex allm-flex-col allm-flex-grow allm-min-h-fit allm-text-[#222628] allm-rounded-t-[18px] allm-rounded-br-[18px] allm-rounded-bl-[4px] allm-mr-[37px] allm-ml-[9px] allm-shadow-md"
            style={{ wordBreak: "break-word", backgroundColor: "#FFFFFF" }}
          >
            <div className="allm-flex allm-flex-col allm-w-full">
              <span
                className="allm-font-sans allm-reply allm-whitespace-pre-line allm-font-normal allm-text-sm allm-md:text-sm allm-w-full"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(reply) }}
              />
            </div>
          </div>
        </div>

        {sentAt && (
          <div className="allm-text-[10px] allm-text-gray-400 allm-ml-12 allm-mt-1 allm-text-left allm-font-sans">
            {formatDate(sentAt)}
          </div>
        )}
      </div>
    );
  }
);

export default memo(PromptReply);
