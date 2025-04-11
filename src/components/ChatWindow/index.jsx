import ChatWindowHeader from "./Header";
import useChatHistory from "@/hooks/chat/useChatHistory";
import ChatContainer from "./ChatContainer";
import { useState, useEffect } from "react";
import { House, ChatCircleDots, Question, CircleNotch, MagnifyingGlass, CaretRight, CaretUp, CaretDown } from "@phosphor-icons/react";
import ChatService from "@/models/chatService";
import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";

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
  const [expandedFaqs, setExpandedFaqs] = useState(new Set());
  const [isChattingActive, setIsChattingActive] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(true);

  useEffect(() => {
    // Reset initial load flag after a short delay
    const timer = setTimeout(() => {
      setHasInitialLoad(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const startChatting = () => {
    setIsChattingActive(true);
  };

  const stopChatting = () => {
    setIsChattingActive(false);
  };

  // Reset chat state when switching tabs
  useEffect(() => {
    if (activeTab !== "messages") {
      setIsChattingActive(false);
    }
  }, [activeTab]);

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

  const toggleFaqExpansion = (index) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFaqs(newExpanded);
  };

  if (loading) {
    return (
      <div className="allm-flex allm-flex-col allm-h-full allm-rounded-2xl allm-overflow-hidden">
        {activeTab !== "home" && ( <><ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
          showBackButton={isChattingActive}
          onBack={() => setIsChattingActive(false)}
        /><hr className="allm-m-0 allm-p-0 allm-h-[1px] allm-border-0 allm-bg-gray-200" /></>)}
        <div className="allm-flex-grow allm-flex allm-items-center allm-justify-center">
          <CircleNotch size={32} className="allm-text-gray-400 allm-animate-spin" />
        </div>
        {!isChattingActive && <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
    );
  }

  return (
    <div className="allm-flex allm-flex-col allm-h-full allm-bg-white allm-rounded-2xl allm-overflow-hidden">
       {activeTab !== "home" && ( <><ChatWindowHeader
        sessionId={sessionId}
        settings={settings}
        iconUrl={settings.brandImageUrl}
        closeChat={closeChat}
        setChatHistory={setChatHistory}
        showBackButton={isChattingActive}
        onBack={() => setIsChattingActive(false)}
      /><hr className="allm-m-0 allm-p-0 allm-h-[1px] allm-border-0 allm-bg-gray-200" /></>)}
      <div className="allm-flex-grow allm-overflow-y-auto">
        {activeTab === "messages" && (
          <div className="allm-flex allm-flex-col allm-h-full">
            <div className={`allm-flex-grow allm-overflow-y-auto ${!isChattingActive ? 'allm-filter allm-blur-[2px] allm-pointer-events-none' : ''}`}>
              <ChatContainer
                sessionId={sessionId}
                settings={settings}
                knownHistory={chatHistory}
                showInput={isChattingActive}
              />
            </div>
            {!isChattingActive && (
              <div 
                onClick={() => setIsChattingActive(true)}
                className="allm-fixed allm-bottom-20 allm-left-1/2 -allm-translate-x-1/2 allm-cursor-pointer allm-bg-black allm-text-white allm-px-4 allm-py-2 allm-rounded-full allm-shadow-lg hover:allm-shadow-xl allm-transition-all allm-duration-300 allm-flex allm-items-center allm-gap-2 allm-z-10"
              >
                Ask a question
                <ChatCircleDots size={20} />
              </div>
            )}
          </div>
        )}
        
        {activeTab === "home" && (
          <div className="allm-flex allm-flex-col allm-flex-grow">

            {/* === Home Header Section with Background & Fading Mask === */}
            {/* Apply mask: opaque from top down to ~70%, then fades to transparent at the bottom */}
            <div className="allm-relative allm-p-4 allm-pt-6 allm-pb-8 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
              {/* Background Image Container */}
              <div className="allm-absolute allm-inset-0 allm-z-0">
                <img
                  src={settings.backgroundImageUrl ?? "https://c4.wallpaperflare.com/wallpaper/383/217/191/abstract-pattern-mosaic-design-wallpaper-preview.jpg"}
                  alt="Background"
                  className="allm-w-full allm-h-full allm-object-cover"
                />
                 {/* Optional: Add back a subtle full overlay IF text contrast is poor *before* masking */}
                 {/* <div className="allm-absolute allm-inset-0 allm-bg-black/20"></div> */}
              </div>

              {/* Header Content (Logo, Greeting) */}
              <div className="allm-relative allm-z-10">
                 {/* Logo Area */}
                 <div className="allm-flex allm-items-center allm-mb-4">
                 <div className="allm-flex allm-items-center allm-justify-center allm-w-8 allm-h-8 allm-mr-2 allm-rounded-lg allm-p-1">
                  <img
                    src={AnythingLLMIcon}
                    alt={"AnythingLLM Logo"}
                    // REMOVED filter to show original logo color
                    className="allm-w-full allm-h-full allm-object-contain"
                  />
                </div>
                 {/* CHANGED text color from white/80 to gray-700 */}
                <span className="allm-text-xs allm-text-gray-700 ">Powered by AnythingLLM</span>
              </div>
                 {/* Greeting Text */}
                 <h2 className="allm-text-2xl allm-font-medium allm-text-white">Mabuhay!</h2>
                 <h1 className="allm-text-3xl allm-font-bold allm-text-white">How can we help you today?</h1><br></br>
              </div>
            </div>
            {/* === End Home Header Section === */}


            {/* === Home Content Section (White Background) === */}
            {/* Negative margin pulls this section up slightly to blend with the fade */}
            <div className="allm-p-4 allm-bg-white allm-flex-grow -allm-mt-6"> {/* Adjust negative margin (-mt-4, -mt-6, -mt-8) as needed */}
              {/* Action Buttons/Widgets */}
               <div className="allm-mb-6 allm-space-y-3 allm-z-1000">
                 {/* Ask a question Button */}
                 <button
                    onClick={() => {
                        setActiveTab("messages");
                        setIsChattingActive(true);
                    }}
                    className="allm-w-full allm-flex allm-items-center allm-justify-between allm-bg-white allm-text-gray-800 allm-px-4 allm-py-3 allm-rounded-xl allm-border allm-border-gray-200 hover:allm-bg-gray-50 allm-transition-all allm-shadow-sm hover:allm-shadow-md"
                 >
                    <span className="allm-font-medium">Ask a question</span>
                    <span className="allm-flex allm-items-center allm-gap-1">
                        <ChatCircleDots size={20} className="allm-text-gray-600" />
                        <CaretRight size={16} className="allm-text-gray-500" />
                    </span>
                 </button>

                 {/* Divider */}
                 <div className="allm-flex allm-items-center allm-gap-3 allm-px-6 allm-py-1">
                   <div className="allm-flex-1 allm-h-[1px] allm-bg-gray-200"></div>
                   <span className="allm-text-sm allm-text-gray-400 allm-font-medium">or</span>
                   <div className="allm-flex-1 allm-h-[1px] allm-bg-gray-200"></div>
                 </div>

                 {/* FAQ Search Widget */}
                 <div
                     onClick={() => setActiveTab('help')}
                     className="allm-relative allm-w-full allm-cursor-pointer"
                 >
                     <div className="allm-w-full allm-px-4 allm-py-3 allm-pl-12 allm-rounded-xl allm-bg-gray-50 allm-border allm-border-gray-100 hover:allm-bg-gray-100 allm-transition-all allm-shadow-sm hover:allm-shadow-md allm-flex allm-items-center">
                         <span className="allm-text-gray-500">Search for help</span>
                     </div>
                     <MagnifyingGlass
                         size={20}
                         className="allm-absolute allm-left-4 allm-top-1/2 -allm-translate-y-1/2 allm-text-gray-400 allm-pointer-events-none"
                     />
                 </div>
               </div>

              {/* Articles Section */}
               <h3 className="allm-text-sm allm-font-medium allm-text-gray-500 allm-mb-3 allm-uppercase">Articles</h3>
               {/* ... rest of articles loading/display ... */}
               {loadingArticles ? (
                 <div className="allm-flex allm-items-center allm-justify-center allm-py-8">
                   <CircleNotch size={24} className="allm-text-gray-400 allm-animate-spin" />
                 </div>
               ) : articles.length > 0 ? (
                 <div className="allm-space-y-3">
                   {articles.map((article, index) => (
                     <a
                       key={index}
                       href={article.url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="allm-block allm-bg-white allm-rounded-lg allm-overflow-hidden allm-border allm-border-gray-200 hover:allm-shadow-md allm-transition-shadow allm-no-underline"
                     >
                       {article.image_url && (
                         <img
                           src={article.image_url}
                           alt={article.title}
                           className="allm-w-full allm-h-36 allm-object-cover"
                         />
                       )}
                       <div className="allm-p-3">
                         <h3 className="allm-text-sm allm-font-semibold allm-mb-1 allm-text-gray-900">
                           {article.title}
                         </h3>
                         <p className="allm-text-xs allm-text-gray-600 allm-line-clamp-2">
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
             {/* === End Home Content Section ==== */}
          </div>
        )}

        {activeTab === "help" && (
          <div className="allm-flex allm-flex-col allm-p-4">
            <div className="allm-relative allm-mb-6">
              <div className="allm-relative">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="allm-w-full allm-px-4 allm-py-3 allm-pl-12 allm-rounded-xl allm-bg-gray-50 allm-border-none focus:allm-outline-none focus:allm-ring-2 focus:allm-ring-black/5 allm-shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:allm-shadow-[0_2px_8px_rgba(0,0,0,0.12)] allm-transition-all allm-duration-300"
                />
                <MagnifyingGlass
                  size={20}
                  className="allm-absolute allm-left-4 allm-top-1/2 -allm-translate-y-1/2 allm-text-gray-400"
                />
              </div>
            </div>
            {loadingFaqs ? (
              <div className="allm-flex allm-items-center allm-justify-center allm-py-8">
                <CircleNotch size={24} className="allm-text-gray-400 allm-animate-spin" />
              </div>
            ) : filteredFaqs.length > 0 ? (
              <div className="allm-space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="allm-bg-white allm-rounded-lg allm-p-4 allm-shadow-md hover:allm-shadow-lg allm-transition-shadow allm-border allm-border-gray-100 allm-relative"
                  >
                    <h3 className="allm-text-[15px] allm-font-medium allm-mb-2 allm-text-gray-900">{faq.question}</h3>
                    <div 
                      className={`allm-relative allm-transition-all allm-duration-500 allm-ease-in-out allm-overflow-hidden ${
                        expandedFaqs.has(index) ? 'allm-max-h-[1000px]' : 'allm-max-h-20'
                      }`}
                    >
                      <p className="allm-text-[14px] allm-text-gray-700 allm-leading-relaxed">
                        {faq.answer}
                      </p>
                      {!expandedFaqs.has(index) && (
                        <div className="allm-absolute allm-inset-x-0 allm-bottom-0 allm-h-12 allm-bg-gradient-to-t allm-from-white allm-pointer-events-none allm-transition-opacity allm-duration-500" />
                      )}
                    </div>
                    <button
                      onClick={() => toggleFaqExpansion(index)}
                      className="allm-absolute allm-bottom-3 allm-right-3 allm-p-1.5 allm-rounded-full allm-bg-gray-50 hover:allm-bg-gray-100 allm-transition-all allm-duration-500 allm-border allm-border-gray-100/50 allm-flex allm-items-center allm-justify-center group allm-shadow-sm hover:allm-shadow"
                      aria-label={expandedFaqs.has(index) ? "Show less" : "Show more"}
                    >
                      {expandedFaqs.has(index) ? (
                        <CaretUp 
                          size={16} 
                          weight="bold" 
                          className="allm-text-gray-400 group-hover:allm-text-gray-600 allm-transition-all allm-duration-500 allm-transform" 
                        />
                      ) : (
                        <CaretDown 
                          size={16} 
                          weight="bold"
                          className="allm-text-gray-400 group-hover:allm-text-gray-600 allm-transition-all allm-duration-500 allm-transform" 
                        />
                      )}
                    </button>
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
      <hr className="hr-gradient"/>
      {!isChattingActive && <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}

function NavigationBar({ activeTab, setActiveTab }) {
  return (
    <>
      <div className="allm-flex allm-justify-around allm-items-center allm-py-4">
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
    </>
  );
}

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

function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
