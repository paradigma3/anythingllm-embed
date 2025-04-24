import { fetchEventSource } from "@microsoft/fetch-event-source";
import { v4 } from "uuid";

const ChatService = {
  // Helper function to determine which URL to use
  getApiUrl: function(embedSettings) {
    const { baseApiUrl, devUrl, mainAttr } = embedSettings;
    
    // mainAttr comes as a string from data attributes, so we need to compare with "true"
    if (mainAttr === "true") {
      return baseApiUrl;
    }
    
    // Otherwise, use devUrl for localhost or baseApiUrl for other environments
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isDevelopment ? (devUrl || 'http://localhost:3001/api/embed') : baseApiUrl;
  },

  embedSessionHistory: async function (embedSettings, sessionId) {
    const { embedId } = embedSettings;
    return await fetch(
      `${embedSettings.baseApiUrl}/${embedId}/${sessionId}`
    )
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Invalid response from server");
      })
      .then((res) => {
        return res.history.map((msg) => ({
          ...msg,
          id: v4(),
          sender: msg.role === "user" ? "user" : "system",
          textResponse: msg.content,
          close: false,
        }));
      })
      .catch((e) => {
        console.error(e);
        return [];
      });
  },

  getEmbedConfig: async function(embedId, embedSettings) {
    try {
      const response = await fetch(`${embedSettings.baseApiUrl}/${embedId}/${embedSettings.sessionId}/config`);
      if (!response.ok) throw new Error("Failed to fetch embed config");
      const config = await response.json();
      return config;
    } catch (e) {
      console.error("Error fetching embed config:", e);
      return null;
    }
  },

  embedFaqs: async function (embedSettings) {
    const { embedId } = embedSettings;
    try {
      // First get the embed config to get the numeric ID
      const config = await this.getEmbedConfig(embedId, embedSettings);
      if (!config || !config.id) {
        console.error("Could not get embed config ID");
        return [];
      }

      // Now fetch FAQs using the numeric ID
      const response = await fetch(`${embedSettings.baseApiUrl}/${embedId}/${embedSettings.sessionId}/${config.id}/faqs`);
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      
      const data = await response.json();
      return data.faqs || [];
    } catch (e) {
      console.error("Error fetching FAQs:", e);
      return [];
    }
  },

  embedArticles: async function (embedSettings) {
    const { embedId } = embedSettings;
    try {
      // First get the embed config to get the numeric ID
      const config = await this.getEmbedConfig(embedId, embedSettings);
      if (!config || !config.id) {
        console.error("Could not get embed config ID");
        return [];
      }

      // Now fetch Articles using the numeric ID
      const response = await fetch(`${embedSettings.baseApiUrl}/${embedId}/${embedSettings.sessionId}/${config.id}/articles`);
      if (!response.ok) throw new Error("Failed to fetch Articles");
      
      const data = await response.json();
      return data || [];
    } catch (e) {
      console.error("Error fetching Articles:", e);
      return [];
    }
  },

  resetEmbedChatSession: async function (embedSettings, sessionId) {
    const { embedId } = embedSettings;
    return await fetch(
      `${embedSettings.baseApiUrl}/${embedId}/${sessionId}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => res.ok)
      .catch(() => false);
  },
  
  streamChat: async function (sessionId, embedSettings, message, handleChat) {
    const { embedId, username } = embedSettings;
    const overrides = {
      prompt: embedSettings?.prompt ?? null,
      model: embedSettings?.model ?? null,
      temperature: embedSettings?.temperature ?? null,
    };

    const ctrl = new AbortController();
    await fetchEventSource(
      `${embedSettings.baseApiUrl}/${embedId}/stream-chat`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
          sessionId,
          username,
          ...overrides,
        }),
        signal: ctrl.signal,
        openWhenHidden: true,
        async onopen(response) {
          if (response.ok) {
            return; // everything's good
          } else if (response.status >= 400) {
            await response
              .json()
              .then((serverResponse) => {
                handleChat(serverResponse);
              })
              .catch(() => {
                handleChat({
                  id: v4(),
                  type: "abort",
                  textResponse: null,
                  sources: [],
                  close: true,
                  error: `An error occurred while streaming response. Code ${response.status}`,
                });
              });
            ctrl.abort();
            throw new Error();
          } else {
            handleChat({
              id: v4(),
              type: "abort",
              textResponse: null,
              sources: [],
              close: true,
              error: `An error occurred while streaming response. Unknown Error.`,
            });
            ctrl.abort();
            throw new Error("Unknown Error");
          }
        },
        async onmessage(msg) {
          try {
            const chatResult = JSON.parse(msg.data);
            handleChat(chatResult);
          } catch {}
        },
        onerror(err) {
          handleChat({
            id: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. ${err.message}`,
          });
          ctrl.abort();
          throw new Error();
        },
      }
    );
  },
};

export default ChatService;
