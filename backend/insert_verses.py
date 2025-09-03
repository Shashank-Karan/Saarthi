import psycopg2
import os
import uuid
from comprehensive_verses import COMPREHENSIVE_VERSES_DATA

# Get database connection from environment
DATABASE_URL = os.environ.get('DATABASE_URL')

def insert_verses():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # Get emotion IDs
        cur.execute("SELECT id, name FROM emotions")
        emotions = {name: id for id, name in cur.fetchall()}
        print(f"Found emotions: {list(emotions.keys())}")
        
        # Clear existing verses
        cur.execute("DELETE FROM verses")
        print("Cleared existing verses")
        
        # Insert all verses
        inserted_count = 0
        for verse_data in COMPREHENSIVE_VERSES_DATA:
            emotion_name = verse_data['emotion_name']
            if emotion_name in emotions:
                verse_id = str(uuid.uuid4())
                emotion_id = emotions[emotion_name]
                
                cur.execute("""
                    INSERT INTO verses (id, emotion_id, sanskrit, hindi, english, explanation, chapter, verse_number, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    verse_id,
                    emotion_id,
                    verse_data['sanskrit'],
                    verse_data['hindi'],
                    verse_data['english'],
                    verse_data['explanation'],
                    verse_data['chapter'],
                    verse_data['verse_number'],
                    True
                ))
                inserted_count += 1
            else:
                print(f"Warning: Emotion '{emotion_name}' not found")
        
        # Commit the transaction
        conn.commit()
        print(f"Successfully inserted {inserted_count} verses")
        
        # Verify counts
        cur.execute("""
            SELECT e.name, COUNT(v.id) as verse_count 
            FROM emotions e 
            LEFT JOIN verses v ON e.id = v.emotion_id 
            GROUP BY e.name 
            ORDER BY e.name
        """)
        for name, count in cur.fetchall():
            print(f"{name}: {count} verses")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    insert_verses()