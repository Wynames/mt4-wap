// file: web-generator/src/app/api/webhook/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { project_id, status, download_url } = await request.json();

  if (!project_id || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch existing config
  const { data: project, error: fetchError } = await supabaseAdmin
    .from("projects")
    .select("config")
    .eq("id", project_id)
    .single();

  if (fetchError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Merge the download_url into config
  const updatedConfig = {
    ...(project.config || {}),
    download_url: download_url || "",
  };

  const { error: updateError } = await supabaseAdmin
    .from("projects")
    .update({ status, config: updatedConfig })
    .eq("id", project_id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
