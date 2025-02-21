# SQL Agent Service

A service that allows users to query databases using natural language.

## Setup

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: 
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your values
6. Run the application: `uvicorn app.main:app --reload`

## Features

- Natural language to SQL conversion
- Query template management
- User authentication
- API key management
