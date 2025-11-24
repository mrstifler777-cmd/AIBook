# AI Book Generator (BookWriter.py)

An automated book writing system that uses OpenAI's GPT model to plan and write complete multi-chapter books on any topic using async/await for efficient API calls.

## Overview

This script uses a two-agent system:
1. **Planner Agent**: Creates a comprehensive chapter outline with sections
2. **Writer Agent**: Writes each section with varied length, natural style, and proper references

The result is a full-length markdown book (configurable all the way to 300 pages or more) on your specified topic.

## How It Works

### Architecture

```
┌─────────────────┐
│ Planner Agent   │ → Generates configurable chapter outline
└────────┬────────┘   (default: 5-8 chapters with 3-8 sections each)
         │
         ▼
┌─────────────────┐
│ Writer Agent    │ → Writes each section (2700 to 4500 chars)
└────────┬────────┘   with natural flow and references
         │
         ▼
┌─────────────────┐
│ Output File     │ → Configurable markdown book file
└─────────────────┘   (default: "The Book of Secrets")
```

### Process Flow

1. **Planning Phase**
   - Planner agent analyzes the topic
   - Creates JSON outline with chapters and sections
   - Includes retry logic (up to 3 attempts) for robust JSON parsing
   - Uses async/await for non-blocking API calls

2. **Writing Phase**
   - Iterates through each chapter sequentially
   - For each section:
     - Passes previous text (last 4000 chars) for context continuity
     - Generates 2700 to 4500 characters per section
     - Uses high temperature (0.95) for creative, varied output and penalties to reduce repetition
     - Retries up to 3 times on failure

3. **Output**
   - Writes incrementally to configured output file
   - Preserves progress even if interrupted
   - Formatted as clean markdown with headers

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- OpenAI API key
- Internet connection

### Installation Steps

1. **Clone or navigate to the project directory**
   ```powershell
   cd "c:\AIBookProject"
   ```

2. **Create a virtual environment** (if not already created)
   ```powershell
   python -m venv .venv
   ```

3. **Activate the virtual environment**
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

4. **Install required packages**
   ```powershell
   pip install openai python-dotenv
   ```

5. **Create a `.env` file** in the project root with your configuration:
   ```env
   OPENAI_API_KEY=your-api-key-here
   BOOK_FILE_NAME=The Book of Secrets
   BOOK_TOPIC=The importance of using a .env file to store environment variables securely
   PAGES=50
   CHAPTERS=5-8
   ```

## Running the Script

### Basic Usage

```powershell
python BookWriter.py
```

### Expected Output

```
Planning book...
Outline created.

Writing: Introduction
 → Section: Company History
 → Section: Mission and Vision
 → Section: Industry Context

Writing: Core Products and Services
 → Section: Clearinghouse Platform Overview
 → Section: Electronic Claims Processing
...

BOOK COMPLETE → [configured filename]
```

### Interrupting the Process

- Press Ctrl+C to stop gracefully
- Progress is saved incrementally to the configured output file
- Script includes clean interrupt handling

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | **Required** |
| `BOOK_FILE_NAME` | Output filename for the book | "The Book of Secrets" |
| `BOOK_TOPIC` | Topic and scope for the book | "The importance of using a .env file to store environment variables securely" |
| `PAGES` | Target number of pages | "50" |
| `CHAPTERS` | Number of chapters (range or exact) | "5-8" |

### Script Parameters

Edit these constants in BookWriter.py:

```python
MODEL = "gpt-4.1"                    # OpenAI model to use
# Note: Output file is configured via BOOK_FILE_NAME in .env
```

### Writing Style Controls

In the writer_agent() function:

```python
temperature=0.95,           # Higher = more creative (0.0 to 2.0)
presence_penalty=1.2,       # Reduces repetition (range: -2.0 to 2.0)
frequency_penalty=1.1,      # Encourages topic diversity (range: -2.0 to 2.0)
max_tokens=5000,           # Maximum tokens per section
```

**Temperature** controls output randomness. Lower values (0.0 to 0.7) produce focused, deterministic text. Higher values (0.9 to 2.0) produce more creative, varied output. The script uses 0.95 to generate natural-sounding content that avoids repetitive patterns across hundreds of pages.

## Output

- **File**: Configurable via `BOOK_FILE_NAME` environment variable (default: "The Book of Secrets")
- **Format**: Markdown with H1 chapters, sections as plain text
- **Length**: Configurable via `PAGES` environment variable (default: 50 pages)
- **Structure**:
  ```markdown
  # [Book Topic]
  
  # Chapter 1 Title
  
  ## Section 1.1
  [Content...]
  
  ## Section 1.2
  [Content...]
  
  # Chapter 2 Title
  ...
  ```

## Troubleshooting

### Common Issues

**API Key Error**
```
Error: OpenAI API key not found
```
- Ensure .env file exists with OPENAI_API_KEY=your-key
- Check that .env is in the same directory as BookWriter.py

**Planner Fails to Generate Outline**
```
RuntimeError: Planner failed after 3 attempts.
```
- Check your API key has sufficient credits
- Verify internet connection
- Try reducing the complexity of `BOOK_TOPIC`
- Note: Script retries up to 3 times with 2-second delays

**JSON Parsing Issues**
- Script includes automatic JSON repair logic
- If persistent, the model may need different instructions
- Check that MODEL is set correctly (gpt-4.1 or compatible)

**Slow Performance**
- Each section takes 10 to 30 seconds to generate
- Full book can take 1 to 3 hours depending on outline size
- This is normal for GPT-4 models

## Tips for Best Results

1. **Topic Clarity**: Be specific in BOOK_TOPIC. Include:
   - Subject matter
   - Target audience
   - Desired depth/expertise level

2. **Monitor Progress**: Watch the console output to track chapter completion

3. **Cost Awareness**: GPT-4 API calls cost money. A full book might cost between $1 and $20+ depending on configured length (PAGES and CHAPTERS settings)

4. **Review Output**: AI-generated content should be reviewed and fact-checked

5. **Customization**: Adjust temperature and penalties for different writing styles:
   - Lower temperature (0.5 to 0.7) produces more focused, technical writing
   - Higher temperature (0.9 to 1.2) produces more creative, varied writing

## Technical Details

### Dependencies

- openai: OpenAI Python SDK for API access
- python-dotenv: Environment variable management
- asyncio: Asynchronous execution for efficient API calls
- json: JSON parsing and validation

### Error Handling

- **Retry Logic**: Both agents retry failed API calls
- **JSON Validation**: Includes repair mechanism for malformed JSON
- **Graceful Interruption**: Keyboard interrupt handled cleanly
- **Incremental Writing**: Progress saved after each section

### Performance

- **Async/Await**: Efficient async operations
- **Context Window**: Maintains last 4000 chars for continuity
- **Rate Limiting**: Built-in delays between retries (1 to 2 seconds)

## Example .env File

```env
# Required
OPENAI_API_KEY=sk-proj-abcd1234...

# Optional (defaults shown)
BOOK_FILE_NAME=The Book of Secrets
BOOK_TOPIC=The importance of using a .env file to store environment variables securely
PAGES=50
CHAPTERS=5-8
```

## Security Notes

- Never commit .env file to version control
- Keep your OpenAI API key confidential
- Monitor API usage to avoid unexpected charges
