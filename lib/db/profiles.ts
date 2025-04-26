// Create a new file: lib/db/profiles.ts

import { getSupabaseBrowserClient } from "../supabase/client";
import type { UserProfile } from "../types";

// Function to ensure a user profile exists before saving data
export async function ensureUserProfileExists() {
  const supabase = getSupabaseBrowserClient();
  
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) throw new Error("Not authenticated");
    
    // Check if profile exists in the profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
      
    // If no profile exists or there was an error (other than "no rows found")
    if ((!existingProfile && profileError?.code !== "PGRST116") || (profileError && profileError.code !== "PGRST116")) {
      console.log("Creating user profile for:", user.id);
      
      // Create the profile
      const newProfile: Partial<UserProfile> = {
        id: user.id,
        display_name: user.email?.split('@')[0] || "User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from("profiles")
        .insert(newProfile);
        
      if (insertError) throw insertError;
    }
    
    return user.id;
  } catch (error) {
    console.error("Error ensuring user profile exists:", error);
    throw error;
  }
}
