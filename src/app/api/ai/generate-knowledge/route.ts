import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/ai/openrouter";

const TEMPLATE_PROMPTS: Record<string, { title: string; systemPrompt: string }> = {
  pricing: {
    title: "Pricing Strategy",
    systemPrompt: `You are a product pricing strategist. Based on the PRD provided, create a detailed pricing strategy document in markdown format. Include:
- Pricing model recommendation (freemium, subscription, usage-based, etc.)
- Suggested price tiers with features for each tier
- Competitive pricing analysis considerations
- Revenue projections framework
- Key pricing metrics to track
Keep it practical and specific to the product described.`,
  },
  market_validation: {
    title: "Market Validation",
    systemPrompt: `You are a market research analyst. Based on the PRD provided, create a market validation document in markdown format. Include:
- Target market size estimation (TAM, SAM, SOM)
- Key competitors and their positioning
- Market trends supporting this product
- Validation experiments to run (surveys, landing pages, MVPs)
- Risk factors and mitigation strategies
Keep it actionable and specific to the product described.`,
  },
  customer_persona: {
    title: "Customer Persona",
    systemPrompt: `You are a UX researcher. Based on the PRD provided, create 2-3 detailed customer personas in markdown format. For each persona include:
- Name, role, and demographics
- Goals and motivations
- Pain points and frustrations
- How they would use this product
- Key quotes that represent their mindset
- Preferred channels and tools
Keep personas realistic and specific to the product described.`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { prdContent, templateType } = await req.json();

    if (!prdContent || prdContent.trim().length < 50) {
      return NextResponse.json(
        { error: "PRD content is too short" },
        { status: 400 }
      );
    }

    const template = TEMPLATE_PROMPTS[templateType];
    if (!template) {
      return NextResponse.json(
        { error: "Invalid template type" },
        { status: 400 }
      );
    }

    const content = await chatCompletion({
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: prdContent },
      ],
    });

    return NextResponse.json({
      title: template.title,
      content,
    });
  } catch (error) {
    console.error("Knowledge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate knowledge document" },
      { status: 500 }
    );
  }
}
