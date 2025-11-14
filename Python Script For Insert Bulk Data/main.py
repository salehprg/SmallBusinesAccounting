import pandas as pd
import requests
from datetime import datetime
import os
import jdatetime
from decimal import Decimal, ROUND_HALF_UP

# Config
API_BASE = "http://localhost:5159"  # ← change this to your actual API base URL
# Credentials (can be overridden via environment variables)
USERNAME = os.getenv("API_USERNAME", "admin")
PASSWORD = os.getenv("API_PASSWORD", "Admin@123")

def login_and_get_token():
    """
    Authenticate against the API and return a JWT token.
    Tries to handle both JSON and plain-text token responses.
    """
    try:
        url = f"{API_BASE}/api/Auth/login"
        resp = requests.post(
            url,
            json={"username": USERNAME, "password": PASSWORD},
            headers={"accept": "text/plain", "Content-Type": "application/json"},
            timeout=20
        )
        resp.raise_for_status()

        token = None

        data = resp.json().get("data", {})
        # Common possible fields that may contain the token
        token = data.get("token") or data.get("access_token") or data.get("jwt")

        return token
    except Exception as e:
        print(f"ERROR: Failed to login and obtain JWT token: {e}")
        raise

# Perform login at startup and build headers dynamically
try:
    TOKEN = login_and_get_token()
except Exception:
    # If login fails, stop the script
    exit(1)

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Load Excel
df = pd.read_excel("Bill.Statement.Report_1403_04.xlsx", sheet_name="Final_Data")  # ← replace with your Excel file path

# Rename Persian headers to simpler English ones
df.columns = ["row", "date", "description", "card_holder", "deposit", "withdrawal", "card_number"]

# Convert Persian/Excel date to Gregorian date
def parse_date(val):
    if isinstance(val, pd.Timestamp):
        return val.to_pydatetime().isoformat()
    
    try:
        date_str = str(val).strip()
        
        # Try different Persian date formats
        persian_formats = [
            "%Y/%m/%d",   # 1402/10/15
            "%Y-%m-%d",   # 1402-10-15
            "%Y.%m.%d",   # 1402.10.15
            "%d/%m/%Y",   # 15/10/1402
            "%d-%m-%Y",   # 15-10-1402
            "%d.%m.%Y",   # 15.10.1402
        ]
        
        for fmt in persian_formats:
            try:
                # Parse as Persian date
                if "/" in date_str or "-" in date_str or "." in date_str:
                    # Try to determine if it's Y/M/D or D/M/Y format
                    parts = date_str.replace("/", "-").replace(".", "-").split("-")
                    if len(parts) == 3:
                        # If first part is 4 digits, assume Y/M/D format
                        if len(parts[0]) == 4:
                            year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
                        # If last part is 4 digits, assume D/M/Y format
                        elif len(parts[2]) == 4:
                            day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                        else:
                            continue
                        
                        # Create Persian date and convert to Gregorian
                        persian_date = jdatetime.date(year, month, day)
                        gregorian_date = persian_date.togregorian()
                        return gregorian_date.isoformat()
                        
            except (ValueError, jdatetime.InvalidJalaliDate):
                continue
        
        # If Persian date parsing fails, try as regular Gregorian date
        return datetime.strptime(date_str, "%Y-%m-%d").isoformat()
        
    except Exception as e:
        print(f"Warning: Could not parse date '{val}', using current date. Error: {e}")
        return datetime.now().isoformat()

# Function to read already processed row IDs from dedicated file
def load_processed_row_ids(filename="processed_ids.txt"):
    processed_rows = set()
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and line.isdigit():
                        processed_rows.add(int(line))
        except Exception as e:
            print(f"Warning: Could not read processed IDs file: {e}")
    return processed_rows

# Function to save processed row IDs to dedicated file
def save_processed_row_id(row_id, filename="processed_ids.txt"):
    try:
        with open(filename, "a", encoding="utf-8") as f:
            f.write(f"{row_id}\n")
    except Exception as e:
        print(f"Warning: Could not save processed ID {row_id}: {e}")

# Get already processed row IDs from dedicated file
processed_row_ids = load_processed_row_ids()
print(f"Found {len(processed_row_ids)} already processed rows: {sorted(list(processed_row_ids))}")

# Open log file to track processing status (append mode)
log_file = open("processing_log.txt", "a", encoding="utf-8")
log_file.write(f"\n=== New Processing Session Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===\n")

