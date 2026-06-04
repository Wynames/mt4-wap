// file: web-generator/src/app/api/admin/settings/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const cookieStore = cookies();

  // Verify user is authenticated
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is owner
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Admin client with service role
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { settings } = await request.json();

  if (!settings || !Array.isArray(settings)) {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  // Perform upsert for each setting
  const results = [];
  for (const s of settings) {
    if (!s.key || s.value === undefined) continue;
    const { error } = await supabaseAdmin
      .from("global_settings")
      .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
    if (error) {
      results.push({ key: s.key, error: error.message });
    } else {
      results.push({ key: s.key, success: true });
    }
  }

  return NextResponse.json({ results });
}
