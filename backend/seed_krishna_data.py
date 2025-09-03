#!/usr/bin/env python3
"""
Seed data for Krishna Path functionality
"""
from .database import get_db, engine
from .models import Emotion, Verse, Admin
from .main import get_password_hash
from sqlalchemy.orm import Session
import uuid

def seed_krishna_path_data():
    """Seed initial data for Krishna Path"""
    db = next(get_db())
    
    # Check if data already exists
    if db.query(Emotion).first():
        print("Krishna Path data already seeded")
        return
    
    # Create emotions
    emotions_data = [
        {"name": "happy", "display_name": "Happy", "color": "#FFD700"},
        {"name": "peace", "display_name": "Peace", "color": "#87CEEB"},
        {"name": "anxious", "display_name": "Anxious", "color": "#FFA500"},
        {"name": "angry", "display_name": "Angry", "color": "#FF4444"},
        {"name": "sad", "display_name": "Sad", "color": "#6495ED"},
        {"name": "protection", "display_name": "Protection", "color": "#32CD32"},
        {"name": "lazy", "display_name": "Lazy", "color": "#A9A9A9"},
        {"name": "lonely", "display_name": "Lonely", "color": "#9370DB"}
    ]
    
    emotions = []
    for emotion_data in emotions_data:
        emotion = Emotion(
            id=str(uuid.uuid4()),
            **emotion_data
        )
        db.add(emotion)
        emotions.append(emotion)
    
    db.commit()
    
    # Create verses
    verses_data = [
        # Joy & Happiness
        {
            "emotion_name": "joy",
            "sanskrit": "आनन्दमयोऽभ्यासात्",
            "hindi": "आनंद से भरपूर अभ्यास से",
            "english": "Through practice filled with joy",
            "explanation": "True joy comes from consistent spiritual practice and connecting with the divine consciousness within.",
            "chapter": "3",
            "verse_number": "27"
        },
        {
            "emotion_name": "joy", 
            "sanskrit": "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत",
            "hindi": "जब-जब धर्म की हानि होती है भारत",
            "english": "Whenever there is a decline in righteousness, O Bharata",
            "explanation": "Even in dark times, remembering Krishna's promise brings joy and hope for divine intervention.",
            "chapter": "4",
            "verse_number": "7"
        },
        # Peace & Calm
        {
            "emotion_name": "peace",
            "sanskrit": "शान्तिः शान्तिः शान्तिः",
            "hindi": "शांति शांति शांति",  
            "english": "Peace, peace, peace",
            "explanation": "True peace comes from surrendering to the divine will and releasing attachment to outcomes.",
            "chapter": "2",
            "verse_number": "47"
        },
        {
            "emotion_name": "peace",
            "sanskrit": "निर्द्वन्द्वो नित्यसत्त्वस्थो निर्योगक्षेम आत्मवान्",
            "hindi": "द्वन्द्वों से मुक्त, सदा सत्व में स्थित",
            "english": "Free from dualities, ever situated in goodness",
            "explanation": "Peace is found by transcending the dualities of pleasure-pain, honor-dishonor through spiritual understanding.",
            "chapter": "2",
            "verse_number": "45"
        },
        # Love & Devotion
        {
            "emotion_name": "love",
            "sanskrit": "भक्त्या मामभिजानाति यावान्यश्चास्मि तत्त्वतः",
            "hindi": "भक्ति से मुझे यथार्थ में जानते हैं",
            "english": "By devotion one truly knows Me as I am",
            "explanation": "Pure love and devotion is the highest path to knowing the divine nature of Krishna.",
            "chapter": "18",
            "verse_number": "55"
        },
        {
            "emotion_name": "love",
            "sanskrit": "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज",
            "hindi": "सभी धर्मों को छोड़कर मेरी शरण में आओ",
            "english": "Abandon all varieties of religion and surrender unto Me alone",
            "explanation": "True love for the divine means complete surrender and trust in Krishna's protection.",
            "chapter": "18", 
            "verse_number": "66"
        },
        # Wisdom & Clarity  
        {
            "emotion_name": "wisdom",
            "sanskrit": "ज्ञानेन तु तदज्ञानं येषां नाशितमात्मनः",
            "hindi": "परन्तु जिनका अज्ञान ज्ञान से नष्ट हो गया है",
            "english": "But for those whose ignorance is destroyed by knowledge of the Self",
            "explanation": "True wisdom dispels the darkness of ignorance and reveals our eternal spiritual nature.",
            "chapter": "5",
            "verse_number": "16"
        },
        # Strength & Courage
        {
            "emotion_name": "strength",
            "sanskrit": "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय",
            "hindi": "योग में स्थित होकर कर्म करो धनंजय",
            "english": "Established in yoga, perform action, O Dhananjaya",
            "explanation": "True strength comes from performing duties with detachment while connected to the divine.",
            "chapter": "2",
            "verse_number": "48"
        },
        # Forgiveness & Compassion
        {
            "emotion_name": "forgiveness",
            "sanskrit": "क्षमा शान्तिरुपरतिः सौम्यत्वं मार्दवं ह्रीः",
            "hindi": "क्षमा, शांति, संयम, सौम्यता, नम्रता और लज्जा",
            "english": "Forgiveness, tranquility, self-control, gentleness, humility and modesty",
            "explanation": "Forgiveness and compassion are divine qualities that purify the heart and bring us closer to Krishna.",
            "chapter": "16",
            "verse_number": "3"
        },
        # Doubt & Confusion
        {
            "emotion_name": "doubt",
            "sanskrit": "संशयात्मा विनश्यति",
            "hindi": "संशय करने वाला आत्मा नष्ट हो जाता है",
            "english": "A person who is full of doubt is ruined",
            "explanation": "When doubt arises, remember Krishna's teachings and seek guidance through scriptures and spiritual practice.",
            "chapter": "4",
            "verse_number": "40"
        },
        # Fear & Anxiety
        {
            "emotion_name": "fear",
            "sanskrit": "मा शुचः समुद्धरिष्यामि त्वा सर्वपापेभ्यो मोक्षयिष्यामि",
            "hindi": "शोक मत करो, मैं तुम्हें सभी पापों से मुक्त कर दूंगा",
            "english": "Do not fear, I shall deliver you from all sinful reactions",
            "explanation": "Krishna's promise removes all fear - surrendering to the divine provides ultimate protection and peace.",
            "chapter": "18",
            "verse_number": "66"
        }
    ]
    
    # Create emotion lookup
    emotion_lookup = {emotion.name: emotion for emotion in emotions}
    
    for verse_data in verses_data:
        emotion = emotion_lookup[verse_data["emotion_name"]]
        verse = Verse(
            id=str(uuid.uuid4()),
            emotion_id=emotion.id,
            sanskrit=verse_data["sanskrit"],
            hindi=verse_data["hindi"],
            english=verse_data["english"],
            explanation=verse_data["explanation"],
            chapter=verse_data["chapter"],
            verse_number=verse_data["verse_number"]
        )
        db.add(verse)
    
    # Create default admin
    admin = Admin(
        id=str(uuid.uuid4()),
        username="admin",
        password=get_password_hash("krishna123")  # Change this in production
    )
    db.add(admin)
    
    db.commit()
    print("Krishna Path data seeded successfully!")

if __name__ == "__main__":
    seed_krishna_path_data()