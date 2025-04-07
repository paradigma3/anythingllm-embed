import ChatWindowHeader from "./Header";
import useChatHistory from "@/hooks/chat/useChatHistory";
import ChatContainer from "./ChatContainer";
import { useState, useEffect } from "react";
import { House, ChatCircleDots, Question, CircleNotch, MagnifyingGlass, CaretRight } from "@phosphor-icons/react";
import ChatService from "@/models/chatService";

export default function ChatWindow({ closeChat, settings, sessionId, isChatOpen }) {
  const { chatHistory, setChatHistory, loading } = useChatHistory(
    settings,
    sessionId
  );
  const [activeTab, setActiveTab] = useState("home");
  const [faqs, setFaqs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchFaqs() {
      if (activeTab === "help") {
        setLoadingFaqs(true);
        const faqData = await ChatService.embedFaqs(settings);
        setFaqs(faqData);
        setLoadingFaqs(false);
      }
    }
    fetchFaqs();
  }, [activeTab, settings]); // Added settings dependency

  useEffect(() => {
    async function fetchArticles() {
      if (activeTab === "home") {
        setLoadingArticles(true);
        const articleData = await ChatService.embedArticles(settings);
        setArticles(articleData);
        setLoadingArticles(false);
      }
    }
    fetchArticles();
  }, [activeTab, settings]); // Added settings dependency

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="allm-flex allm-flex-col allm-h-full allm-rounded-2xl allm-overflow-hidden">
        <ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
        />
        <div className="allm-flex-grow allm-flex allm-items-center allm-justify-center">
          <CircleNotch size={32} className="allm-text-gray-400 allm-animate-spin" />
        </div>
        <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="allm-flex allm-flex-col allm-h-full allm-bg-white allm-rounded-2xl allm-overflow-hidden">
      <ChatWindowHeader
        sessionId={sessionId}
        settings={settings}
        iconUrl={settings.brandImageUrl}
        closeChat={closeChat}
        setChatHistory={setChatHistory}
      />
      {/* === This is the primary scroll container === */}
      <div className="allm-flex-grow allm-overflow-y-auto ">
        {activeTab === "messages" && (
          <ChatContainer
            sessionId={sessionId}
            settings={settings}
            knownHistory={chatHistory}
          />
        )}
        {activeTab === "home" && (
           // *** REMOVED allm-h-full ***
          <div className="allm-flex allm-flex-col allm-p-4">
            <div className="allm-mb-6">
              <h2 className="allm-text-2xl allm-font-medium allm-text-gray-800">Hello there.</h2>
              <h1 className="allm-text-3xl allm-font-bold allm-text-gray-900">How can we help?</h1>
                       {/* === MODIFIED BUTTON === */}
            <button
              onClick={() => setActiveTab("messages")}
              className="allm-w-full allm-flex allm-items-center allm-justify-between allm-bg-white allm-text-gray-800 allm-px-4 allm-py-3 allm-rounded-lg allm-border allm-border-gray-200 hover:allm-bg-gray-50 allm-transition-colors allm-shadow-sm mb-6" // Added shadow-sm and mb-6 for spacing
            >
              <span className="allm-font-medium">Ask a question</span> {/* Added font-medium */}
              <span className="allm-flex allm-items-center allm-gap-1"> {/* Group icons */}
                <ChatCircleDots size={20} className="allm-text-gray-600" />
                <CaretRight size={16} className="allm-text-gray-500" /> {/* Added Chevron */}
              </span>
            </button>
            {/* === END MODIFIED BUTTON === */}
            </div>

            {loadingArticles ? (
              <div className="allm-flex allm-items-center allm-justify-center allm-py-8">
                <CircleNotch size={24} className="allm-text-gray-400 allm-animate-spin" />
              </div>
            ) : articles.length > 0 ? (
               // *** REMOVED allm-overflow-y-auto ***
              <div className="allm-space-y-4">
                {articles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="allm-block allm-bg-white allm-rounded-lg allm-overflow-hidden allm-shadow-md hover:allm-shadow-lg allm-transition-shadow allm-no-underline"
                  >
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="allm-w-full allm-h-48 allm-object-cover"
                      />
                    )}
                    <div className="allm-p-4">
                      <h3 className="allm-text-base allm-font-semibold allm-mb-1 allm-text-gray-900">
                        {article.title}
                      </h3>
                      <p className="allm-text-sm allm-text-gray-700 allm-line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="allm-text-slate-600 allm-text-sm allm-font-sans allm-py-4 allm-text-center">
                No articles available at the moment.
              </p>
            )}
          </div>
        )}
        {activeTab === "help" && (
          // *** REMOVED allm-h-full ***
          <div className="allm-flex allm-flex-col allm-p-4">
            <div className="allm-relative allm-mb-4">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="allm-w-full allm-px-4 allm-py-2 allm-rounded-lg allm-border allm-border-gray-200 focus:allm-outline-none focus:allm-ring-2 focus:allm-ring-blue-500 focus:allm-border-transparent" // Tailwind focus syntax
              />
              <MagnifyingGlass
                size={20}
                className="allm-absolute allm-right-3 allm-top-1/2 allm-transform -allm-translate-y-1/2 allm-text-gray-400"
              />
            </div>
            {loadingFaqs ? (
              <div className="allm-flex allm-items-center allm-justify-center allm-py-8">
                <CircleNotch size={24} className="allm-text-gray-400 allm-animate-spin" />
              </div>
            ) : filteredFaqs.length > 0 ? (
               // *** REMOVED allm-overflow-y-auto ***
              <div className="allm-space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="allm-bg-white allm-rounded-lg allm-p-4 allm-shadow-sm hover:allm-shadow-md allm-transition-shadow allm-border allm-border-gray-100"
                  >
                    <h3 className="allm-text-[15px] allm-font-medium allm-mb-2 allm-text-gray-900">{faq.question}</h3>
                    <p className="allm-text-[14px] allm-text-gray-700 allm-leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="allm-text-slate-600 allm-text-sm allm-font-sans allm-py-4 allm-text-center">
                {searchQuery ? "No matching FAQs found." : "No FAQs available at the moment."}
              </p>
            )}
          </div>
        )}
      </div>
      {/* === End scroll container === */}
      <hr className="hr-gradient"/>
      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// NavigationBar and other functions remain the same...
