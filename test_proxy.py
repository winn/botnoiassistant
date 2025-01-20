import requests
import json
import uuid
from datetime import datetime

# Configuration
SUPABASE_URL = "https://bkajnqaikyduvqkpbhzo.supabase.co"
AGENT_ID = "your-agent-id-here"  # Replace with actual agent ID
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWpucWFpa3lkdXZxa3BiaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDEwNzEsImV4cCI6MjA1MjYxNzA3MX0.oWTm9dsu3p3QoZUNLfbHurqXVGtIQSidvFTCzDNqyvc"

def test_proxy():
    # Edge function endpoint
    function_url = f"{SUPABASE_URL}/functions/v1/proxy"

    # Test 1: Create new session
    print("\n=== Test 1: Create New Session ===")
    payload = {
        "agentId": AGENT_ID,
        "timestamp": int(datetime.now().timestamp() * 1000)
    }
    
    print(f"URL: {function_url}")
    print("\nPayload:")
    print(json.dumps(payload, indent=2))

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

        try:
            response_data = response.json()
            print("\nResponse Body:")
            print(json.dumps(response_data, indent=2))

            if response_data.get('success') and response_data.get('sessionId'):
                # Test 2: Update session with message
                print("\n=== Test 2: Update Session ===")
                update_payload = {
                    "agentId": AGENT_ID,
                    "sessionId": response_data['sessionId'],
                    "message": "Hello, this is a test message"
                }
                
                print("\nPayload:")
                print(json.dumps(update_payload, indent=2))

                update_response = requests.post(
                    function_url,
                    json=update_payload,
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {ANON_KEY}'
                    }
                )

                print(f"\nResponse Status: {update_response.status_code}")
                print("\nResponse Body:")
                print(json.dumps(update_response.json(), indent=2))

        except json.JSONDecodeError:
            print("\nNon-JSON Response:")
            print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"\nRequest Error: {str(e)}")
    except Exception as e:
        print(f"\nUnexpected Error: {str(e)}")

if __name__ == "__main__":
    if AGENT_ID == "your-agent-id-here":
        print("Please replace 'your-agent-id-here' with an actual agent ID")
    else:
        test_proxy()