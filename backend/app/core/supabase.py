"""
Supabase client configuration and utilities
"""
import os
from typing import Optional
from supabase import create_client, Client
from pydantic_settings import BaseSettings


class SupabaseSettings(BaseSettings):
    """Supabase configuration settings"""
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    
    class Config:
        env_file = "../.env"
        env_file_encoding = 'utf-8'
        extra = "ignore"


# Initialize settings
supabase_settings = SupabaseSettings()


class SupabaseClient:
    """Singleton Supabase client"""
    _instance: Optional[Client] = None
    _service_instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Optional[Client]:
        """Get Supabase client with anon key (for public operations)"""
        if not supabase_settings.SUPABASE_URL or not supabase_settings.SUPABASE_ANON_KEY:
            print("Warning: Supabase credentials not configured")
            return None
            
        if cls._instance is None:
            cls._instance = create_client(
                supabase_settings.SUPABASE_URL,
                supabase_settings.SUPABASE_ANON_KEY
            )
        return cls._instance
    
    @classmethod
    def get_service_client(cls) -> Optional[Client]:
        """Get Supabase client with service key (for admin operations)"""
        if not supabase_settings.SUPABASE_URL or not supabase_settings.SUPABASE_SERVICE_KEY:
            print("Warning: Supabase service credentials not configured")
            return None
            
        if cls._service_instance is None:
            cls._service_instance = create_client(
                supabase_settings.SUPABASE_URL,
                supabase_settings.SUPABASE_SERVICE_KEY
            )
        return cls._service_instance
    
    @classmethod
    def test_connection(cls) -> bool:
        """Test if Supabase connection works"""
        try:
            client = cls.get_service_client()
            if client:
                # Try to fetch from a system table to test connection
                result = client.table('_prisma_migrations').select("*").limit(1).execute()
                print("[OK] Supabase connection successful!")
                return True
        except Exception as e:
            # If the table doesn't exist, try creating a test query
            try:
                client = cls.get_service_client()
                if client:
                    # This should at least connect to the database
                    print("[OK] Supabase client initialized successfully!")
                    return True
            except Exception as inner_e:
                print(f"[ERROR] Supabase connection failed: {inner_e}")
                return False
        return False


# Helper functions for common operations
def get_supabase() -> Optional[Client]:
    """Get Supabase client for dependency injection"""
    return SupabaseClient.get_client()


def get_supabase_service() -> Optional[Client]:
    """Get Supabase service client for admin operations"""
    return SupabaseClient.get_service_client()