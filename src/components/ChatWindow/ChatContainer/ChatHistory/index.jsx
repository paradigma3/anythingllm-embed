import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import Suggestions from "./Suggestions";
import { useRef } from "react";
import { embedderSettings } from "@/main";
import { SEND_TEXT_EVENT } from "..";

export default function ChatHistory({ settings = {}, history = [] }) {
  const replyRef = useRef(null);

  if (history.length === 0) {
    return (
      <div className="allm-flex allm-flex-col allm-justify-center allm-items-center allm-gap-4 allm-p-4">
        <p className="allm-text-slate-400 allm-text-sm allm-font-sans allm-text-center">
          {settings?.greeting ?? "Send a chat to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="allm-flex allm-flex-col allm-gap-6 allm-p-4">
      {history.map((props, index) => {
        const isLastMessage = index === history.length - 1;
        const isStreamingMessage = props.animate && !props.closed;
        const isFinalizedMessage = props.role === "assistant" && props.closed;
        const isAssistantMessage = props.role === "assistant";

        if (isAssistantMessage && (isStreamingMessage || isFinalizedMessage)) {
          return (
            <PromptReply
              key={props.uuid || props.id}
              ref={isLastMessage ? replyRef : null}
              uuid={props.uuid || props.id}
              reply={props.content}
              pending={props.pending}
              sources={props.sources}
              error={props.error}
              closed={props.closed}
              animate={props.animate}
              sentAt={props.sentAt}
              suggestions={props.suggestions || []}
              widgets={props.widgets || []}
            />
          );
        }

        return (
          <HistoricalMessage
            key={props.uuid || props.id}
            ref={isLastMessage ? replyRef : null}
            message={props.content}
            sentAt={props.sentAt || Date.now() / 1000}
            role={props.role}
            sources={props.sources}
            chatId={props.chatId}
            feedbackScore={props.feedbackScore}
            error={props.error}
            errorMsg={props.errorMsg}
            suggestions={props.suggestions}
            widgets={props.widgets}
          />
        );
      })}
    </div>
  );
}

export function ChatHistoryLoading() {
  return (
    <div className="allm-h-full allm-w-full allm-flex allm-flex-col allm-items-center allm-justify-center allm-p-4">
      <CircleNotch
        size={14}
        className="allm-text-slate-400 allm-animate-spin"
      />
    </div>
  );
}

function SuggestedMessages({ settings }) {
  if (!settings?.defaultMessages?.length) return null;

  return (
    <div className="allm-flex allm-flex-col allm-gap-y-2 allm-w-[75%]">
      {settings.defaultMessages.map((content, i) => (
        <button
          key={i}
          style={{
            opacity: 0,
            wordBreak: "break-word",
            backgroundColor: embedderSettings.USER_STYLES.msgBg,
            fontSize: settings.textSize,
          }}
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(SEND_TEXT_EVENT, { detail: { command: content } })
            );
          }}
          className={`msg-suggestion allm-border-none hover:allm-shadow-[0_4px_14px_rgba(0,0,0,0.5)] allm-cursor-pointer allm-px-2 allm-py-2 allm-rounded-lg allm-text-white allm-w-full allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)]`}
        >
          {content}
        </button>
      ))}
    </div>
  );
}
