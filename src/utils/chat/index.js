// For handling of synchronous chats that are not utilizing streaming or chat requests.
export function updateAssistantMetadata(chatHistory, { suggestions = [], widgets = [] }) {
  // Only proceed if we have a chat history
  if (!chatHistory || chatHistory.length === 0) return chatHistory;

  // Find the last assistant message
  const lastMessageIndex = chatHistory.length - 1;
  const lastMessage = chatHistory[lastMessageIndex];

  // Only update if it's an assistant message
  if (lastMessage.role !== "assistant") return chatHistory;

  // Create new message with updated metadata
  const updatedMessage = {
    ...lastMessage,
    suggestions: suggestions || [],
    widgets: widgets || [],
    closed: true,
    animate: false,
    pending: false
  };

  // Create new history array with updated message
  const newHistory = [...chatHistory];
  newHistory[lastMessageIndex] = updatedMessage;
  console.log("Updated history:", newHistory);
  return newHistory;
}

export default function handleChat(
  chatResult,
  setLoadingResponse,
  setChatHistory,
  remHistory,
  _chatHistory
) {
  const {
    uuid,
    textResponse,
    type,
    sources = [],
    error,
    close,
    errorMsg = null,
    suggestions = [],
    widgets = [],
  } = chatResult;

  // Preserve the sentAt from the last message in the chat history
  const lastMessage = _chatHistory[_chatHistory.length - 1];
  const sentAt = lastMessage?.sentAt;

  // console.log("Handling chat result:", chatResult);

  if (type === "abort") {
    setLoadingResponse(false);
    const message = {
      uuid,
      content: textResponse,
      role: "assistant",
      sources,
      closed: true,
      error,
      errorMsg,
      animate: false,
      pending: false,
      sentAt,
      suggestions: [],
      widgets: [],
    };
    // console.log("Abort message:", message);
    setChatHistory([...remHistory, message]);
    _chatHistory.push(message);
  } else if (type === "textResponseChunk") {
    const chatIdx = _chatHistory.findIndex((chat) => chat.uuid === uuid);
    if (chatIdx !== -1) {
      const existingHistory = { ..._chatHistory[chatIdx] };
      const updatedHistory = {
        ...existingHistory,
        content: existingHistory.content + textResponse,
        sources,
        error,
        errorMsg,
        closed: close,
        animate: !close,
        pending: true,
        sentAt,
        suggestions: existingHistory.suggestions || [],
        widgets: existingHistory.widgets || []
      };
      
      _chatHistory[chatIdx] = updatedHistory;
    } else {
      const newMessage = {
        uuid,
        sources,
        error,
        errorMsg,
        content: textResponse,
        role: "assistant",
        closed: close,
        animate: !close,
        pending: true,
        sentAt,
        suggestions: [],
        widgets: []
      };
      
      _chatHistory.push(newMessage);
    }
    setChatHistory([..._chatHistory]);
  } else if (type === "finalizeResponseStream") {
    // console.log("Processing finalizeResponseStream with suggestions:", suggestions);
    // console.log("Processing finalizeResponseStream with widgets:", widgets);
    
    // Use updateAssistantMetadata to handle the update
    const updatedHistory = updateAssistantMetadata(_chatHistory, {
      suggestions,
      widgets
    });
    
    // Update both state and reference
    setChatHistory(updatedHistory);
    _chatHistory.length = 0;
    _chatHistory.push(...updatedHistory);
    
    // console.log("Updated chat history with suggestions:", suggestions);
    // console.log("Updated chat history with widgets:", widgets);
  }

  // Log the final chat history for debugging
  // console.log("Final chat history:", _chatHistory);
}

export function chatPrompt(workspace) {
  return (
    workspace?.openAiPrompt ??
    "Given the following conversation, relevant context, and a follow up question, reply with an answer to the current question the user is asking. Return only your response to the question given the above information following the users instructions as needed."
  );
}
