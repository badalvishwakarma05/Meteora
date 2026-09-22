import requests
import os
from pathlib import Path
import json
import glob
import time
import logging
from datetime import datetime
import re
import sys
import http.client

# ==============================================================================
# 1. Read USERNAME and PASSWORD directly from config.py
# ==============================================================================
try:
    import config
    USERNAME = getattr(config, "USERNAME", "")
    PASSWORD = getattr(config, "PASSWORD", "")
    CONFIG_API_URLS = getattr(config, "API_URLS", {})
except ImportError:
    USERNAME = ""
    PASSWORD = ""
    CONFIG_API_URLS = {}

# ==============================================================================
# Date Range & 6-Hourly Time Block Configuration (7 Days Peak Window)
# ==============================================================================
# Strictly set from 2023-06-06 to 2023-06-12 (7 Days Peak Window)
START_DATE = "2023-06-06"
END_DATE = "2023-06-12"

# Target 6-hour blocks: '00', '06', '12', '18' UTC (4 slots/day * 7 days = 28 files total)
SYNOPTIC_HOURS = {0, 6, 12, 18}
EXPECTED_TOTAL_SLOTS = 28

# Target Cyclones / Dataset Date Range Configuration
target_cyclones = {
    "Biparjoy": {
        "start_date": START_DATE,
        "end_date": END_DATE
    }
}

TARGET_CYCLONES = [
    {"name": name, "start_date": info["start_date"], "end_date": info["end_date"]}
    for name, info in target_cyclones.items()
]

# Global token holder
CURRENT_ACCESS_TOKEN = None

try:
    import urllib3.exceptions
    URLLIB3_ERRORS = (urllib3.exceptions.IncompleteRead, urllib3.exceptions.ProtocolError)
except ImportError:
    URLLIB3_ERRORS = ()

try:
    from tqdm.auto import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    print("\n[INFO] 'tqdm' library is not installed. Progress will be displayed in standard text mode.\n")

def preprocess_json(raw_json):
    """Escapes unescaped backslashes for Windows-style paths in 'config.json'."""
    fixed_json = re.sub(r'(?<!\\)\\(?![\\/"bfnrtu])', r'\\\\', raw_json)
    fixed_json = re.sub(r'(?<!\\)\\(?=\s*")', r'\\\\', fixed_json)
    return fixed_json

def load_config(): 
    """Loads and validates configuration from config.json (with fallback values)."""
    global USERNAME, PASSWORD
    try:
        with open("config.json", "r") as file:
            raw_config = file.read()
        
        try:
            cfg = json.loads(raw_config)
        except json.JSONDecodeError:
            fixed_json = preprocess_json(raw_config)
            try:
                cfg = json.loads(fixed_json)
            except json.JSONDecodeError:
                cfg = {}

        if not USERNAME:
            user_creds = cfg.get("user_credentials", {})
            USERNAME = user_creds.get("username/email", "") or user_creds.get("username", "")
        if not PASSWORD:
            user_creds = cfg.get("user_credentials", {})
            PASSWORD = user_creds.get("password", "")

        if "download_settings" not in cfg:
            cfg["download_settings"] = {
                "download_path": "./data/mosdac"
            }
        return cfg
    
    except FileNotFoundError:
        return {
            "download_settings": {"download_path": "./data/mosdac"},
            "search_parameters": {"datasetId": "3RIMG_L1B_STD"}
        }

# Load config settings
config_file = load_config()

# API Endpoints & URLs
api_urls = config_file.get("api_urls", {})
token_url = CONFIG_API_URLS.get("token_url") or api_urls.get("token_url", "https://mosdac.gov.in/download_api/gettoken")
search_url = CONFIG_API_URLS.get("search_url") or api_urls.get("search_url", "https://mosdac.gov.in/apios/datasets.json")
check_internet_url = CONFIG_API_URLS.get("check_internet_url") or api_urls.get("check_internet_url", "https://mosdac.gov.in/download_api/check-internet")
download_url = CONFIG_API_URLS.get("download_url") or api_urls.get("download_url", "https://mosdac.gov.in/download_api/download")
refresh_url = CONFIG_API_URLS.get("refresh_url") or api_urls.get("refresh_url", "https://mosdac.gov.in/download_api/refresh-token")
logout_url = CONFIG_API_URLS.get("logout_url") or api_urls.get("logout_url", "https://mosdac.gov.in/download_api/logout")

