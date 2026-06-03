// file: web-generator/src/app/api/webhook/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let project_id: string;
  let status: string;
  let download_url: string;

  try {
    const body = await request.json();
    project_id = body.project_id;
    status = body.status;
    download_url = body.download_url;

    if (!project_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log(`Webhook received for project ${project_id}, status: ${status}`);

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
    console.error("Fetch error:", fetchError);
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
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }

  console.log(`Project ${project_id} updated to status: ${status}`);
  return NextResponse.json({ success: true });
}
