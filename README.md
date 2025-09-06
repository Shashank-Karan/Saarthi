# Saarthi

Saarthi is an AI-powered Hindu scripture companion that helps users connect with ancient wisdom from texts such as the Bhagavad Gita and the Vedas. The platform offers a personalized experience, allowing users to chat with an AI companion, join a community of spiritual seekers, and access a rich library of scriptures and daily insights.

## Live Demo

🌐 **Deployed at:** [https://saarthi-rzwb.onrender.com/](https://saarthi-rzwb.onrender.com/)


## Features

- **AI Chat**: Converse with an AI that understands Hindu scriptures and provides personalized spiritual insights.
- **Community**: Join a community of like-minded spiritual seekers.
- **Scripture Library**: Access and explore a curated collection of Hindu scriptures.
- **Daily Wisdom**: Receive daily thoughts and teachings for inspiration.
- **Posts & Comments**: Share posts, like, and comment within the community.
- **Admin Dashboard**: Advanced statistics and moderation tools for administrators.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, JWT authentication, bcrypt password hashing, Pydantic, Uvicorn
- **Frontend**: TypeScript, React (with components such as `hero-section.tsx`), Tailwind CSS
- **Database**: Relational database (via SQLAlchemy ORM)
- **Authentication**: JWT-based registration and login
- **APIs**: RESTful endpoints for users, posts, comments, chat, emotional journaling, and admin management

## Getting Started

### Backend

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2. Set up environment variables (see `.env.example`).
3. Run the backend server:
    ```bash
    python main.py
    ```

### Frontend

1. Navigate to the `client` directory.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the frontend development server:
    ```bash
    npm run dev
    ```

## Example Usage

- **Start Your Journey**: Sign up and begin interacting with the AI companion and community.
- **Watch Demo**: See how Saarthi can help you explore spiritual wisdom.

## Project Structure

- `backend/`: FastAPI backend, models, and API logic.
- `client/`: Frontend React app (TypeScript).
- `main.py`: Entry point for the backend server.

## License

This project currently does not specify a license.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---
