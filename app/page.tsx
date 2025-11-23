"use client";
import { useState, useRef } from "react";
import { Mic, Send, Loader2 } from "lucide-react";

export default function UserChat() {
  // --- Holatlar (States) ---
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Assalomu alaykum! Maktabgacha va maktab ta'limi bo'yicha qanday savolingiz bor?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // --- Reflar ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // --- 1. AI javobini qayta ishlash (Matn + HD Tabiiy Ovoz) ---
  const processAIResponse = async (text: string) => {
    // Chatga matnli xabarni qo'shish
    setMessages((prev) => [...prev, { role: "ai", text: text }]);
    
    try {
      // Backenddan OpenAI TTS-1-HD orqali yaratilgan chiroyli ovozni so'rash
      const response = await fetch("http://localhost:8000/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      
      if (!response.ok) throw new Error("TTS xatosi");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // Ovoz tiniq chiqishi uchun volumeni tekshiramiz
      audio.volume = 1.0;
      await audio.play();
      
      // Ijro tugagach, URLni tozalash (Xotirani tejash va "leaks" oldini olish uchun)
      audio.onended = () => window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Ovozli javobda xatolik:", error);
    }
  };

  // --- 2. Matnli savol yuborish funksiyasi ---
  const askAI = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: currentInput }),
      });
      
      const data = await response.json();
      await processAIResponse(data.answer);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "ai", text: "Xatolik: Backend bilan aloqa yo'q!" }]);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Ovozni yozib olish (STT) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append("file", audioBlob);

        setLoading(true);
        try {
          const response = await fetch("http://localhost:8000/ask-voice", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          
          // Ovozdan olingan matnni chatga qo'shish
          setMessages((prev) => [...prev, { role: "user", text: `🎤: ${data.user_text}` }]);
          
          // AI javobini va HD ovozni yuritish
          await processAIResponse(data.answer);
        } catch (e) {
          console.error("Ovozli xatolik:", e);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Mikrofonga ruxsat berilmadi!");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 text-center font-bold shadow-md flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span>Vazirlik AI Call-Markazi (HD Voice)</span>
        </div>
        {isRecording && <span className="text-red-200 animate-pulse text-sm font-medium">● Ovoz yozilmoqda...</span>}
      </div>

      {/* Chat xabarlari */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm transition-all ${
              m.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm flex items-center gap-2 bg-white/50 w-fit p-2 rounded-lg">
            <Loader2 className="animate-spin w-4 h-4 text-blue-600" /> 
            AI tahlil qilmoqda...
          </div>
        )}
      </div>

      {/* Input va Mikrofon qismi */}
      <div className="p-4 bg-white border-t flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Mikrofon tugmasi */}
        <button 
          onMouseDown={startRecording} 
          onMouseUp={stopRecording}
          onMouseLeave={isRecording ? stopRecording : undefined}
          className={`p-4 rounded-full transition-all active:scale-95 ${
            isRecording ? 'bg-red-500 scale-110 shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
          title="Gapirish uchun bosib turing"
        >
          <Mic size={24} className={isRecording ? "text-white" : ""} />
        </button>

        {/* Matnli input */}
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askAI()}
          disabled={isRecording || loading}
          className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50" 
          placeholder={isRecording ? "Sizni eshityapman..." : "Savolingizni yozing..."} 
        />

        {/* Yuborish tugmasi */}
        <button 
          onClick={askAI} 
          disabled={!input.trim() || loading || isRecording}
          className="bg-blue-700 text-white p-4 rounded-2xl hover:bg-blue-800 transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-md active:scale-95"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
}