download_settings = config_file.get('download_settings', {})

# Base download path defaulting to ./data/mosdac
configured_path = download_settings.get("download_path", "./data/mosdac").replace("\\", "/") or "./data/mosdac"
if not configured_path.endswith("/mosdac") and not configured_path.endswith("mosdac"):
    download_path = os.path.join(configured_path, "mosdac").replace("\\", "/")
else:
    download_path = configured_path

use_date_structure = download_settings.get("organize_by_date", False)
skip_user_input = download_settings.get("skip_user_input", True)
generate_logs = download_settings.get("generate_error_logs", False)

search_params = config_file.get('search_parameters', {})
datasetId = search_params.get("datasetId", "3RIMG_L1B_STD")
startTime = START_DATE
endTime = END_DATE
startIndex = int(search_params.get("startIndex", 1) or 1)
boundingBox = search_params.get("boundingBox", "")
gId = search_params.get("gId", "")

logger = logging.getLogger("client_error_logger")

try:
    if generate_logs:
        error_logs_dir = download_settings.get("error_logs_dir") or os.path.join(os.getcwd(), "error_logs")
        os.makedirs(error_logs_dir, exist_ok=True)

        date_str = datetime.now().strftime("%d-%m-%Y")
        log_file_path = os.path.join(error_logs_dir, f"{date_str}_error.log")

        file_handler = logging.FileHandler(log_file_path)
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(levelname)s - %(message)s",
            datefmt="%d-%m-%Y %H:%M:%S"
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        logger.setLevel(logging.ERROR)
        logger.propagate = False
except PermissionError:
    print(f"\n[ERROR]: No permission to write error logs to '{error_logs_dir}'.\n")
    sys.exit(1)
except Exception as e:
    print(f"\nException encountered in generating logs: {e}\n")

def supports_color():
    if sys.platform != "win32":
        return True
    return "ANSICON" in os.environ or "WT_SESSION" in os.environ or os.environ.get("TERM_PROGRAM") == "vscode"

if supports_color():
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"
    RESET = "\033[0m"
else:
    GREEN = RED = YELLOW = CYAN = RESET = BOLD = UNDERLINE = ""

