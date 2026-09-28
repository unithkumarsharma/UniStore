from supabase import create_client, Client
from config.settings import Config

_supabase_client: Client = None

def get_supabase() -> Client:
    """
    Returns an initialized Supabase Python client instance.
    Connects to the cloud Supabase project when SUPABASE_URL and SUPABASE_KEY are provided.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if Config.SUPABASE_URL and Config.SUPABASE_KEY:
        try:
            _supabase_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
            return _supabase_client
        except Exception as e:
            print(f"⚠️ Failed to initialize Supabase client: {e}")
            return None
    return None

_supabase_admin_client: Client = None

def get_supabase_admin() -> Client:
    """
    Returns an initialized Supabase Python admin client with service_role privileges.
    Bypasses RLS for secure server-side administrative tasks.
    """
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client

    key = Config.SUPABASE_SERVICE_ROLE_KEY or Config.SUPABASE_KEY
    if Config.SUPABASE_URL and key:
        try:
            _supabase_admin_client = create_client(Config.SUPABASE_URL, key)
            return _supabase_admin_client
        except Exception as e:
            print(f"⚠️ Failed to initialize Supabase admin client: {e}")
            return None
    return None

