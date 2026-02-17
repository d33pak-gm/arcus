import { NextRequest, NextResponse } from "next/server";
import { TECH_OPTIONS } from "@/lib/constants";
import { chatCompletion } from "@/lib/ai/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { prdContent } = await req.json();

    if (!prdContent || prdContent.trim().length < 50) {
      return NextResponse.json(
        { error: "PRD content is too short to extract stack" },
        { status: 400 }
      );
    }

    const allOptions = Object.entries(TECH_OPTIONS)
      .map(([cat, opts]) => `${cat}: ${opts.join(", ")}`)
      .join("\n");

    const text = await chatCompletion({
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a tech stack analyzer. Given a PRD document, identify which technologies are mentioned or implied. Only pick from the provided options. Return JSON with these keys: builder, frontend, backend, database, authentication, apis. Each key should have an array of strings (can be empty).

Available options:
${allOptions}

Return ONLY valid JSON, no markdown fences or extra text.`,
        },
        {
          role: "user",
          content: prdContent,
        },
      ],
    });

    // Strip markdown code fences if present
    let cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    // Extract the first JSON object from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", text);
      return NextResponse.json(
        { error: "AI did not return valid JSON" },
        { status: 500 }
      );
    }
    const extracted = JSON.parse(jsonMatch[0]);

    // Validate: only keep options that exist in TECH_OPTIONS
    const validated: Record<string, string[]> = {};
    for (const [key, options] of Object.entries(TECH_OPTIONS)) {
      const optionsList = options as readonly string[];
      const values = extracted[key];
      if (Array.isArray(values)) {
        validated[key] = values.filter((v: string) => optionsList.includes(v));
      } else {
        validated[key] = [];
      }
    }

    return NextResponse.json({ stack: validated });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Stack extraction error:", errMsg, error);
    return NextResponse.json(
      { error: `Failed to extract tech stack: ${errMsg}` },
      { status: 500 }
    );
  }
}