# ==============================================================================
# 2. Dynamic Token Generation Function
# ==============================================================================
def get_fresh_token():
    """
    Authenticates with the MOSDAC API using USERNAME and PASSWORD (from config.py)
    and returns a fresh Access Token string.
    """
    global CURRENT_ACCESS_TOKEN

    if not USERNAME or not PASSWORD:
        print(f"\n{RED}[ERROR] USERNAME or PASSWORD missing. Please configure them in 'config.py'.{RESET}")
        return None

    data = {
        "username": USERNAME, 
        "password": PASSWORD
    }

    try:
        print(f"{CYAN}[AUTH] Requesting fresh MOSDAC Access Token for '{USERNAME}'...{RESET}")
        response = requests.post(token_url, json=data, timeout=20)

        if response.status_code == 200:
            token_response = response.json()
            fresh_token = token_response.get("access_token")
            if fresh_token:
                CURRENT_ACCESS_TOKEN = fresh_token
                print(f"{GREEN}[AUTH SUCCESS] Fresh Access Token generated successfully.{RESET}")
                return fresh_token
            else:
                print(f"{RED}[ERROR] 'access_token' missing in token response: {token_response}{RESET}")
                return None

        elif response.status_code in (401, 403):
            print(f"{RED}[ERROR] Authentication failed (HTTP {response.status_code}). Please verify USERNAME/PASSWORD in 'config.py'.{RESET}")
            return None
        
        elif response.status_code == 503:
            print(f"{RED}[ERROR] MOSDAC Service Unavailable (503): {response.text}{RESET}")
            return None

        else:
            print(f"{RED}[ERROR] Unexpected response from Token API ({response.status_code}): {response.text}{RESET}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"{RED}[ERROR] Network error occurred while fetching token: {e}{RESET}")
        if generate_logs:
            logger.error("Error fetching fresh Access Token: ", exc_info=True)
        return None

def get_token():
    """Wrapper backwards-compatible with previous callers."""
    token = get_fresh_token()
    if token:
        return {"access_token": token, "refresh_token": ""}, USERNAME
    return None

def get_six_hour_block_key(identifier, prod_date=None):
    """
    Hour-Based 6-Hour Block Matching:
    Checks if a dataset item timestamp falls in the '00', '06', '12', or '18' hour block.
    Returns a unique key like '2023-06-06_00', '2023-06-06_06', '2023-06-06_12', '2023-06-06_18'.
    Returns None if the timestamp belongs to intermediate non-target hours.
    """
    ident_str = str(identifier).upper()
    
    # 1. Check DDMMMYYYY_HHMM in filename (e.g. 3RIMG_06JUN2023_0015_... or Biparjoy_3RIMG_12JUN2023_1815_...)
    match = re.search(r'(\d{2})([A-Z]{3})(\d{4})_(\d{2})(\d{2})', ident_str)
    if match:
        day, month_str, year, hh, mm = match.groups()
        try:
            dt = datetime.strptime(f"{day}{month_str}{year}", "%d%b%Y")
            hour_val = int(hh)
            if hour_val in SYNOPTIC_HOURS:
                return f"{dt.strftime('%Y-%m-%d')}_{hour_val:02d}"
        except Exception:
            pass

    # 2. Check YYYYMMDD_HHMM in filename (e.g. 3RIMG_20230606_0000_...)
    match = re.search(r'(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})', ident_str)
    if match:
        year, month, day, hh, mm = match.groups()
        try:
            hour_val = int(hh)
            if hour_val in SYNOPTIC_HOURS:
                return f"{year}-{month}-{day}_{hour_val:02d}"
        except Exception:
            pass

    # 3. Check ISO formatted product timestamp if present (e.g. 2023-06-06T00:15:00Z)
    if prod_date:
        try:
            clean_date = str(prod_date).replace("Z", "").replace("T", " ")
            dt = datetime.fromisoformat(clean_date)
            if dt.hour in SYNOPTIC_HOURS:
                return f"{dt.strftime('%Y-%m-%d')}_{dt.hour:02d}"
        except Exception:
            pass

    return None

def format_size(size_mb):
    if size_mb < 1024:
        return f"{size_mb:,.2f} MB"
    elif size_mb < 1024 ** 2:
        size_gb = size_mb / 1024
        return f"{size_gb:,.2f} GB"
    else:
        size_tb = size_mb / (1024 ** 2)
        return f"{size_tb:,.2f} TB"

def search_results(start_time=None, end_time=None, cyclone_name=None):
    """Fetches total dataset search results for the given cyclone date range.""" 
    c_label = f" for Cyclone '{cyclone_name}'" if cyclone_name else ""
    s_time = start_time if start_time is not None else START_DATE
    e_time = end_time if end_time is not None else END_DATE

    print()
    print(f"Searching MOSDAC Data{c_label} ({s_time} to {e_time})...")
    data = {"datasetId": datasetId}

    optional_parameters = {
        "startTime": s_time,
        "endTime": e_time,
        "boundingBox": boundingBox,
        "gId": gId
    }
    data.update({k: v for k, v in optional_parameters.items() if v})

    try:
        res = requests.get(search_url, params=data, timeout=25)
        
        if res.status_code == 200:
            res_json = res.json()
            totalResults = res_json.get("totalResults", 0)
            totalSize = res_json.get("totalSizeMB", 0)
            formatted_size = format_size(totalSize)

            print(f"\n{UNDERLINE}{totalResults:,}{RESET} Files Found with Total Size of {UNDERLINE}{formatted_size}{RESET}{c_label}")
            return totalResults
        
        elif res.status_code // 100 in [4, 5]: 
            res_json = res.json()
            error_message = res_json.get('message', ['Unknown error'])[0] if isinstance(res_json.get('message'), list) else res_json.get('message', 'Unknown error')
            print(f"\n[ERROR] Error Fetching Data from Search Endpoint.\nStatus Code: {res.status_code}\nError Message: {error_message}\n")
            return 0
        
    except (requests.ConnectionError, requests.Timeout):
        print("\n[ERROR] Network Error: No Internet Connection Detected.\nPlease check your network connection.\n")
        return 0

    except requests.exceptions.RequestException as e:
        print(f"\n[ERROR] Unexpected Status Code in Search API Response: {e}")
        return 0

# ==============================================================================
# 4. Resilient Download Function with Dynamic 401/403 Token Refresh & Retry
# ==============================================================================
def download_file_with_retry(record_id, identifier, prod_date, counter, total_files, cyclone_name=None, access_token=None):
    """
    Downloads .h5 file with:
    1. .part Temporary Files: Streams to target_file.part and renames to .h5 on 100% completion.
    2. Dynamic 401/403 Handling: If token expires mid-download, calls get_fresh_token() to refresh headers and retries seamlessly without exiting.
    3. Cleanup on Failure: Deletes partial/broken .part files if connection drops.
    4. Skip Logic: ONLY skips if the final .h5 file exists and has size > 0 (ignoring .part files).
    5. Aggressive Timeouts: Uses timeout=(30, 300) (30s connect, 300s read) for slow/heavy network streams.
    6. Print MB Progress: Prints regular progress updates every 10 MB inside chunk loop.
    7. Progress Counter: 'Downloading file [X] of [Total]...'
    """
    global CURRENT_ACCESS_TOKEN

    active_token = access_token or CURRENT_ACCESS_TOKEN
    if not active_token:
        active_token = get_fresh_token()
        if not active_token:
            print(f"{RED}[ERROR] Could not obtain valid Access Token. Skipping {identifier}...{RESET}")
            return None

    if cyclone_name:
        folder_structure = os.path.join(download_path, cyclone_name)
    else:
        folder_structure = download_path

    os.makedirs(folder_structure, exist_ok=True) 

    # Target final .h5 filename construction
    base_filename = identifier
    if cyclone_name and not base_filename.startswith(f"{cyclone_name}_"):
        target_filename = f"{cyclone_name}_{base_filename}"
    else:
        target_filename = base_filename

    if not target_filename.endswith(".h5") and not target_filename.endswith(".H5"):
        target_filename = f"{target_filename}.h5"

    file_path = os.path.join(folder_structure, target_filename)
    tmp_file_path = file_path + ".part"

    # Skip Logic: ONLY skip if final .h5 exists and has size > 0
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        file_sz_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"\n[INFO] File {counter} of {total_files}: {target_filename} already exists ({file_sz_mb:.2f} MB). Skipping download..")
        return 'EXISTS'

    # Clean up any leftover broken .part file before starting
    if os.path.exists(tmp_file_path):
        try:
            os.remove(tmp_file_path)
        except Exception:
            pass

    max_retries = 5
    retry_delay = 15
    attempt = 0

    while attempt < max_retries:
        attempt += 1
        headers = {"Authorization": f"Bearer {active_token}"}
        params = {"id": record_id}

        try:
            response = requests.get(download_url, headers=headers, params=params, stream=True, timeout=(30, 300))

            # 4. Dynamic Token Refresh on 401 or 403 (DO NOT STOP SCRIPT)
            if response.status_code in (401, 403):
                print(f"\n{YELLOW}[TOKEN EXPIRED] Received HTTP {response.status_code} while downloading '{target_filename}'. Refreshing token dynamically...{RESET}")
                
                # Clean broken partial file
                if os.path.exists(tmp_file_path):
                    try:
                        os.remove(tmp_file_path)
                    except Exception:
                        pass

                fresh_token = get_fresh_token()
                if fresh_token:
                    active_token = fresh_token
                    print(f"{GREEN}[RETRYING] Retrying download with refreshed token (Attempt {attempt}/{max_retries})...{RESET}")
                    continue
                else:
                    print(f"{RED}[ERROR] Failed to obtain fresh token during retry. Waiting {retry_delay}s...{RESET}")
                    time.sleep(retry_delay)
                    continue

            if response.status_code == 400:
                try:
                    resp = response.json()
                    err_msg = resp.get('error', 'Validation error')
                except Exception:
                    err_msg = response.text
                print(f"\n[ERROR] Validation Error on '{target_filename}': {err_msg}\n")
                return None
            
            if response.status_code == 404:
                try:
                    error_data = response.json()
                    if error_data.get("code") == "NOT_RELEASED":
                        return error_data.get("code")
                except Exception:
                    pass
                return None
            
            if response.status_code == 429:
                print(f"\n[RATE LIMIT] Rate limit reached. Waiting 20 seconds before retry...")
                time.sleep(20)
                continue
                            
            response.raise_for_status()
            
            total_size = int(response.headers.get('Content-Length', 0))
            content_disposition = response.headers.get('Content-Disposition')

            if not (content_disposition and 'filename=' in content_disposition):
                print(f"\n[WARNING] {identifier}: File Not Available on the Server. Skipping File..") 
                return None

            file_size_mb = total_size / (1024 * 1024) if total_size > 0 else 0
            file_size_str = f"{file_size_mb:.2f} MB" if total_size > 0 else "Unknown"
            
            # Progress print statement: "Downloading file [X] of [Total]..."
            print(f"\nDownloading file {counter} of {total_files}: {target_filename} | Size: {file_size_str} (Attempt {attempt}/{max_retries})")
            
            # Stream into .part temporary file
            chunk_size = 1048576  # 1MB chunk
            download_size = 0
            last_printed_mb = 0
            start_time = time.time()
            progress_step_bytes = 10 * 1024 * 1024  # 10 MB updates

            with open(tmp_file_path, "wb") as file:
                if HAS_TQDM:
                    tqdm_kwargs = {"ascii": True} if sys.platform == "win32" else {}
                    with tqdm(
                        desc=f"Stream ({counter}/{total_files})", total=total_size, unit='B', unit_scale=True, unit_divisor=1024,
                        smoothing=0.3, miniters=1, mininterval=0.2, dynamic_ncols=True, **tqdm_kwargs
                    ) as bar:
                        bar.start_t = start_time
                        for chunk in response.iter_content(chunk_size=chunk_size): 
                            if chunk:
                                file.write(chunk)
                                download_size += len(chunk)
                                bar.update(len(chunk))
                                bar.refresh()
                else:                     
                    bar_length = 50
                    for chunk in response.iter_content(chunk_size=chunk_size):
                        if chunk:
                            file.write(chunk)
                            download_size += len(chunk)
                            
                            # Print MB Progress inside chunk loop
                            if download_size - last_printed_mb >= progress_step_bytes or download_size >= total_size:
                                last_printed_mb = download_size
                                current_mb = download_size / (1024 * 1024)
                                percent = (download_size / total_size * 100.0) if total_size > 0 else 0
                                elapsed = max(0.1, time.time() - start_time)
                                speed_mb_s = current_mb / elapsed
                                num_bars = int(bar_length * (percent / 100.0))
                                bar_str = f"[{'#' * num_bars}{'.' * (bar_length - num_bars)}]"
                                sys.stdout.write(f"\r{bar_str} {current_mb:.1f}/{file_size_mb:.1f} MB ({percent:.1f}%) | {speed_mb_s:.2f} MB/s")
                                sys.stdout.flush()
                    print()

            # Verify integrity: only rename from .part to final .h5 if 100% completed
            if os.path.exists(tmp_file_path):
                actual_downloaded = os.path.getsize(tmp_file_path)
                if total_size > 0 and actual_downloaded < total_size:
                    raise http.client.IncompleteRead(actual_downloaded, total_size - actual_downloaded)
                
                # Atomic rename from .part to final .h5
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                os.rename(tmp_file_path, file_path)
                print(f"{GREEN}[SUCCESS] Download completed 100%: {target_filename} ({os.path.getsize(file_path)/(1024*1024):.2f} MB){RESET}")
            
            return file_path

        except PermissionError:
            print(f"\n{RED}[ERROR]: No Permission to Write to '{download_path}'. Please Check Directory Permissions.{RESET}")
            if os.path.exists(tmp_file_path):
                try:
                    os.remove(tmp_file_path)
                except Exception:
                    pass
            return "Permission Denied"

        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout,
                requests.exceptions.ChunkedEncodingError, requests.exceptions.RequestException,
                http.client.IncompleteRead, ConnectionResetError, OSError) + URLLIB3_ERRORS as e:
            
            print(f"\n{YELLOW}[WARNING] Network drop / Timeout on '{target_filename}' (Attempt {attempt}/{max_retries}): {e}{RESET}")
            
            # Cleanup on Failure: delete broken .part file before retrying
            if os.path.exists(tmp_file_path):
                try:
                    os.remove(tmp_file_path)
                    print(f"[CLEANUP] Deleted broken partial file: {target_filename}.part")
                except Exception:
                    pass

            if attempt < max_retries:
                print(f"{CYAN}[INFO] Sleeping {retry_delay}s before retrying ({attempt + 1}/{max_retries})...{RESET}")
                time.sleep(retry_delay)
            else:
                print(f"\n{RED}[ERROR] Download failed after {max_retries} attempts for '{target_filename}'. Skipping...{RESET}")
                if generate_logs:
                    logger.error(f"Download failed after {max_retries} attempts for {identifier}: {e}")
                return None

    return None

