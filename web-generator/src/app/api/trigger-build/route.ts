// file: web-generator/src/app/api/trigger-build/route.ts
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
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

  // Daily limit logic
  const today = new Date().toISOString().slice(0, 10);
  let currentCount = profile.daily_build_count;
  if (profile.last_build_date !== today) {
    // Reset if new day
    currentCount = 0;
  }

  if (currentCount >= 3) {
    return NextResponse.json(
      { error: "Batas harian tercapai (3 APK per hari). Coba lagi besok." },
      { status: 403 }
    );
  }

  const { appName, targetUrl, packageName, config } = await request.json();
  if (!appName || !targetUrl || !packageName) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  // Insert project
  const projectId = crypto.randomUUID();
  const { error: insertError } = await supabaseAdmin.from("projects").insert({
    id: projectId,
    user_id: user.id,
    app_name: appName,
    target_url: targetUrl,
    package_name: packageName,
    status: "waiting",
    config: config || {},
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
    // rollback project? For simplicity, log and continue
    console.error("Failed to update build count", updateError);
  }

  // Trigger GitHub Actions
  const githubToken = process.env.GITHUB_PAT;
  const githubOwner = process.env.GITHUB_OWNER;
  const githubRepo = process.env.GITHUB_REPO;

  if (githubToken && githubOwner && githubRepo) {
    try {
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
              config,
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
