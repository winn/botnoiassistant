import requests
import json
import uuid
from datetime import datetime

# Configuration
SUPABASE_URL = "https://bkajnqaikyduvqkpbhzo.supabase.co"
SHARE_ID = "your-share-id-here"  # Replace with actual share ID
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWpucWFpa3lkdXZxa3BiaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDEwNzEsImV4cCI6MjA1MjYxNzA3MX0.oWTm9dsu3p3QoZUNLfbHurqXVGtIQSidvFTCzDNqyvc"

def test_proxy():
    # Edge function endpoint
    function_url = f"{SUPABASE_URL}/functions/v1/proxy"

    # Create a test payload
    payload = {
        "sessionId": str(uuid.uuid4()),  # Generate a random session ID
        "shareId": SHARE_ID,
        "message": "สวัสดีค่ะ"  # Test message in Thai
    }

    print(f"\n=== Testing Proxy Function ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"URL: {function_url}")
    print("\nPayload:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))

    try:
        # Make the request
        print("\nSending request...")
        response = requests.post(
            function_url,
            json=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {ANON_KEY}'
            }
        )
        
        # Print response details
        print(f"\nResponse Status: {response.status_code}")
        print("Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")

        # Parse and print response body
        try:
            response_data = response.json()
            print("\nResponse Body:")
            print(json.dumps(response_data, indent=2, ensure_ascii=False))

            # Additional debug info if available
            if response_data.get('debug'):
                print("\nDebug Information:")
                print("Environment Variables:")
                for key, value in response_data['debug'].get('env', {}).items():
                    print(f"  {key}: {value}")
                
                print("\nSQL Queries:")
                print(response_data['debug'].get('sql_query', 'No SQL query available'))

        except json.JSONDecodeError:
            print("\nNon-JSON Response:")
            print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"\nRequest Error: {str(e)}")
    except Exception as e:
        print(f"\nUnexpected Error: {str(e)}")

if __name__ == "__main__":
    if SHARE_ID == "your-share-id-here":
        print("Please replace 'your-share-id-here' with an actual share ID")
    else:
        test_proxy()