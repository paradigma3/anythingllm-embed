import {
  Plus,
  ChatCircleDots,
  Headset,
  Binoculars,
  MagnifyingGlass,
  MagicWand,
  Control,
  XCircle,
  Question
} from "@phosphor-icons/react";

const CHAT_ICONS = {
  q:Question,
  xcircle:XCircle,
  ctrl:Control,
  plus: Plus,
  chatBubble: ChatCircleDots,
  support: Headset,
  search2: Binoculars,
  search: MagnifyingGlass,
  magic: MagicWand,
};

export default function OpenButton({ settings, isOpen, toggleOpen }) {
  
  const ChatIcon = isOpen
    ? XCircle // Use ChatCircleDots when the chat is open
    : CHAT_ICONS.hasOwnProperty(settings?.chatIcon)
    ? CHAT_ICONS.q
    : CHAT_ICONS.q;
  return (

    <button
      style={{ backgroundColor: settings.buttonColor}}
      id="anything-llm-embed-chat-button"
      onClick={toggleOpen}
      className={`hover:allm-cursor-pointer allm-border-none allm-flex allm-items-center allm-justify-center allm-p-4 allm-rounded-full allm-text-white allm-text-2xl hover:allm-opacity-95 ${isOpen ? ``: `pulse-animation`}`}
      aria-label="Toggle Menu"
    >
      <ChatIcon className="text-white" />
    </button>

  );
}
