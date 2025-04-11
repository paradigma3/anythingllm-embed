import { forwardRef, memo, useEffect } from "react";
import { Warning, CircleNotch } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import { embedderSettings } from "@/main";
import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import { formatDate } from "@/utils/date";
import Suggestions from "../Suggestions";

const PromptReply = forwardRef(
  ({ uuid, reply, pending, error, sources = [], sentAt, suggestions = [], widgets = [], animate = true, closed = false }, ref) => {
    if (!reply && sources.length === 0 && !pending && !error) return null;
    if (error) console.error(`ANYTHING_LLM_CHAT_WIDGET_ERROR: ${error}`);

    // Add debugging for suggestions
    useEffect(() => {
      console.log(`PromptReply [${uuid}] received suggestions:`, suggestions);
      
      // Check if suggestions are present and the message is closed
      if (suggestions && suggestions.length > 0 && closed) {
        console.log(`PromptReply [${uuid}] has suggestions and is closed, should render suggestions`);
      }
    }, [suggestions, uuid, closed]);

    useEffect(() => {
      if (!animate || closed) {
        const element = document.getElementById(`prompt-reply-${uuid}`);
        if (element) {
          element.classList.add('allm-opacity-100');
        }
      }
    }, [animate, closed, uuid]);

    // Add effect to handle suggestions updates
    useEffect(() => {
      if (closed && suggestions?.length > 0) {
        const element = document.getElementById(`prompt-reply-${uuid}`);
        if (element) {
          element.classList.add('allm-opacity-100');
        }
      }
    }, [closed, suggestions, uuid]);

    if (pending) {
      return (
        <div
          className={`allm-flex allm-items-start allm-w-full allm-h-fit allm-justify-start`}
        >
          <img
            src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
            alt="Anything LLM Icon"
            className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
          />
          <div
            style={{
              wordBreak: "break-word",
              backgroundColor: embedderSettings.ASSISTANT_STYLES.msgBg,
            }}
            className={`allm-py-[11px] allm-px-4 allm-flex allm-flex-col ${embedderSettings.ASSISTANT_STYLES.base} allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)]`}
          >
            <div className="allm-flex allm-items-center allm-gap-x-2">
              <CircleNotch size={16} className="allm-text-gray-400 allm-animate-spin" />
              <span className="allm-text-gray-400 allm-text-sm">Thinking...</span>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className={`allm-flex allm-items-end allm-w-full allm-h-fit allm-justify-start`}
        >
          <img
            src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
            alt="Anything LLM Icon"
            className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
          />
          <div
            style={{ wordBreak: "break-word" }}
            className={`allm-py-[11px] allm-px-4 allm-rounded-lg allm-flex allm-flex-col allm-bg-red-200 allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)] allm-mr-[37px] allm-ml-[9px]`}
          >
            <div className="allm-flex allm-gap-x-5">
              <span
                className={`allm-inline-block allm-p-2 allm-rounded-lg allm-bg-red-50 allm-text-red-500`}
              >
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
      <div className="allm-py-[5px]">
        <div
          className={`allm-text-[10px] allm-text-gray-400 allm-ml-[54px] allm-mr-6 allm-mb-2 allm-text-left allm-font-sans`}
        >
          {embedderSettings.settings.assistantName ||
            "Anything LLM Chat Assistant"}
        </div>
        <div
          id={`prompt-reply-${uuid}`}
          className={`allm-flex allm-items-start allm-w-full allm-h-fit allm-justify-start ${animate && !closed ? 'allm-opacity-0 allm-transition-opacity allm-duration-300' : 'allm-opacity-100'}`}
        >
          <img
            src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
            alt="Anything LLM Icon"
            className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
          />
          <div
            style={{
              wordBreak: "break-word",
              backgroundColor: embedderSettings.ASSISTANT_STYLES.msgBg,
            }}
            className={`allm-py-[11px] allm-px-4 allm-flex allm-flex-col ${
              error ? "allm-bg-red-200" : embedderSettings.ASSISTANT_STYLES.base
            } allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)]`}
          >
            <div className="allm-flex allm-gap-x-5">
              <span
                className={`allm-font-sans allm-reply allm-whitespace-pre-line allm-font-normal allm-text-sm allm-md:text-sm allm-flex allm-flex-col allm-gap-y-1`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(reply) }}
              />
            </div>
          </div>
        </div>

        {/* Render suggestions if available */}
        {!pending && !error && suggestions && suggestions.length > 0 && (
          <Suggestions suggestions={suggestions} />
        )}

        {/* Render widgets if available */}
        {!pending && !error && widgets && widgets.length > 0 && (
          <div className="allm-mt-4 allm-ml-[54px] allm-mr-6">
            {widgets.map((widget) => {
              if (widget.type === "gallery" && widget.images) {
                try {
                  const images = JSON.parse(widget.images);
                  return (
                    <div key={widget.id} className="allm-mb-4">
                      <h3 className="allm-text-sm allm-font-medium allm-mb-2">{widget.label}</h3>
                      <div className="allm-grid allm-grid-cols-2 allm-gap-2">
                        {images.map((image, index) => (
                          <img 
                            key={index} 
                            src={image} 
                            alt={`Gallery image ${index + 1}`} 
                            className="allm-rounded-lg allm-w-full allm-h-auto allm-object-cover allm-max-h-[150px]"
                          />
                        ))}
                      </div>
                    </div>
                  );
                } catch (e) {
                  console.error("Error parsing gallery images:", e);
                  return null;
                }
              }
              return null;
            })}
          </div>
        )}

        {sentAt && (
          <div
            className={`allm-text-[10px] allm-text-gray-400 allm-ml-[54px] allm-mr-6 allm-mt-2 allm-text-left allm-font-sans`}
          >
            {formatDate(sentAt)}
          </div>
        )}
      </div>
    );
  }
);

export default memo(PromptReply);
