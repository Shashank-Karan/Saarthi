#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Emotion, Verse
from comprehensive_verses import COMPREHENSIVE_VERSES_DATA
import uuid

def seed_verses():
    db = SessionLocal()
    try:
        # Get existing emotions
        emotions = db.query(Emotion).all()
        emotion_lookup = {emotion.name: emotion for emotion in emotions}
        
        print(f'Found {len(emotions)} emotions')
        print(f'Found {len(COMPREHENSIVE_VERSES_DATA)} verses to insert')
        
        # Clear existing verses first
        db.query(Verse).delete()
        
        # Insert verses
        for verse_data in COMPREHENSIVE_VERSES_DATA:
            if verse_data['emotion_name'] in emotion_lookup:
                emotion = emotion_lookup[verse_data['emotion_name']]
                verse = Verse(
                    id=str(uuid.uuid4()),
                    emotion_id=emotion.id,
                    sanskrit=verse_data['sanskrit'],
                    hindi=verse_data['hindi'],
                    english=verse_data['english'],
                    explanation=verse_data['explanation'],
                    chapter=verse_data['chapter'],
                    verse_number=verse_data['verse_number']
                )
                db.add(verse)
            else:
                print(f"Warning: Emotion '{verse_data['emotion_name']}' not found")
        
        db.commit()
        print('Successfully seeded all verses!')
        
        # Verify count
        for emotion_name, emotion in emotion_lookup.items():
            verse_count = db.query(Verse).filter(Verse.emotion_id == emotion.id).count()
            print(f"{emotion_name}: {verse_count} verses")
        
    except Exception as e:
        print(f'Error: {e}')
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_verses()