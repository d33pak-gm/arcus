import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // Parse GitHub URL → owner/repo
    const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Use format: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    // Fetch repo info (public API, no auth needed)
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Make sure it's a public repo." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `GitHub API error (${repoRes.status})` },
        { status: repoRes.status }
      );
    }

    const repoData = await repoRes.json();

    // Fetch README
    let readme = "";
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        { headers: { Accept: "application/vnd.github.v3.raw" } }
      );
      if (readmeRes.ok) {
        readme = await readmeRes.text();
        // Truncate if very long
        if (readme.length > 8000) {
          readme = readme.slice(0, 8000) + "\n\n...(truncated)";
        }
      }
    } catch {
      // README is optional, don't fail
    }

    // Fetch languages
    let languages: Record<string, number> = {};
    try {
      const langRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );
      if (langRes.ok) {
        languages = await langRes.json();
      }
    } catch {
      // Languages are optional
    }

    return NextResponse.json({
      name: repoData.name,
      description: repoData.description || "",
      language: repoData.language || "",
      languages: Object.keys(languages),
      topics: repoData.topics || [],
      readme,
    });
  } catch (error) {
    console.error("GitHub route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository info." },
      { status: 500 }
    );
  }
}
