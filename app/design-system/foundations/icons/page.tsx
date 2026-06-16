"use client";

import { useState } from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Divider } from "@/components/ui/divider";

const brandGroups: { label: string; icons: { file: string; name: string }[] }[] = [
  {
    label: "AI",
    icons: [
      { file: "anthropic", name: "Anthropic" },
      { file: "claudeai", name: "Claude" },
      { file: "clawd", name: "Clawd" },
      { file: "openai,chatgpt", name: "OpenAI" },
      { file: "openai-atlas", name: "OpenAI Atlas" },
      { file: "openai-codex", name: "OpenAI Codex" },
      { file: "gemini", name: "Gemini" },
      { file: "deepseek", name: "DeepSeek" },
      { file: "mistral", name: "Mistral" },
      { file: "perplexity", name: "Perplexity" },
      { file: "grok", name: "Grok" },
      { file: "copilot", name: "Copilot" },
      { file: "microsoft-copilot", name: "MS Copilot" },
      { file: "meta-ai", name: "Meta AI" },
      { file: "siri", name: "Siri" },
      { file: "apple-intelligence", name: "Apple AI" },
      { file: "notebooklm", name: "NotebookLM" },
      { file: "google-aistudio", name: "AI Studio" },
      { file: "google-deepmind", name: "DeepMind" },
      { file: "ollama", name: "Ollama" },
      { file: "midjourney", name: "Midjourney" },
      { file: "manus-ai", name: "Manus" },
      { file: "goose", name: "Goose" },
    ],
  },
  {
    label: "Social",
    icons: [
      { file: "instagram", name: "Instagram" },
      { file: "facebook", name: "Facebook" },
      { file: "x", name: "X" },
      { file: "twitter, larry", name: "Twitter" },
      { file: "threads", name: "Threads" },
      { file: "bluesky", name: "Bluesky" },
      { file: "linkedin", name: "LinkedIn" },
      { file: "mastadon", name: "Mastodon" },
      { file: "snapchat", name: "Snapchat" },
      { file: "tiktok", name: "TikTok" },
      { file: "pinterest", name: "Pinterest" },
      { file: "pinterest-simple", name: "Pinterest Alt" },
      { file: "reddit", name: "Reddit" },
      { file: "tumblr", name: "Tumblr" },
      { file: "vkontakte", name: "VK" },
      { file: "quora", name: "Quora" },
    ],
  },
  {
    label: "Messaging",
    icons: [
      { file: "telegram", name: "Telegram" },
      { file: "whatsapp", name: "WhatsApp" },
      { file: "discord", name: "Discord" },
      { file: "slack", name: "Slack" },
      { file: "imessage", name: "iMessage" },
      { file: "wechat", name: "WeChat" },
      { file: "facebook-messenger", name: "Messenger" },
    ],
  },
  {
    label: "Dev tools",
    icons: [
      { file: "github", name: "GitHub" },
      { file: "git", name: "Git" },
      { file: "cursor", name: "Cursor" },
      { file: "bolt", name: "Bolt" },
      { file: "replit", name: "Replit" },
      { file: "codepen", name: "CodePen" },
      { file: "windsurf", name: "Windsurf" },
      { file: "devin", name: "Devin" },
      { file: "v0", name: "v0" },
      { file: "lovable", name: "Lovable" },
      { file: "warp", name: "Warp" },
      { file: "opencode", name: "OpenCode" },
      { file: "openclaw", name: "OpenClaw" },
      { file: "linear", name: "Linear" },
      { file: "vercel", name: "Vercel" },
      { file: "netify", name: "Netlify" },
      { file: "supabase", name: "Supabase" },
      { file: "npm", name: "npm" },
      { file: "stack-overflow", name: "Stack Overflow" },
    ],
  },
  {
    label: "Languages",
    icons: [
      { file: "react", name: "React" },
      { file: "vue", name: "Vue" },
      { file: "svelte", name: "Svelte" },
      { file: "solidjs", name: "SolidJS" },
      { file: "angularjs", name: "Angular" },
      { file: "typescript", name: "TypeScript" },
      { file: "javascript", name: "JavaScript" },
      { file: "java", name: "Java" },
      { file: "java-coffee-bean", name: "Java Alt" },
      { file: "php", name: "PHP" },
      { file: "php-elephant", name: "PHP Alt" },
      { file: "phyton", name: "Python" },
      { file: "c++, cpp", name: "C++" },
      { file: "rust", name: "Rust" },
      { file: "bun", name: "Bun" },
      { file: "json", name: "JSON" },
    ],
  },
  {
    label: "Design",
    icons: [
      { file: "figma", name: "Figma" },
      { file: "figma-simple", name: "Figma Alt" },
      { file: "framer", name: "Framer" },
      { file: "sketch", name: "Sketch" },
      { file: "webflow", name: "Webflow" },
      { file: "dribbble", name: "Dribbble" },
      { file: "behance", name: "Behance" },
      { file: "lottielab", name: "LottieLab" },
      { file: "rive", name: "Rive" },
      { file: "adobe-acrobat", name: "Acrobat" },
      { file: "affinity", name: "Affinity" },
      { file: "recraft", name: "Recraft" },
      { file: "iconists", name: "Iconists" },
      { file: "central-icon-system", name: "CIS" },
    ],
  },
  {
    label: "Browsers",
    icons: [
      { file: "chrome", name: "Chrome" },
      { file: "safari", name: "Safari" },
      { file: "firefox", name: "Firefox" },
      { file: "arc", name: "Arc" },
      { file: "opera", name: "Opera" },
    ],
  },
  {
    label: "Media",
    icons: [
      { file: "spotify", name: "Spotify" },
      { file: "apple-music", name: "Apple Music" },
      { file: "youtube", name: "YouTube" },
      { file: "twitch", name: "Twitch" },
      { file: "medium", name: "Medium" },
      { file: "substack", name: "Substack" },
      { file: "patreon", name: "Patreon" },
      { file: "rss-feed", name: "RSS" },
    ],
  },
  {
    label: "Gaming",
    icons: [
      { file: "playstation", name: "PlayStation" },
      { file: "xbox", name: "Xbox" },
      { file: "nintendo-switch", name: "Switch" },
      { file: "steam", name: "Steam" },
      { file: "riot-games", name: "Riot Games" },
    ],
  },
  {
    label: "Finance",
    icons: [
      { file: "bitcoin-logo", name: "Bitcoin" },
      { file: "robinhood", name: "Robinhood" },
      { file: "cash", name: "Cash App" },
      { file: "venmo", name: "Venmo" },
      { file: "gumroad", name: "Gumroad" },
      { file: "lemonsqueezy", name: "Lemon Squeezy" },
    ],
  },
  {
    label: "Productivity",
    icons: [
      { file: "notion", name: "Notion" },
      { file: "notion-ai", name: "Notion AI" },
      { file: "things", name: "Things" },
      { file: "granola", name: "Granola" },
      { file: "linktree", name: "Linktree" },
      { file: "producthunt", name: "Product Hunt" },
      { file: "duolingo", name: "Duolingo" },
    ],
  },
  {
    label: "Platforms",
    icons: [
      { file: "apple", name: "Apple" },
      { file: "apple-spring", name: "Apple Spring" },
      { file: "appstore", name: "App Store" },
      { file: "google", name: "Google" },
      { file: "google-play-store", name: "Play Store" },
      { file: "nvidia", name: "NVIDIA" },
      { file: "microsoft-copilot", name: "Microsoft" },
      { file: "modelcontextprotocol, mcp", name: "MCP" },
    ],
  },
  {
    label: "Other",
    icons: [
      { file: "formula1", name: "Formula 1" },
      { file: "european-union, eu-stars", name: "EU" },
      { file: "iso-org", name: "ISO" },
      { file: "red-dot-award", name: "Red Dot" },
      { file: "antigravity", name: "Antigravity" },
      { file: "amp", name: "AMP" },
      { file: "arena", name: "Arena" },
      { file: "artifact-news", name: "Artifact" },
      { file: "cosmos", name: "Cosmos" },
      { file: "dia", name: "Dia" },
      { file: "factory", name: "Factory" },
    ],
  },
];

