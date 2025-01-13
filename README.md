# Thai Text to Speech Application

## Environment Setup

This application requires two API keys to function properly:

1. OpenAI API Key - For the chat functionality
2. Botnoi Voice API Token - For text-to-speech conversion

### Setting Up Environment Variables

1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   BOTNOI_TOKEN=your_botnoi_token_here
   ```

**Important:** Never commit the `.env` file to version control. It's already added to `.gitignore`.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```