# Step 1: Fetch all persons
try:
    resp = requests.get(f"{API_BASE}/api/Persons", headers=HEADERS)
    resp.raise_for_status()
    persons = resp.json().get("data", [])
    log_file.write(f"SUCCESS | Fetched {len(persons)} persons from API\n")
except Exception as e:
    log_file.write(f"FAILED | Could not fetch persons: {str(e)}\n")
    log_file.close()
    exit(1)

# Step 2: Loop through Excel rows and send to API
total_rows = len(df)
skipped_count = 0
processed_count = 0
success_count = 0
failed_count = 0

for _, row in df.iterrows():
    row_id = row['row']
    
    # Skip if this row was already successfully processed
    if row_id in processed_row_ids:
        print(f"Row {row_id} already processed successfully. Skipping.")
        skipped_count += 1
        continue
    
    processed_count += 1
    person = None
    if pd.notna(row['card_number']) and row['card_number'] != "":
        card_number = str(int(row['card_number'])).strip()
        person = next((p for p in persons if p.get("accountNumber") == card_number), None)

    transaction_type = 1 if row["deposit"] > 0 else 2 if row["withdrawal"] > 0 else None
    amount = row["deposit"] if transaction_type == 1 else row["withdrawal"]

    if transaction_type is None or amount == 0:
        message = f"Invalid transaction amount or type for row {row_id}. Skipping."
        print(message)
        log_file.write(f"{row_id} | FAILED | {message}\n")
        failed_count += 1
        continue

    payload = {
        "name": row["card_holder"] if pd.notna(row["card_holder"]) and row["card_holder"] != "" else row['description'],
        "description": row["description"],
        "amount": str(amount),
        "isCash": False,
        "date": parse_date(row["date"]),
        "transactionType": transaction_type,
        "personId": person["id"] if person else None
    }

    try:
        post_resp = requests.post(f"{API_BASE}/api/Transactions", headers=HEADERS, json=payload)
        
        # Parse the JSON response
        try:
            response_data = post_resp.json()
            api_success = response_data.get("success", False)
            api_code = response_data.get("code", post_resp.status_code)
            api_message = response_data.get("message", "No message")
            api_dev_message = response_data.get("developerMessage", "")
            
            # Check if transaction was successful based on API response
            if api_success and (api_code == 200 or api_code == 201):
                message = f"Transaction added for {row['card_holder']} - amount: {amount}"
                print(message)
                log_file.write(f"{row_id} | SUCCESS | {message}\n")
                success_count += 1
                # Add to processed_row_ids to prevent duplicates in same session
                processed_row_ids.add(row_id)
                # Save processed row ID to dedicated file
                save_processed_row_id(row_id)
            else:
                # Log the detailed error information
                error_detail = f"API Code: {api_code}, Message: {api_message}"
                if api_dev_message:
                    error_detail += f", Dev Message: {api_dev_message}"
                
                message = f"Failed to add transaction for {row['card_holder']}: {error_detail}"
                print(message)
                log_file.write(f"{row_id} | FAILED | {message}\n")
                failed_count += 1
                
        except ValueError as json_error:
            # If response is not valid JSON
            message = f"Failed to parse API response for {row['card_holder']}: HTTP {post_resp.status_code}, Response: {post_resp.text[:200]}"
            print(message)
            log_file.write(f"{row_id} | FAILED | {message}\n")
            failed_count += 1
            
    except Exception as e:
        message = str(e)
        print(message)
        log_file.write(f"{row_id} | FAILED | {message}\n")
        failed_count += 1

# Close the log file with summary
log_file.write(f"\n=== Session Summary ===\n")
log_file.write(f"Total rows in Excel: {total_rows}\n")
log_file.write(f"Previously processed (skipped): {skipped_count}\n")
log_file.write(f"Newly processed: {processed_count}\n")
log_file.write(f"Successful: {success_count}\n")
log_file.write(f"Failed: {failed_count}\n")
log_file.write(f"Processing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
log_file.close()

print(f"\n=== Processing Summary ===")
print(f"Total rows in Excel: {total_rows}")
print(f"Previously processed (skipped): {skipped_count}")
print(f"Newly processed: {processed_count}")
print(f"Successful: {success_count}")
print(f"Failed: {failed_count}")
print("Check 'processing_log.txt' for detailed results.")
