// file: web-generator/src/app/api/trigger-build/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const cookieStore = cookies();

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

  // Admin client with service role for privileged operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("daily_build_count, last_build_date, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Daily limit logic (owners bypass)
  const today = new Date().toISOString().slice(0, 10);
  let currentCount = profile.daily_build_count;
  if (profile.last_build_date !== today) {
    currentCount = 0;
  }

  if (profile.role !== "owner" && currentCount >= 3) {
    return NextResponse.json(
      { error: "Batas harian tercapai (3 APK per hari). Coba lagi besok." },
      { status: 403 }
    );
  }

  const { appName, targetUrl, packageName, config } = await request.json();
  if (!appName || !targetUrl || !packageName) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  // Fetch global watermark settings
  const { data: globalSettings, error: globalSettingsError } = await supabaseAdmin
    .from("global_settings")
    .select("*")
    .in("key", [
      "watermark_type",
      "watermark_text",
      "watermark_image_url",
      "watermark_opacity",
      "watermark_size",
    ]);

  const watermarkConfig: any = {};
  if (globalSettings) {
    for (const s of globalSettings) {
      watermarkConfig[s.key] = s.value;
    }
  }

  // Merge watermark config into the payload
  const finalConfig = {
    ...config,
    watermark: watermarkConfig,
  };

  // Insert project
  const projectId = crypto.randomUUID();
  const { error: insertError } = await supabaseAdmin.from("projects").insert({
    id: projectId,
    user_id: user.id,
    app_name: appName,
    target_url: targetUrl,
    package_name: packageName,
    status: "waiting",
    config: finalConfig,
  });

  if (insertError) {
    return NextResponse.json({ error: "Gagal menyimpan proyek" }, { status: 500 });
  }

  // Increment daily build count
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      daily_build_count: currentCount + 1,
      last_build_date: today,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update build count", updateError);
  }

  // Trigger GitHub Actions
  const githubToken = process.env.GITHUB_PAT;
  const githubOwner = process.env.GITHUB_OWNER;
  const githubRepo = process.env.GITHUB_REPO;

  if (githubToken && githubOwner && githubRepo) {
    try {
      const webhookUrl = new URL('/api/webhook', request.url).toString();
      const dispatchRes = await fetch(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github+json",
          },
          body: JSON.stringify({
            event_type: "build_apk",
            client_payload: {
              projectId,
              appName,
              targetUrl,
              packageName,
              config: finalConfig,
              webhookUrl,
            },
          }),
        }
      );

      if (!dispatchRes.ok) {
        console.error("GitHub dispatch failed", await dispatchRes.text());
      }
    } catch (err) {
      console.error("GitHub dispatch error", err);
    }
  }

  return NextResponse.json({ success: true, projectId });
}
