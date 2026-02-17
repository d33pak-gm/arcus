import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Force this route to use Node.js runtime (not Edge) for jsdom compatibility
export const runtime = "nodejs";
// Prevent static prerendering of this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Arcus/1.0; +https://arcus.dev)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (${response.status})` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json(
        { error: "URL does not point to an HTML page" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract title from raw HTML via cheerio (Readability sometimes misses it)
    const $ = cheerio.load(html);
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const metaDescription =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Dynamic imports to avoid ESM/CJS issues at build time
    const { JSDOM } = await import("jsdom");
    const { Readability } = await import("@mozilla/readability");

    // Use Readability to extract article content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      return NextResponse.json(
        { error: "Could not extract content from this page. It may require JavaScript to render — try pasting the content manually." },
        { status: 422 }
      );
    }

    // Convert article HTML to markdown
    const TurndownService = (await import("turndown")).default;
    const turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });
    // Strip images to keep knowledge docs text-only
    turndown.addRule("remove-images", {
      filter: "img",
      replacement: () => "",
    });
    const markdown = turndown.turndown(article.content).trim();
    const title = article.title || ogTitle || $("title").text().trim() || parsedUrl.hostname;
    const description = article.excerpt || metaDescription;

    return NextResponse.json({ markdown, title, description });
  } catch (error) {
    console.error("Scrape route error:", error);

    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Request timed out. The page took too long to respond." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to scrape URL. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