def download_data(bearer_token, record_id, identifier, prod_date, counter, total_files, cyclone_name=None):
    """Backwards compatibility alias for download_file_with_retry."""
    return download_file_with_retry(
        record_id=record_id,
        identifier=identifier,
        prod_date=prod_date,
        counter=counter,
        total_files=total_files,
        cyclone_name=cyclone_name,
        access_token=bearer_token
    )

# ==============================================================================
# 3. Bulk Download Controller
# ==============================================================================
def start_bulk_download():
    """
    Main bulk download pipeline:
    1. Authenticates using get_fresh_token() before entering loop.
    2. Searches dataset for 7-day peak window ('2023-06-06' to '2023-06-12').
    3. Filters ONLY the first available file per 6-hour block ('00', '06', '12', '18' UTC).
    4. Downloads each file using download_file_with_retry(), automatically handling mid-stream token refreshes.
    """
    print(f"\n{BOLD}=================================================={RESET}")
    print(f"{BOLD}    MOSDAC Historical Cyclone Bulk Downloader     {RESET}")
    print(f"{BOLD}=================================================={RESET}")
    print(f"Target Date Range       : {BOLD}{START_DATE} to {END_DATE}{RESET} (7 Days Peak Window)")
    print(f"Synoptic Time Blocks    : {BOLD}['00', '06', '12', '18'] UTC{RESET} (1 file per 6-hour block -> Exactly {EXPECTED_TOTAL_SLOTS} files)")
    print(f"Base Storage Directory  : {download_path}")

    # Fetch initial token using get_fresh_token()
    token = get_fresh_token()
    if not token:
        print(f"\n{RED}[CRITICAL] Authentication failed. Cannot start download pipeline.{RESET}")
        return False

    total_all_downloaded = 0
    total_all_skipped = 0
    total_all_existing = 0
    overall_start_time = time.time()

    try:
        for cyclone in TARGET_CYCLONES:
            c_name = cyclone["name"]
            c_start = cyclone["start_date"]
            c_end = cyclone["end_date"]

            print(f"\n{BOLD}{'='*60}{RESET}")
            print(f"{BOLD}Target Cyclone: {c_name} | Window: {c_start} to {c_end}{RESET}")
            print(f"{BOLD}{'='*60}{RESET}")

            # Step 1: Search total files in window
            total_files = search_results(start_time=c_start, end_time=c_end, cyclone_name=c_name)
            if not total_files:
                print(f"No files found or error occurred for Cyclone '{c_name}'. Skipping...")
                continue

            # Step 2: Discover and isolate ONLY the FIRST available file per 6-hour block
            seen_blocks = set()
            filtered_entries = []
            current_search_index = 1
            batch_size = 100

            print(f"\nFiltering 6-hour blocks ('00', '06', '12', '18' UTC) — selecting ONLY the first available file per block...")
            
            search_params_payload = {
                "datasetId": datasetId,
                "startTime": c_start,
                "endTime": c_end,
                "count": batch_size,
                "boundingBox": boundingBox,
                "gId": gId
            }
            search_params_payload = {k: v for k, v in search_params_payload.items() if v}

            while current_search_index <= total_files:
                search_params_payload["startIndex"] = current_search_index
                try:
                    res = requests.get(search_url, params=search_params_payload, timeout=30)
                    if res.status_code == 200:
                        entries = res.json().get('entries', [])
                        if not entries:
                            break

                        for item in entries:
                            identifier = item.get('identifier', '')
                            prod_date = item.get('updated')

                            # Hour-based matching
                            block_key = get_six_hour_block_key(identifier, prod_date)
                            if block_key and block_key not in seen_blocks:
                                seen_blocks.add(block_key)
                                filtered_entries.append(item)
                                print(f"  • Block [{len(filtered_entries)}/{EXPECTED_TOTAL_SLOTS}] {block_key} UTC -> {identifier}")

                                if len(filtered_entries) >= EXPECTED_TOTAL_SLOTS:
                                    break

                        if len(filtered_entries) >= EXPECTED_TOTAL_SLOTS:
                            break

                        current_search_index += batch_size
                    else:
                        print(f"Search API returned HTTP {res.status_code}. Stopping pagination.")
                        break
                except requests.exceptions.RequestException as e:
                    print(f"[ERROR] Search pagination error: {e}")
                    break

            total_target_files = len(filtered_entries) if filtered_entries else EXPECTED_TOTAL_SLOTS
            print(f"\n{BOLD}{GREEN}Successfully isolated {len(filtered_entries)} synoptic 6-hour files across {c_start} to {c_end} (Target: {EXPECTED_TOTAL_SLOTS} files).{RESET}")

            # Step 3: Download each file with retry & token refresh
            c_start_time = time.time()
            download_count = 0
            skip_count = 0
            existing_count = 0

            for file_index, item in enumerate(filtered_entries, 1):
                identifier = item['identifier']
                record_id = item['id']
                prod_date = item.get('updated')

                file_path = download_file_with_retry(
                    record_id=record_id,
                    identifier=identifier,
                    prod_date=prod_date,
                    counter=file_index,
                    total_files=total_target_files,
                    cyclone_name=c_name
                )

                if file_path == 'EXISTS':
                    existing_count += 1
                elif file_path == 'NOT_RELEASED' or not file_path:
                    skip_count += 1
                elif file_path == "Permission Denied":
                    print(f"\n{RED}[ERROR] Permission Denied on target directory. Stopping pipeline.{RESET}")
                    break
                elif file_path and os.path.exists(file_path):
                    download_count += 1
                else:
                    skip_count += 1

            c_end_time = time.time()
            total_all_downloaded += download_count
            total_all_skipped += skip_count
            total_all_existing += existing_count

            print(f"\n{GREEN}Processing Completed for Cyclone '{c_name}'!{RESET}")
            c_time = c_end_time - c_start_time
            print(f"  • Files Newly Downloaded : {download_count}")
            print(f"  • Files Already Existing : {existing_count}")
            print(f"  • Unreleased / Skipped   : {skip_count}")
            print(f"  • Time Taken             : {c_time:.2f} sec")

    finally:
        overall_end_time = time.time()
        total_time = overall_end_time - overall_start_time
        total_minutes = total_time / 60
        total_hours = total_time / 3600

        print(f"\n{BOLD}=================================================={RESET}")
        print(f"{BOLD}               DOWNLOAD SUMMARY                   {RESET}")
        print(f"{BOLD}=================================================={RESET}")
        print(f"Total Files Newly Downloaded : {total_all_downloaded}")
        print(f"Total Files Already Existing : {total_all_existing}")
        print(f"Total Unreleased / Skipped   : {total_all_skipped}")

        if total_hours >= 1:
            print(f"Total Time Taken             : {total_hours:.2f} hr")
        elif total_minutes >= 1:
            print(f"Total Time Taken             : {total_minutes:.2f} min")
        else:
            print(f"Total Time Taken             : {total_time:.2f} sec")

        logout()

    return True

def logout():
    data = {"username": USERNAME} 
    try:
        requests.post(logout_url, json=data, timeout=5)
    except Exception:
        pass

def main():
    start_bulk_download()

if __name__ == "__main__":
    main()
