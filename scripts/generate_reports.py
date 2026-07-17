import os
import re
import google.genai as genai
import requests
import time

# Configuration
TARGET_LOCATION = "Ibeju-Lekki, Lagos"
GEMINI_MODEL = "gemini-2.5-flash"
MAX_RETRIES = 3

# Initialize Gemini client correctly
# The new SDK automatically reads GEMINI_API_KEY from the environment natively
client = genai.Client()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase environment variables")

def slugify(text):
    """Convert text to URL-friendly slug."""
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

def generate_report_content():
    """Generate real estate report using Gemini with retry logic."""
    prompt = f"""
    Generate a professional real estate market report for {TARGET_LOCATION}. 
    Include current market trends, investment opportunities, property prices, 
    and growth projections for the next 12 months.
    Format as markdown.
    """
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text
        except Exception as e:
            if "rate_limit" in str(e).lower() and attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                print(f"Rate limited. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise

def generate_linkedin_ad():
    """Generate LinkedIn ad copy using Gemini."""
    prompt = f"""
    Create a compelling LinkedIn ad (max 300 characters) promoting real estate 
    investment opportunities in {TARGET_LOCATION}. Focus on ROI and growth potential.
    """
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text[:300]
        except Exception as e:
            if "rate_limit" in str(e).lower() and attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
            else:
                raise

def generate_whatsapp_broadcast():
    """Generate WhatsApp broadcast text using Gemini."""
    prompt = f"""
    Create a WhatsApp broadcast message (max 160 characters) about real estate 
    opportunities in {TARGET_LOCATION}. Make it engaging and include a call-to-action.
    """
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text[:160]
        except Exception as e:
            if "rate_limit" in str(e).lower() and attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
            else:
                raise

def generate_cold_email():
    """Generate cold B2B email using Gemini."""
    prompt = f"""
    Write a professional cold B2B email (200-300 words) pitching a real estate 
    development opportunity in {TARGET_LOCATION} to a property developer or investor.
    Include subject line.
    """
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text
        except Exception as e:
            if "rate_limit" in str(e).lower() and attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
            else:
                raise

def upsert_report():
    """Generate content and upsert to Supabase."""
    print(f"Generating report for {TARGET_LOCATION}...")
    
    content = generate_report_content()
    linkedin_ad = generate_linkedin_ad()
    whatsapp_text = generate_whatsapp_broadcast()
    email = generate_cold_email()
    
    slug = slugify(TARGET_LOCATION)
    
    payload = {
        "slug": slug,
        "location": TARGET_LOCATION,
        "year": "2026",
        "content": content,
        "marketing_linkedin": linkedin_ad,
        "marketing_whatsapp": whatsapp_text,
        "marketing_email": email,
    }
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": f"{SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    
    url = f"{SUPABASE_URL}/rest/v1/market_reports"
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"Successfully upserted report for {TARGET_LOCATION}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error upserting report: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Detailed Server Response: {e.response.text}")
        raise

if __name__ == "__main__":
    upsert_report()
