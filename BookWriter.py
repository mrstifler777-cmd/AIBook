import os
import json
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI Client & .env CONFIGURATION VARIABLES
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
BOOK_FILE_NAME = os.getenv("BOOK_FILE_NAME", "The Book of Secrets")
BOOK_TOPIC = os.getenv("BOOK_TOPIC",
                       "The importance of using a .env file to store"
                       " environment variables securely"
                       )
PAGES = os.getenv("PAGES", "50")
CHAPTERS = os.getenv("CHAPTERS", "5-8")

# MODEL SELECTION
MODEL = "gpt-4.1"


# JSON VALIDATION UTIL
def try_parse_json(text):
    """
    Try parsing JSON safely. Attempts a repair if needed.
    """
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError, TypeError):
        # Try to extract JSON content between brackets
        try:
            start = text.find("[")
            end = text.rfind("]")
            if start != -1 and end != -1:
                cleaned = text[start:end+1]
                return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError, TypeError):
            return None
    return None
# EXAMPLE OUTPUT TO BE PARSED
# [
#   {
#     "chapter_title": "Introduction to the Clearinghouse Ecosystem",
#     "sections": [
#       "Origins of the company",
#       "Overview of health information exchange",
#       "Role of clearinghouses in medical billing"
#     ]
#   },
#   {
#     "chapter_title": "Major Products and Platforms",
#     "sections": [
#       "Provider engagement tools",
#       "Payer connectivity solutions",
#       "Portals and interoperability services",
#       "Analytics and reporting frameworks"
#     ]
#   }
# ]


# PLANNER AGENT
async def planner_agent():
    """
    Creates the entire chapter outline.
    Returns a list of chapter objects in JSON.
    """
    system = (
        "You are a book planner. Your job is ONLY to output a JSON array. "
        "No commentary. No intro. No markdown. Do not use em dashes. "
        "Each section and chapter is a unique length. "
        "Each element is a chapter with the format: "
        "{ 'chapter_title': str, 'sections': [str, str, ...] }. "
        "Output ONLY JSON."
    )

    user_prompt = (
        f"Plan a full {PAGES}-page book on the topic: '{BOOK_TOPIC}'. "
        f"Create {CHAPTERS} chapters. Each chapter should have 3-8 sections. "
        "Each chapter and section should have a varied length and focus. "
        "DO NOT use em dashes or emojis. "
        "DO NOT write the content. ONLY output JSON."
    )

    for attempt in range(3):
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=6000,
                temperature=0.3,
                n=1
            )
# https://platform.openai.com/docs/guides/prompt-engineering
            raw = resp.choices[0].message.content.strip()
#   ChatCompletion(
#   id='xx',
#   object='chat.completion',
#   created=1234567890,
#   model='gpt-4.1-2025-04-14',
#   service_tier='default',
#   system_fingerprint='xxx',

#   choices=[
#     Choice(
#       index=0,
#       finish_reason='stop',
#       logprobs=None,

#       message=ChatCompletionMessage(
#         role='assistant',
#         refusal=None,
#         annotations=[],
#         audio=None,
#         function_call=None,
#         tool_calls=None,

#         content='[
#   {
#     "chapter_title": "Introduction to the Healthcare
#                           Clearinghouse Landscape",
#     "sections": [
#       "Overview of the Healthcare Clearinghouse Landscape",
#       "The Role of Clearinghouses in Healthcare",
#       "Key Players in the Clearinghouse Market",
#       "Clearinghouse Position and Differentiators",
#       "Recent Trends in Healthcare Data Exchange"
#     ]
#   },
# ]'
#       )
#     )
#   ],

#   usage=CompletionUsage(
#     prompt_tokens=169,
#     completion_tokens=700,
#     total_tokens=869,

#     prompt_tokens_details=PromptTokensDetails(
#       audio_tokens=0,
#       cached_tokens=0
#     ),

#     completion_tokens_details=CompletionTokensDetails(
#       audio_tokens=0,
#       reasoning_tokens=0,
#       accepted_prediction_tokens=0,
#       rejected_prediction_tokens=0
#     )
#   )
            # Log raw output (DEBUG)
            # with open("planner_raw_output.txt", "a", encoding="utf-8") as f:
            #     f.write(raw + "\n\n--- NEW RUN ---\n\n")

            outline = try_parse_json(raw)
            # Log parsed output (DEBUG)
            # with open("planner_parsed_list.txt", "a", encoding="utf-8") as f:
            #     f.write(str(outline) + "\n\n--- NEW RUN ---\n\n")

            if isinstance(outline, list):
                return outline

            print(f"Planner attempt {attempt+1} failed: JSON not parseable")

        except Exception as e:
            print(f"Planner error attempt {attempt+1}: {e}")

        await asyncio.sleep(2)

    raise RuntimeError("Planner failed after 5 attempts.")


# WRITER AGENT
async def writer_agent(chapter_title, section_title, previous_text):
    """
    Writes one section with varied length, rich detail,
    references, and avoids repetition.
    """
    system = (
        "You are a professional long-form book writing agent. "
        "Your style is varied, avoids repetition, and flows naturally. "
        "Each section should feel human-written and not formulaic. "
        "DO NOT use em dashes or emojis. "
        "Provide references whenever appropriate "
        "(academic, historical, scientific). "
        "DO NOT plagiarize. "
        "Section length must vary (some short, some long)."
    )

    user_prompt = f"""
Write the section titled:
- Chapter: {chapter_title}
- Section: {section_title}

Guidelines:
- Vary sentence structure.
- Vary section length.
- Use a random length between 2700 and 4500 characters.
- No repetitive phrasing.
- DO NOT use em dashes or emojis.
- Natural, human tone.
- Include relevant references (books, journals, public sources).
- Incorporate context from previous sections for continuity:

PREVIOUS_TEXT:
{previous_text}
"""

    for attempt in range(3):
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=5000,
                temperature=0.95,
                presence_penalty=1.2,
                frequency_penalty=1.1,
            )
            return resp.choices[0].message.content

        except Exception as e:
            print(f"Writer attempt {attempt+1} failed: {e}")
            await asyncio.sleep(1)

    return f"ERROR WRITING SECTION: {chapter_title} / {section_title}\n"


# MAIN BOOK WRITER LOOP
async def write_book():
    print("\n Planning book...")
    outline = await planner_agent()
    print("Outline created.\n")

    book_path = f"{BOOK_FILE_NAME}"

    # Start fresh (overwrite existing file)
    with open(book_path, "w", encoding="utf-8") as f:
        f.write(f"# {BOOK_TOPIC}\n\n")

    cumulative_text = ""

    # Loop chapters
    for chap in outline:
        chapter_title = chap["chapter_title"]
        sections = chap["sections"]

        print(f"\n Writing: {chapter_title}")

        with open(book_path, "a", encoding="utf-8") as f:
            f.write(f"\n# {chapter_title}\n\n")

        # Loop sections
        for sec in sections:
            print(f" → Section: {sec}")

            section_text = await writer_agent(
                chapter_title,
                sec,
                previous_text=cumulative_text[-4000:]
            )

            with open(book_path, "a", encoding="utf-8") as f:
                f.write(f"{section_text}\n\n")

            cumulative_text += section_text

    print(f"\n BOOK COMPLETE → {book_path}\n")


# ENTRY POINT to ensure clean async run, error handling, 
# and avoid import issues
if __name__ == "__main__":
    try:
        asyncio.run(write_book())
    except KeyboardInterrupt:
        print("\n Manual interrupt received. Exiting cleanly.\n")
    except Exception as e:
        print(f"\n Fatal Error: {e}\n")
