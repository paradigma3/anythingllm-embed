import React, { useState, useEffect, useRef } from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import handleChat from "@/utils/chat";
import ChatService from "@/models/chatService";
import { ArrowDown } from "@phosphor-icons/react";
import debounce from "lodash.debounce";

export const SEND_TEXT_EVENT = "anythingllm-embed-send-prompt";

export default function ChatContainer({
  sessionId,
  settings,
  knownHistory = [],
  showInput = false,
  onLoadingChange,
  onSuggestionsChange,
  onHistoryChange
}) {
  const [message, setMessage] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(loadingResponse);
    
    // If we're not loading and have a last message, check if it has suggestions
    if (!loadingResponse && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.suggestions && lastMessage.suggestions.length > 0) {
        setSuggestions(lastMessage.suggestions);
        onSuggestionsChange?.(lastMessage.suggestions);
      } else if (lastMessage.role === 'assistant') {
        setSuggestions([]); 
        onSuggestionsChange?.([]);
      }
    }
  }, [loadingResponse, onLoadingChange, chatHistory, onSuggestionsChange]);

  // Notify parent when chat history changes
  useEffect(() => {
    onHistoryChange?.(chatHistory);
  }, [chatHistory, onHistoryChange]);

  useEffect(() => {
    // Initialize with knownHistory if we have it
    if (knownHistory.length > 0) {
      setChatHistory([...knownHistory]);
    }
  }, []); // Run only on mount

  useEffect(() => {
    if (knownHistory.length > chatHistory.length) {
      setChatHistory([...knownHistory]);
    }
  }, [knownHistory, chatHistory]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message || message === "") return false;

    const prevChatHistory = [
      ...chatHistory,
      { content: message, role: "user", sentAt: Math.floor(Date.now() / 1000) },
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
        sentAt: Math.floor(Date.now() / 1000),
        suggestions: [],
        widgets: [],
        closed: false
      },
    ];
    setChatHistory(prevChatHistory);
    setMessage("");
    setLoadingResponse(true);
  };
  // console.log("This is the chat history",chatHistory);
  const sendCommand = (command, history = [], attachments = []) => {
    if (!command || command === "") return false;

    let prevChatHistory;
    if (history.length > 0) {
      prevChatHistory = [
        ...history,
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          attachments,
          animate: true,
          suggestions: [],
          widgets: [],
          closed: false
        },
      ];
    } else {
      prevChatHistory = [
        ...chatHistory,
        {
          content: command,
          role: "user",
          attachments,
        },
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          animate: true,
          suggestions: [],
          widgets: [],
          closed: false
        },
      ];
    }

    setChatHistory(prevChatHistory);
    setLoadingResponse(true);
  };

  useEffect(() => {
    async function fetchReply() {
      const promptMessage =
        chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
      const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
      var _chatHistory = [...remHistory];

      if (!promptMessage || !promptMessage?.userMessage) {
        setLoadingResponse(false);
        return false;
      }

      await ChatService.streamChat(
        sessionId,
        settings,
        promptMessage.userMessage,
        (chatResult) =>
          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory
          )
      );
      return;
    }

    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory]);

  const handleAutofillEvent = (event) => {
    if (!event.detail.command) return;
    sendCommand(event.detail.command, [], []);
  };

  useEffect(() => {
    window.addEventListener(SEND_TEXT_EVENT, handleAutofillEvent);
    return () => {
      window.removeEventListener(SEND_TEXT_EVENT, handleAutofillEvent);
    };
  }, []);

  // useEffect(() => {
  //   scrollToBottom();
  //   console.log("This is called")
  // }, [chatHistory]);
  useEffect(() => {
    // Use setTimeout to defer the scroll until after the next browser paint/layout cycle
    const timerId = setTimeout(() => {
      scrollToBottom();
      // console.log("Scroll attempt after timeout"); // Optional: Check if this now works
    }, 0); // 0ms delay pushes it to the end of the event loop

    return () => clearTimeout(timerId); // Cleanup the timeout if component unmounts or history changes again quickly
  }, [chatHistory]); // Dependency remains the same

  const handleScroll = () => {
    if (!containerRef.current) return;
    const diff =
      containerRef.current.scrollHeight -
      containerRef.current.scrollTop -
      containerRef.current.clientHeight;
    const isBottom = diff <= 40;
    setIsAtBottom(isBottom);
  };

  const debouncedScroll = debounce(handleScroll, 100);
  useEffect(() => {
    function watchScrollEvent() {
      if (!containerRef.current) return null;
      const containerElement = containerRef.current;
      if (!containerElement) return null;
      containerElement.addEventListener("scroll", debouncedScroll);
      return () => containerElement.removeEventListener("scroll", debouncedScroll);
    }
    watchScrollEvent();
  }, []);

  const scrollToBottom = () => {
    if (containerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
      // console.log(`SCROLL CHECK: scrollHeight=${scrollHeight}, clientHeight=${clientHeight}, currentScrollTop=${scrollTop}`);
  
      // Try multiple scroll approaches to ensure it works
      try {
        // Approach 1: Direct scrollTop assignment
        containerRef.current.scrollTop = scrollHeight;
        
        // Approach 2: scrollTo method
        containerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "instant"
        });
        
        // Approach 3: scrollIntoView on the last child
        const lastChild = containerRef.current.lastElementChild;
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: "instant", block: "end" });
        }
        
        // console.log(`>>> Scrolling attempt to top: ${scrollHeight}`);
        
        // Check if scroll worked after a short delay
        setTimeout(() => {
          if (containerRef.current) {
            const newScrollTop = containerRef.current.scrollTop;
            // console.log(`>>> Scrolled. New scrollTop: ${newScrollTop}`);
            
            // If still not scrolled, try one more time with a different approach
            if (newScrollTop === 0 && scrollHeight > 0) {
              // console.log(">>> Scroll failed, trying alternative approach");
              // Force scroll with a different method
              containerRef.current.scrollTop = scrollHeight;
              
              // Try to scroll the window if needed
              const containerRect = containerRef.current.getBoundingClientRect();
              const isVisible = containerRect.top >= 0 && containerRect.bottom <= window.innerHeight;
              if (isVisible) {
                window.scrollTo({
                  top: window.scrollY + scrollHeight,
                  behavior: "instant"
                });
              }
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error during scroll:", error);
      }
    } else {
      console.log("SCROLL CHECK FAILED: containerRef.current is null");
    }
  };
  
  useEffect(() => {
    const timerId = setTimeout(scrollToBottom, 50); // Slightly longer delay (e.g., 50ms) might help
    return () => clearTimeout(timerId);
  }, [chatHistory]);

  return (
    <div className="allm-h-full allm-w-full allm-flex allm-flex-col allm-rounded-2xl allm-overflow-hidden">
      <div 
        ref={containerRef} 
        className="allm-flex-1 allm-overflow-y-auto allm-no-scrollbar" 
        style={{ 
          marginBottom: showInput ? '80px' : '0',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
          scrollBehavior: 'auto'
        }}
      >
        <ChatHistory settings={settings} history={chatHistory} />
        {!isAtBottom && (
          <div className="allm-fixed allm-bottom-[10rem] allm-right-[50px] allm-z-50 allm-cursor-pointer allm-animate-pulse">
            <div className="allm-flex allm-flex-col allm-items-center">
              <div className="allm-p-1 allm-rounded-full allm-border allm-border-white/10 allm-bg-black/20 hover:allm-bg-black/50">
                <ArrowDown
                  weight="bold"
                  className="allm-text-white/50 allm-w-5 allm-h-5"
                  onClick={scrollToBottom}
                  id="scroll-to-bottom-button"
                  aria-label="Scroll to bottom"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {showInput && (
        <div className="allm-absolute allm-bottom-0 allm-left-0 allm-right-0 allm-bg-white allm-border-t allm-border-gray-100 allm-rounded-b-2xl">
          <PromptInput
            message={message}
            submit={handleSubmit}
            onChange={handleMessageChange}
            inputDisabled={loadingResponse}
            buttonDisabled={loadingResponse}
          />
        </div>
      )}
    </div>
  );
}
