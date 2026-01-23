import os
import sqlite3
import shutil
import pandas as pd
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()
client = OpenAI()

app = FastAPI(title="Vazirlik AI (Grammar Master)")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'vazirlik_logs.db')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    input: str

print("Tizim ishga tushmoqda...")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0) # 0.0 - Eng aniq rejim
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

def init_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            timestamp DATETIME
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def initialize_rag():
    data_path = os.path.join(BASE_DIR, "data")
    if not os.path.exists(data_path): os.makedirs(data_path)
    all_documents = []
    print("Hujjatlar yuklanmoqda...")
    
    for filename in os.listdir(data_path):
        file_path = os.path.join(data_path, filename)
        if filename.endswith(('.csv', '.xlsx', '.xls')):
            try:
                if filename.endswith(('.xlsx', '.xls')):
                    df = pd.read_excel(file_path)
                else:
                    try:
                        df = pd.read_csv(file_path)
                    except UnicodeDecodeError:
                        df = pd.read_excel(file_path)
                
                for _, row in df.iterrows():
                    content = " ".join([f"{col}: {val}" for col, val in row.items() if pd.notna(val) and str(val).strip() != ""])
                    if content:
                        all_documents.append(Document(page_content=content, metadata={"source": filename}))
                print(f"OK: {filename}")
            except Exception: pass

    if not all_documents:
        all_documents.append(Document(page_content="Vazirlik haqida umumiy ma'lumot.", metadata={"source": "system"}))

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    splits = text_splitter.split_documents(all_documents)
    chroma_path = os.path.join(BASE_DIR, "chroma_db")
    return Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=chroma_path)

vector_db = initialize_rag()
retriever = vector_db.as_retriever(search_kwargs={"k": 3})

def force_to_latin(text):
    if not text: return ""
    mapping = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
        "ж": "j", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "x", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sh", "ъ": "'",
        "ы": "i", "ь": "", "э": "e", "ю": "yu", "я": "ya",
        "ў": "o'", "қ": "q", "ғ": "g'", "ҳ": "h",
        "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Е": "E", "Ё": "Yo",
        "Ж": "J", "З": "Z", "И": "I", "Й": "Y", "К": "K", "Л": "L", "М": "M",
        "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U",
        "Ф": "F", "Х": "X", "Ц": "Ts", "Ч": "Ch", "Ш": "Sh", "Щ": "Sh", "Ъ": "'",
        "Ы": "I", "Ь": "", "Э": "E", "Ю": "Yu", "Я": "Ya",
        "Ў": "O'", "Қ": "Q", "Ғ": "G'", "Ҳ": "H"
    }
    result = ""
    for char in text:
        result += mapping.get(char, char)
    return result


grammar_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "VAZIFA: Berilgan o'zbekcha matnning imlo xatolarini tuzat va sheva so'zlarini adabiy tilga o'tkaz. \n"
     "QAT'IY QOIDALAR: \n"
     "1. MATN MA'NOSINI O'ZGARTIRMA. Savolga javob berma. Faqat tuzat. \n"
     "2. LUG'AT: \n"
     "   - 'bovotti' -> 'bo'lyapti' \n"
     "   - 'kerek' -> 'kerak' \n"
     "   - 'qatta' -> 'qayerda' \n"
     "   - 'obor' -> 'olib bor' \n"
     "   - 'kellu' -> 'kelgan edi' \n"
     "3. Natija faqat toza matn bo'lsin."),
    ("human", "{text}")
])

main_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "ROL: Sen O'zbekiston Ta'lim vazirligi dispetcherisan. \n"
     "VAZIFA: Berilgan savolga aniq, qisqa va rasmiy javob ber. \n"
     "QOIDA: Javobni majburan LOTIN alifbosida yoz. \n\n"
     "KONTEKST: {context}"),
    ("human", "{input}")
])


@app.get("/logs")
async def get_logs():
    try:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        conn.close()
        return [{"id": r[0], "question": r[1], "answer": r[2], "time": r[3]} for r in rows]
    except Exception: return []

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    try:
        latin_input = force_to_latin(request.input)

        grammar_chain = grammar_prompt | llm
        clean_text = grammar_chain.invoke({"text": latin_input}).content

        docs = retriever.invoke(clean_text)
        context = "\n\n".join([doc.page_content for doc in docs])
        chain = main_prompt | llm
        raw_response = chain.invoke({"context": context, "input": clean_text}).content
        
        final_response = force_to_latin(raw_response)
        
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("INSERT INTO logs (question, answer, timestamp) VALUES (?, ?, ?)",
                       (clean_text, final_response, now))
        conn.commit()
        conn.close()
        
        return {"answer": final_response}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-voice")
async def ask_voice(file: UploadFile = File(...)):
    try:
        temp_file = "input_audio.webm"
        with open(temp_file, "wb") as buffer: shutil.copyfileobj(file.file, buffer)

        # 1. WHISPER (Eshitish)
        print("Whisper ishlayapti...")
        with open(temp_file, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file, 
                prompt="Assalomu alaykum. Vazirlik, maktab, bog'cha. Bovotti, kerek. Sof o'zbek tili."
            )
        
        raw_text = force_to_latin(transcription.text)
        print(f"Xom (Whisper): {raw_text}")

        print("Imlo tuzatilmoqda...")
        grammar_chain = grammar_prompt | llm
        clean_text = grammar_chain.invoke({"text": raw_text}).content
        print(f"Toza matn: {clean_text}")

        docs = retriever.invoke(clean_text)
        context = "\n\n".join([doc.page_content for doc in docs])
        chain = main_prompt | llm
        raw_response = chain.invoke({"context": context, "input": clean_text}).content
        

        final_response = force_to_latin(raw_response)

        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("INSERT INTO logs (question, answer, timestamp) VALUES (?, ?, ?)",
                       (clean_text, final_response, now))
        conn.commit()
        conn.close()

        if os.path.exists(temp_file): os.remove(temp_file)
        return {"user_text": clean_text, "answer": final_response}
    except Exception as e:
        print(f"XATO: {e}")
        return {"user_text": "...", "answer": "Uzr, ovoz kelmadi."}

@app.get("/stats")
async def get_stats():
    try:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM logs")
        total_calls = cursor.fetchone()[0]
        
        today = datetime.now().strftime("%Y-%m-%d")
        cursor.execute("SELECT COUNT(*) FROM logs WHERE timestamp LIKE ?", (f"{today}%",))
        today_calls = cursor.fetchone()[0]
        
        saved_money = total_calls * 3200
        
        conn.close()
        return {
            "total_calls": total_calls,
            "today_calls": today_calls,
            "saved_money": f"{saved_money:,} so'm",
            "efficiency": "92%" 
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/text-to-speech")
async def text_to_speech(request: QuestionRequest):
    try:
        clean_text = force_to_latin(request.input)
        if not clean_text or len(clean_text) < 2:
             raise HTTPException(status_code=400, detail="Text too short")
        
        speech_file_path = Path(BASE_DIR) / "response_audio.mp3"
        response = client.audio.speech.create(model="tts-1-hd", voice="nova", input=clean_text)
        response.stream_to_file(speech_file_path)
        return FileResponse(speech_file_path, media_type="audio/mpeg")
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin-stats")
async def admin_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM logs")
    count = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(rating) FROM logs WHERE rating > 0")
    avg_rating = cursor.fetchone()[0] or 0
    
    conn.close()
    
    saved_money = count * 3200
    
    return {
        "count": count,
        "saved_money": f"{saved_money:,} so'm",
        "rating": round(avg_rating, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