function NavigationBar({ activeTab, setActiveTab }) {
  return (
    <div className="allm-flex allm-justify-around allm-items-center allm-border-t allm-border-gray-100 allm-py-4">
      <button
        onClick={() => setActiveTab("home")}
        className={`allm-flex allm-flex-col allm-items-center allm-justify-center allm-border-0 allm-bg-transparent allm-cursor-pointer hover:allm-opacity-75 ${
          activeTab === "home"
            ? "allm-text-black"
            : "allm-text-gray-400"
        }`}
      >
        <House weight={activeTab === "home" ? "fill" : "regular"} size={24} />
        <span className="allm-text-[11px] allm-mt-1.5">Home</span>
      </button>
      <button
        onClick={() => setActiveTab("messages")}
        className={`allm-flex allm-flex-col allm-items-center allm-justify-center allm-border-0 allm-bg-transparent allm-cursor-pointer hover:allm-opacity-75 ${
          activeTab === "messages"
            ? "allm-text-black"
            : "allm-text-gray-400"
        }`}
      >
        <ChatCircleDots weight={activeTab === "messages" ? "fill" : "regular"} size={24} />
        <span className="allm-text-[11px] allm-mt-1.5">Messages</span>
      </button>
      <button
        onClick={() => setActiveTab("help")}
        className={`allm-flex allm-flex-col allm-items-center allm-justify-center allm-border-0 allm-bg-transparent allm-cursor-pointer hover:allm-opacity-75 ${
          activeTab === "help"
            ? "allm-text-black"
            : "allm-text-gray-400"
        }`}
      >
        <Question weight={activeTab === "help" ? "fill" : "regular"} size={24} />
        <span className="allm-text-[11px] allm-mt-1.5">Help</span>
      </button>
    </div>
  );
}


// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`);
  if (!target) return false;

  const markdown =
    target.parentElement?.parentElement?.querySelector(
      "pre:first-of-type"
    )?.innerText;
  if (!markdown) return false;

  window.navigator.clipboard.writeText(markdown);

  target.classList.add("allm-text-green-500");
  const originalText = target.innerHTML;
  target.innerText = "Copied!";
  target.setAttribute("disabled", true);

  setTimeout(() => {
    target.classList.remove("allm-text-green-500");
    target.innerHTML = originalText;
    target.removeAttribute("disabled");
  }, 2500);
}

// Listens and hunts for all data-code-snippet clicks.
function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
