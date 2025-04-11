import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import { ArrowLeft,CaretLeft  } from "@phosphor-icons/react";

export default function ChatWindowHeader({
  iconUrl = null,
  showBackButton = false,
  onBack
}) {
  return (
    <div className="allm-h-16 allm-min-h-[64px] allm-max-h-[64px] allm-flex allm-items-center allm-justify-center allm-bg-white  allm-relative allm-overflow-visible allm-w-full"> {/* Changed border-black to border-gray-200 */}
   {showBackButton && (
        <button
          onClick={onBack}
          className="allm-absolute allm-left-4 allm-flex allm-items-center allm-justify-center allm-w-8 allm-h-8 allm-rounded-md allm-border-0 allm-bg-transparent hover:allm-bg-black/5 allm-transition-all allm-duration-200 allm-cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={23} weight="regular" className="allm-text-gray-800" />
        </button>
      )}

      <div className="allm-flex allm-items-center allm-justify-center allm-w-10 allm-h-10">
        <img
          src={iconUrl ?? AnythingLLMIcon}
          alt={iconUrl ? "Brand" : "AnythingLLM Logo"}
          className="allm-w-full allm-h-full allm-object-contain"
        />
      </div>
    </div>
  );
}