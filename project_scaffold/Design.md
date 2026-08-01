# Design — AI Chat App with Guardrails

## Visual Tone
Clean & minimal, light theme. The interface should feel calm, trustworthy, and unobtrusive — like a well-made productivity tool, not a flashy consumer app. Guardrail notices (blocked input, rate limits) should feel informative and reassuring, never alarming or punitive — a soft amber/neutral tone rather than harsh red, since the goal is "here's why," not "you did something wrong."

## Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary | Indigo (buttons, links, active states) | #4F46E5 |
| Secondary | Slate (borders, secondary text) | #64748B |
| Background | Off-white | #FAFAFA |
| Surface (cards/bubbles) | White | #FFFFFF |
| Text (primary) | Near-black slate | #1E293B |
| Text (muted) | Mid slate | #94A3B8 |
| Accent / Guardrail Notice | Warm amber (not red — informative, not punitive) | #F59E0B |
| Error (system/network only) | Muted red | #DC2626 |
| Success | Muted green | #16A34A |

## Typography
- Heading font: Inter (or system-ui fallback stack) — clean, neutral, widely available
- Body font: Inter, 16px base
- Scale: base 16px body, 14px muted/meta text, headings at 1.25x (20px) / 1.5x (24px) / 2x (32px) for section/page titles
- Message bubbles: 15px, comfortable 1.5 line-height for readability in longer LLM responses

## Spacing & Theme Conventions
- 8px base grid for all spacing/padding decisions
- Border-radius: 8px for buttons/inputs, 12px for chat bubbles and cards (soft, not sharp; not overly rounded/playful)
- Shadows: subtle only — a single soft `0 1px 3px rgba(0,0,0,0.08)` for cards/bubbles, avoid heavy drop shadows
- Chat layout: user messages right-aligned (primary color background, white text), assistant messages left-aligned (white/surface background, dark text) — standard, familiar chat pattern so attention stays on the guardrail behavior, not the UI novelty
- Guardrail notices render as an inline banner/pill within the chat flow (amber left-border accent, not a modal or popup) so they read as part of the conversation, not an interruption