const SYSTEM_ICON_COUNT = 1809;
const PAGE_SIZE = 120;

export default function IconsPage() {
  const [variant, setVariant] = useState<"filled" | "outlined">("filled");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");

  const systemNumbers = Array.from({ length: SYSTEM_ICON_COUNT }, (_, i) => i + 1);
  const visibleSystemIcons = systemNumbers.slice(0, visibleCount);

  const filteredBrandGroups = search
    ? brandGroups
        .map((g) => ({
          ...g,
          icons: g.icons.filter(
            (i) =>
              i.name.toLowerCase().includes(search.toLowerCase()) ||
              i.file.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.icons.length > 0)
    : brandGroups;

  return (
    <PageShell title="Icons">
      {/* Search */}
      <div className="flex flex-col gap-8">
        <input
          type="text"
          placeholder="Search brand icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="type-bodySm w-full rounded-12 border border-border-primary bg-surface-secondary px-12 py-10 text-on-surface-primary placeholder:text-on-surface-disabled outline-none focus:border-interactive-primary"
        />
      </div>

      {/* Brand icons */}
      <section className="flex flex-col gap-24">
        <div className="flex flex-col gap-4">
          <h2 className="type-titleMd text-on-surface-primary">Brand icons</h2>
          <p className="type-bodySm text-on-surface-tertiary">
            {brandGroups.reduce((sum, g) => sum + g.icons.length, 0)} icons across{" "}
            {brandGroups.length} categories
          </p>
        </div>

        {filteredBrandGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-12">
            <h3 className="type-overline text-on-surface-tertiary">{group.label}</h3>
            <div className="grid grid-cols-5 gap-8">
              {group.icons.map((icon) => (
                <BrandIcon key={icon.file} file={icon.file} name={icon.name} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <Divider type="section" />

      {/* System icons */}
      <section className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="type-titleMd text-on-surface-primary">System icons</h2>
          <p className="type-bodySm text-on-surface-tertiary">
            {SYSTEM_ICON_COUNT} icons &times; 2 variants (filled, outlined)
          </p>
        </div>

        {/* Variant toggle */}
        <div className="flex gap-4 rounded-12 bg-surface-tertiary p-4">
          <button
            onClick={() => setVariant("filled")}
            className={`type-labelHeavySm flex-1 rounded-8 px-12 py-8 transition-colors ${
              variant === "filled"
                ? "bg-surface-primary text-on-surface-primary shadow-sm"
                : "text-on-surface-tertiary"
            }`}
          >
            Filled
          </button>
          <button
            onClick={() => setVariant("outlined")}
            className={`type-labelHeavySm flex-1 rounded-8 px-12 py-8 transition-colors ${
              variant === "outlined"
                ? "bg-surface-primary text-on-surface-primary shadow-sm"
                : "text-on-surface-tertiary"
            }`}
          >
            Outlined
          </button>
        </div>

        {/* System icon grid */}
        <div className="grid grid-cols-6 gap-8">
          {visibleSystemIcons.map((n) => (
            <div
              key={n}
              className="flex aspect-square items-center justify-center rounded-12 bg-surface-secondary p-8"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/icons/${variant}/${n}.png`}
                alt={`Icon ${n}`}
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          ))}
        </div>

        {visibleCount < SYSTEM_ICON_COUNT && (
          <button
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, SYSTEM_ICON_COUNT))
            }
            className="type-labelHeavySm self-center rounded-12 bg-surface-tertiary px-20 py-10 text-on-surface-primary transition-colors hover:bg-overlay-light-hover"
          >
            Load more ({SYSTEM_ICON_COUNT - visibleCount} remaining)
          </button>
        )}
      </section>
    </PageShell>
  );
}

function BrandIcon({ file, name }: { file: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex aspect-square w-full items-center justify-center rounded-12 bg-surface-secondary p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icons/brands/${file}.png`}
          alt={name}
          loading="lazy"
          className="h-40 w-40"
        />
      </div>
      <span className="type-labelSm w-full truncate text-center text-on-surface-tertiary">
        {name}
      </span>
    </div>
  );
}
