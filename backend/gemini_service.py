try:
    import google.generativeai as genai
except ImportError:
    print("Warning: google-generativeai not installed. AI features will not work.")
    genai = None

import os

# Load environment variables if they exist
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure Gemini API
if genai:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)

async def get_scripture_response(question: str) -> str:
    """Get AI response for scripture-related questions"""
    if not genai:
        return "AI service is currently unavailable. Please try again later."
    
    if not os.getenv("GEMINI_API_KEY"):
        return "AI service is not configured. Please contact administrator."
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        system_prompt = """You are a knowledgeable AI companion specializing in Hindu scriptures including the Bhagavad Gita, Vedas, Upanishads, and Puranas. 

Your role is to:
- Provide authentic, accurate answers about Hindu spiritual texts in 10 to 15 words sentence words only
- Reference specific verses or chapters when relevant
- Offer practical spiritual guidance based on scriptural wisdom
- Maintain a respectful, devotional tone
- Keep responses concise but meaningful or brief and direct easy to understandable
- Include relevant Sanskrit terms with translations when helpful

Please provide short, meaningful thoughtful responses (maximum 10-15 words) that honor the sacred nature of these texts while being accessible to modern seekers."""

        full_prompt = f"{system_prompt}\n\nQuestion: {question}"
        
        response = model.generate_content(full_prompt)
        return response.text or "I apologize, but I couldn't generate a response at this time. Please try asking your question again."
    
    except Exception as error:
        print(f"Gemini API error: {error}")
        return "I'm experiencing some technical difficulties right now. Please try again in a moment, and I'll do my best to help you with your spiritual inquiry."

async def generate_daily_wisdom() -> str:
    """Generate daily spiritual wisdom"""
    if not genai:
        return "May your day be filled with peace and spiritual growth."
    
    if not os.getenv("GEMINI_API_KEY"):
        return "May your day be filled with peace and spiritual growth."
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = "Share a brief, inspiring piece of wisdom from Hindu scriptures that would be meaningful for someone starting their day. Include the source text."
        
        response = model.generate_content(prompt)
        return response.text or "May your day be filled with peace and spiritual growth."
    
    except Exception as error:
        print(f"Error generating daily wisdom: {error}")
        return "May your day be filled with peace and spiritual growth."