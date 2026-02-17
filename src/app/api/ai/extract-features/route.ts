import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/ai/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { prdContent } = await req.json();

    if (!prdContent || prdContent.trim().length < 50) {
      return NextResponse.json(
        { error: "PRD content is too short to extract features" },
        { status: 400 }
      );
    }

    const text = await chatCompletion({
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a product feature extractor. Given a PRD document, identify discrete features and group them into logical releases (e.g., "MVP", "v1.1", "v2.0").

Return JSON with this exact structure:
{
  "releases": [
    {
      "name": "MVP",
      "features": [
        { "name": "User Authentication", "description": "Allow users to sign up and log in with email/password" }
      ]
    }
  ]
}

Rules:
- Each feature should have a concise name and a 1-2 sentence description
- Group related features into 2-5 releases
- Order releases from most essential (MVP) to future enhancements
- Each release should have 2-8 features
- Return ONLY valid JSON, no markdown fences or extra text`,
        },
        {
          role: "user",
          content: prdContent,
        },
      ],
    });

    // Strip markdown code fences if present
    const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", text);
      return NextResponse.json(
        { error: "AI did not return valid JSON" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(parsed.releases)) {
      return NextResponse.json(
        { error: "Invalid response structure" },
        { status: 500 }
      );
    }

    // Clean and validate
    const releases = parsed.releases.map((r: any) => ({
      name: String(r.name || "Unnamed Release"),
      features: Array.isArray(r.features)
        ? r.features.map((f: any) => ({
            name: String(f.name || "Unnamed Feature"),
            description: String(f.description || ""),
          }))
        : [],
    }));

    return NextResponse.json({ releases });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Feature extraction error:", errMsg, error);
    return NextResponse.json(
      { error: `Failed to extract features: ${errMsg}` },
      { status: 500 }
    );
  }
}
