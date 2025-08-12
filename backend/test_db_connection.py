"""
Test database connection to Supabase
Run this script to verify your database configuration is working correctly.
"""
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from app.core.config import settings
from app.core.supabase import SupabaseClient


def test_sqlalchemy_connection():
    """Test connection using SQLAlchemy (for existing FastAPI app)"""
    print("\n" + "="*50)
    print("Testing SQLAlchemy Database Connection")
    print("="*50)
    
    try:
        # Get the database URI
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
        print(f"Database URI: {db_uri.replace(settings.POSTGRES_PASSWORD, '***')}")
        
        # Create engine and test connection
        engine = create_engine(db_uri)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"[OK] Connected successfully!")
            print(f"PostgreSQL Version: {version}")
            
            # Test if we can query tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                LIMIT 5
            """))
            tables = result.fetchall()
            
            if tables:
                print(f"Found {len(tables)} table(s) in database:")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("No tables found yet (database is empty)")
                
        return True
        
    except OperationalError as e:
        print(f"[ERROR] Connection failed!")
        print(f"Error: {e}")
        print("\nTroubleshooting tips:")
        print("1. Check if POSTGRES_PASSWORD is set correctly in .env")
        print("2. Verify your Supabase project is active")
        print("3. Check if the database URL is correct")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False


def test_supabase_client():
    """Test connection using Supabase Python client"""
    print("\n" + "="*50)
    print("Testing Supabase Client Connection")
    print("="*50)
    
    client = SupabaseClient.get_service_client()
    
    if not client:
        print("[ERROR] Supabase client not configured")
        print("Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env")
        return False
    
    try:
        # Test authentication endpoint
        print("Testing Supabase client...")
        
        # Try to access auth admin (this should work with service key)
        result = client.auth.admin
        print("[OK] Supabase client authenticated successfully!")
        
        print(f"Supabase URL: {client.supabase_url}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Supabase client test failed: {e}")
        return False


def main():
    """Run all database tests"""
    print("\n>>> Starting Database Connection Tests")
    print("This will verify your database configuration is correct.\n")
    
    # Check environment variables
    print("Checking environment variables...")
    
    if settings.POSTGRES_PASSWORD == "changethis" or settings.POSTGRES_PASSWORD == "YOUR_SUPABASE_DB_PASSWORD_HERE":
        print("[WARNING] POSTGRES_PASSWORD is not set!")
        print("Please update POSTGRES_PASSWORD in your .env file with your Supabase database password")
        print("\nTo find your database password:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to Settings -> Database")
        print("3. Find your database password or reset it if needed")
        return False
    
    # Test SQLAlchemy connection
    sqlalchemy_ok = test_sqlalchemy_connection()
    
    # Test Supabase client
    supabase_ok = test_supabase_client()
    
    # Summary
    print("\n" + "="*50)
    print("Test Summary")
    print("="*50)
    
    if sqlalchemy_ok and supabase_ok:
        print("[SUCCESS] All database connections working!")
        print("\nNext steps:")
        print("1. Run database migrations: alembic upgrade head")
        print("2. Initialize data: python -m app.initial_data")
        print("3. Start developing your SEO tools!")
    elif sqlalchemy_ok:
        print("[OK] SQLAlchemy connection works")
        print("[WARNING] Supabase client needs configuration")
    elif supabase_ok:
        print("[WARNING] SQLAlchemy connection needs configuration")
        print("[OK] Supabase client works")
    else:
        print("[ERROR] Database connections not working")
        print("Please check your configuration and try again")
    
    return sqlalchemy_ok and supabase_ok


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)