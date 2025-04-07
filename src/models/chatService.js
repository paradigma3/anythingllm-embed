import { fetchEventSource } from "@microsoft/fetch-event-source";
import { v4 } from "uuid";

const ChatService = {
  embedSessionHistory: async function (embedSettings, sessionId) {
    const { embedId, baseApiUrl } = embedSettings;
    return await fetch(`${baseApiUrl}/${embedId}/${sessionId}`)
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

  getEmbedConfig: async function(embedId) {
    try {
      const response = await fetch(`http://localhost:3000/api/embed-config/${embedId}`);
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
      const config = await this.getEmbedConfig(embedId);
      if (!config || !config.id) {
        console.error("Could not get embed config ID");
        return [];
      }

      // Now fetch FAQs using the numeric ID
      const response = await fetch(`http://localhost:3001/api/embed-faqs/${config.id}/faqs`);
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
      const config = await this.getEmbedConfig(embedId);
      if (!config || !config.id) {
        console.error("Could not get embed config ID");
        return [];
      }

      // Now fetch Articles using the numeric ID
      const response = await fetch(`http://localhost:3000/api/embed-faqs/${config.id}/articles`);
      if (!response.ok) throw new Error("Failed to fetch Articles");
      
      const data = await response.json();
      return data || [];
    } catch (e) {
      console.error("Error fetching Articles:", e);
      return [];
    }
  },

  resetEmbedChatSession: async function (embedSettings, sessionId) {
    const { baseApiUrl, embedId } = embedSettings;
    return await fetch(`${baseApiUrl}/${embedId}/${sessionId}`, {
      method: "DELETE",
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  streamChat: async function (sessionId, embedSettings, message, handleChat) {
    const { baseApiUrl, embedId, username } = embedSettings;
    const overrides = {
      prompt: embedSettings?.prompt ?? null,
      model: embedSettings?.model ?? null,
      temperature: embedSettings?.temperature ?? null,
    };

    const ctrl = new AbortController();
    await fetchEventSource(`${baseApiUrl}/${embedId}/stream-chat`, {
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
    });
  },
};

export default ChatService;
