// For handling of synchronous chats that are not utilizing streaming or chat requests.
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

  console.log("Handling chat result:", chatResult);

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
      suggestions,
      widgets,
    };
    console.log("Abort message:", message);
    setChatHistory([...remHistory, message]);
    _chatHistory.push(message);
  } else if (type === "textResponse") {
    setLoadingResponse(false);
    const message = {
      uuid,
      content: textResponse,
      role: "assistant",
      sources,
      closed: close,
      error,
      errorMsg,
      animate: !close,
      pending: false,
      sentAt,
      suggestions,
      widgets,
    };
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
        pending: false,
        sentAt,
        // Update suggestions and widgets during streaming if they exist
        suggestions: suggestions?.length ? suggestions : existingHistory.suggestions || [],
        widgets: widgets?.length ? widgets : existingHistory.widgets || []
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
        pending: false,
        sentAt,
        // Initialize with suggestions and widgets if they exist
        suggestions: suggestions || [],
        widgets: widgets || []
      };
      
      _chatHistory.push(newMessage);
    }
    setChatHistory([..._chatHistory]);
  } else if (type === "finalizeResponseStream") {
    console.log("Processing finalizeResponseStream with suggestions:", suggestions);
    
    // Create a completely new array to ensure React detects the change
    const newChatHistory = [..._chatHistory];
    
    // Try to find the message by uuid or id
    const chatIdx = newChatHistory.findIndex((chat) => 
      chat.uuid === uuid || chat.uuid === chatResult.id || chat.id === uuid || chat.id === chatResult.id
    );
    
    if (chatIdx !== -1) {
      console.log("Found message at index:", chatIdx);
      
      // Create a completely new message object
      const updatedMessage = {
        ...newChatHistory[chatIdx],
        closed: true,
        animate: false,
        suggestions: suggestions || [],
        widgets: widgets || [],
        metrics: chatResult.metrics || null
      };
      
      // Replace the message in the new array
      newChatHistory[chatIdx] = updatedMessage;
      
      // Update the state with the new array
      setChatHistory(newChatHistory);
      
      // Also update the _chatHistory reference for future operations
      _chatHistory.length = 0;
      _chatHistory.push(...newChatHistory);
      
      console.log("Updated chat history with suggestions:", updatedMessage.suggestions);
    } else {
      console.log("Message not found in history, adding as new message");
      // If the message doesn't exist, add it as a new message
      const newMessage = {
        uuid: uuid || chatResult.id,
        content: textResponse || "",
        role: "assistant",
        sources: sources || [],
        closed: true,
        error: error || false,
        errorMsg: errorMsg || null,
        animate: false,
        pending: false,
        sentAt: sentAt || Math.floor(Date.now() / 1000),
        suggestions: suggestions || [],
        widgets: widgets || []
      };
      
      // Add the new message to the new array
      newChatHistory.push(newMessage);
      
      // Update the state with the new array
      setChatHistory(newChatHistory);
      
      // Also update the _chatHistory reference
      _chatHistory.length = 0;
      _chatHistory.push(...newChatHistory);
      
      console.log("Added new message with suggestions:", newMessage.suggestions);
    }
  }

  // Log the final chat history for debugging
  console.log("Final chat history:", _chatHistory);
}

export function chatPrompt(workspace) {
  return (
    workspace?.openAiPrompt ??
    "Given the following conversation, relevant context, and a follow up question, reply with an answer to the current question the user is asking. Return only your response to the question given the above information following the users instructions as needed."
  );
}
