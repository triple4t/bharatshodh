
export const translations = {
  en: {
    // Header/Sidebar
    "app.title": "BharatShodh",
    "app.subtitle": "AI Assistant",
    "new.chat": "New Chat",
    "no.conversations": "No conversations yet.",
    "start.journey": "Start a new chat to begin your journey.",
    "loading": "Loading...",
    "logout": "Logout",
    "rename.chat": "Rename chat",
    "delete.chat": "Delete chat",
    "chat.deleted": "Chat deleted",
    "chat.renamed": "Chat renamed",
    "new.chat.created": "New chat created",

    // Input Box
    "ask.anything": "Ask me anything...",
    "attach.file": "Attach file",
    "start.voice": "Start voice input",
    "stop.voice": "Stop listening",
    "search.web": "Search",
    "search.web.tooltip": "Toggle web search",
    "docs.rag": "Docs",
    "docs.rag.tooltip": "Toggle document Q&A mode",
    "send.message": "Send message",
    "docs.mode.active": "📚 Document Q&A Mode Active - Answers will be based on uploaded documents",

    // Chat Window
    "copy": "Copy",
    "speak": "Speak",
    "stop.speaking": "Stop speaking",
    "copied": "Copied to clipboard!",
    "failed.send": "Failed to send message. Please try again.",
    "failed.search": "Web search unavailable, using AI knowledge",
    "error.processing": "Sorry, I encountered an error while processing your message. Please try again.",

    // Theme/Language Toggle
    "theme.light": "Light theme",
    "theme.dark": "Dark theme",
    "theme.system": "System theme",
    "switch.language": "Hindi / English",

    // Auth Pages
    "auth.welcome": "Welcome to BharatShodh",
    "auth.join": "Join BharatShodh!",
    "auth.start": "Start with BharatShodh",
    "auth.signin": "Sign In",
    "auth.signup": "Create Account",
  },
  hi: {
    // Header/Sidebar
    "app.title": "भारतशोध",
    "app.subtitle": "एआई सहायक",
    "new.chat": "नई चैट",
    "no.conversations": "अभी तक कोई बातचीत नहीं।",
    "start.journey": "अपनी यात्रा शुरू करने के लिए एक नई चैट शुरू करें।",
    "loading": "लोड हो रहा है...",
    "logout": "लॉगआउट",
    "rename.chat": "नाम बदलें",
    "delete.chat": "चैट हटाएं",
    "chat.deleted": "चैट हटा दी गई",
    "chat.renamed": "चैट का नाम बदला गया",
    "new.chat.created": "नई चैट बनाई गई",

    // Input Box
    "ask.anything": "मुझसे कुछ भी पूछें...",
    "attach.file": "फ़ाइल जोड़ें",
    "start.voice": "वॉयस इनपुट शुरू करें",
    "stop.voice": "सुनना बंद करें",
    "search.web": "सर्च",
    "search.web.tooltip": "वेब सर्च टॉगल करें",
    "docs.rag": "दस्तावेज़",
    "docs.rag.tooltip": "दस्तावेज़ प्रश्न-उत्तर मोड टॉगल करें",
    "send.message": "संदेश भेजें",
    "docs.mode.active": "📚 दस्तावेज़ मोड सक्रिय - उत्तर अपलोड किए गए दस्तावेज़ों पर आधारित होंगे",

    // Chat Window
    "copy": "कॉपी",
    "speak": "बोलें",
    "stop.speaking": "बोलना बंद करें",
    "copied": "क्लिपबोर्ड पर कॉपी किया गया!",
    "failed.send": "संदेश भेजने में विफल। कृपया पुन: प्रयास करें।",
    "failed.search": "वेब सर्च अनुपलब्ध, एआई ज्ञान का उपयोग कर रहे हैं",
    "error.processing": "क्षमा करें, आपके संदेश को संसाधित करते समय मुझे एक त्रुटि हुई। कृपया पुन: प्रयास करें।",

    // Theme/Language Toggle
    "theme.light": "लाइट थीम",
    "theme.dark": "डार्क थीम",
    "theme.system": "सिस्टम थीम",
    "switch.language": "हिंदी / अंग्रेजी",

    // Auth Pages
    "auth.welcome": "भारतशोध में आपका स्वागत है",
    "auth.join": "भारतशोध से जुड़ें!",
    "auth.start": "भारतशोध के साथ शुरू करें",
    "auth.signin": "साइन इन करें",
    "auth.signup": "खाता बनाएँ",
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en'];
