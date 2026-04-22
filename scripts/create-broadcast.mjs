#!/usr/bin/env node

/**
 * Creates a Kit.com draft broadcast from an MDX newsletter issue.
 * Optionally generates LinkedIn newsletter text and copies it to the clipboard.
 *
 * Usage:
 *   node scripts/create-broadcast.mjs <issue-number>
 *   node scripts/create-broadcast.mjs <issue-number> --linkedin
 *
 * Requires KIT_API_KEY environment variable (unless --linkedin-only is used).
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import MarkdownIt from "markdown-it";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const KIT_TEMPLATE_ID = 5100069; // "iOS CI Newsletter HTML" Classic template

// ---------------------------------------------------------------------------
// 1. Parse the MDX issue file
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));

const issueNumber = positional[0];
if (!issueNumber) {
  console.error(
    "Usage: node scripts/create-broadcast.mjs <issue-number> [--linkedin] [--linkedin-only]",
  );
  process.exit(1);
}

const linkedinOnly = flags.has("--linkedin-only");
const generateLinkedin = linkedinOnly || flags.has("--linkedin");
const generateKit = !linkedinOnly;

const apiKey = process.env.KIT_API_KEY;
if (generateKit && !apiKey) {
  console.error("Error: KIT_API_KEY environment variable is required.");
  console.error(
    "Get your API key from Kit.com → Settings → Developer → API keys",
  );
  process.exit(1);
}

const mdxPath = resolve(ROOT, `src/content/newsletter/${issueNumber}.mdx`);
let raw;
try {
  raw = readFileSync(mdxPath, "utf-8");
} catch {
  console.error(`Could not read issue file: ${mdxPath}`);
  process.exit(1);
}

// Parse frontmatter
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  console.error("Could not parse frontmatter");
  process.exit(1);
}

const frontmatter = {};
for (const line of fmMatch[1].split("\n")) {
  const [key, ...rest] = line.split(":");
  if (key && rest.length) frontmatter[key.trim()] = rest.join(":").trim();
}

const issueDate = new Date(frontmatter.date);
const day = issueDate.getUTCDate();
const ordinal =
  day % 10 === 1 && day !== 11
    ? "st"
    : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
const formattedDate = `${day}${ordinal} of ${issueDate.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" })} ${issueDate.getUTCFullYear()}`;

// Strip frontmatter and imports
let body = raw.replace(/^---[\s\S]*?---/, "").trim();
body = body.replace(/^import\s+.*$/gm, "").trim();

// Remove <Title ... /> component
body = body.replace(/<Title\s+[^/]*\/>/s, "").trim();

// Extract <NewsletterSponsorSlot> props if present
let sponsor = null;
const sponsorMatch = body.match(/<NewsletterSponsorSlot\s+([\s\S]*?)\/>/);
if (sponsorMatch) {
  const propsStr = sponsorMatch[1];
  const extractProp = (name) => {
    const m =
      propsStr.match(new RegExp(`${name}="([^"]*?)"`)) ||
      propsStr.match(new RegExp(`${name}=\\{\`([^\\}]*?)\`\\}`)) ||
      propsStr.match(new RegExp(`${name}=\\{"([^\\}]*?)"\\}`));
    return m ? m[1] : null;
  };
  sponsor = {
    title: extractProp("title"),
    url: extractProp("url"),
    description: extractProp("description"),
  };
  body = body.replace(/<NewsletterSponsorSlot[\s\S]*?\/>/, "").trim();
}

// Remove <Providers ... /> component
body = body.replace(/<Providers\s+[^/]*\/>/gs, "").trim();

// ---------------------------------------------------------------------------
// 2. Split body into intro paragraphs + article sections
// ---------------------------------------------------------------------------

const parts = body.split(/^(?=### )/m);
const introPart = parts[0].trim();
const articleParts = parts.slice(1);

// ---------------------------------------------------------------------------
// 3. Convert markdown to Kit-styled HTML
// ---------------------------------------------------------------------------

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

const P_STYLE =
  "font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:18px;color:#353535;font-weight:400;line-height:1.5;margin-top:24px;margin-bottom:24px";
const H1_STYLE =
  "font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:47px;color:#000000;font-weight:400;letter-spacing:-0.3px;line-height:1;margin-bottom:11px";
const H3_STYLE =
  "font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:21px;color:#353535;font-weight:400;line-height:1.3";
const LINK_STYLE = "color:#3d3d3d";
const ARTICLE_P_STYLE =
  "font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:18px;color:#3d3d3d;font-weight:400;line-height:1.5;margin-bottom:0;margin-top:12px";
const SUBTITLE_STYLE =
  "font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:18px;color:#353535;font-weight:400;line-height:1.5;margin-top:0;margin-bottom:0";

function styledParagraph(html, style = P_STYLE) {
  return `<p style="${style}" class="">${html}</p>`;
}

function renderInlineMarkdown(text) {
  let html = md.render(text).trim();
  html = html.replace(/^<p>/, "").replace(/<\/p>\s*$/, "");
  html = html.replace(
    /<a /g,
    `<a class="ck-link" target="_blank" rel="noopener noreferrer" style="${LINK_STYLE}" `,
  );
  return html;
}

function stripMargins(style) {
  return style
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !/^margin-(top|bottom)\s*:/.test(s))
    .join(";");
}

function renderListBlock(text, style) {
  let html = md.render(text).trim();
  html = html.replace(
    /<a /g,
    `<a class="ck-link" target="_blank" rel="noopener noreferrer" style="${LINK_STYLE}" `,
  );
  const listStyle = `${stripMargins(style)};margin-top:24px;margin-bottom:24px;padding-left:24px`;
  const itemStyle = `${stripMargins(style)};margin-top:0;margin-bottom:8px`;
  html = html.replace(/<(ul|ol)>/g, `<$1 style="${listStyle}" class="">`);
  html = html.replace(/<li>/g, `<li style="${itemStyle}" class="">`);
  return html;
}

function renderParagraphs(text, style = P_STYLE) {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      /^([-*+]|\d+\.)\s+/.test(p)
        ? renderListBlock(p, style)
        : styledParagraph(renderInlineMarkdown(p), style),
    )
    .join("");
}

function renderArticle(text) {
  const headingMatch = text
    .trim()
    .match(/^###\s+\[([^\]]+)\]\(([^)]+)\)\s*\n\n?([\s\S]*)/);
  if (!headingMatch) return renderParagraphs(text);

  const [, title, url, rest] = headingMatch;
  const h3 = `<h3 style="${H3_STYLE}" class="">\u200b<a href="${url}" target="_blank" class="ck-link" rel="noopener noreferrer" style="${LINK_STYLE}"><strong>${title}</strong></a>\u200b</h3>`;
  return h3 + renderParagraphs(rest, ARTICLE_P_STYLE);
}

function wrapArticleSection(content) {
  return `<div class="ck-section article ck-hide-in-public-posts" style="margin:0px auto 0px auto"><center><table cellPadding="0" cellSpacing="0" style="width:100%;margin:0 auto;max-width:640px"><tbody><tr><td contenteditable="false"></td><td width="640" style="border-radius:0px;box-sizing:border-box;mso-padding-alt:0px 56px 56px 56px" bgcolor="transparent"><div class="ck-inner-section ck-padding-left-mobile-friendly ck-padding-right-mobile-friendly" style="padding:0px 56px 56px 56px"><div style="margin-left:auto;margin-right:auto;max-width:640px">${content}</div></div></td><td contenteditable="false"></td></tr></tbody></table></center></div>`;
}

// ---------------------------------------------------------------------------
// 4. Build the message_content (dynamic parts only)
// ---------------------------------------------------------------------------

// Title + date header
const firstSentence = introPart.match(/^([^.!?\n]+[.!?]?)/)?.[1] || "";
const titleText = firstSentence
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/\[(.*?)\]\(.*?\)/g, "$1")
  .trim();

const headerHtml = `<div class="ck-section" style="margin:0px auto 0px auto"><center><table cellPadding="0" cellSpacing="0" style="width:100%;margin:0 auto;max-width:640px"><tbody><tr><td contenteditable="false"></td><td width="640" style="background-color:#ffffff;border-radius:0px;box-sizing:border-box;mso-padding-alt:0px 56px 28px 56px" bgcolor="#ffffff"><div class="ck-inner-section ck-padding-left-mobile-friendly ck-padding-right-mobile-friendly" style="padding:0px 56px 28px 56px"><div style="margin-left:auto;margin-right:auto;max-width:640px"><h1 style="${H1_STYLE}" class=""><strong>${titleText}</strong></h1><p style="${SUBTITLE_STYLE}" class="">Issue ${issueNumber} · ${formattedDate}</p></div></div></td><td contenteditable="false"></td></tr></tbody></table></center></div>`;

// Author bio
const authorBioHtml = `<div class="ck-section" style="margin:0px auto 0px auto"><center><table cellPadding="0" cellSpacing="0" style="width:100%;margin:0 auto;max-width:640px"><tbody><tr><td contenteditable="false"></td><td width="640" style="background-color:#ffffff;border-radius:0px;box-sizing:border-box;mso-padding-alt:0px 56px 0px 56px" bgcolor="#ffffff"><div class="ck-inner-section ck-padding-left-mobile-friendly ck-padding-right-mobile-friendly" style="padding:0px 56px 0px 56px"><div style="margin-left:auto;margin-right:auto;max-width:640px"><table class="ck-layout-block ck-layout-stack" width="100%" border="0" cellPadding="0" cellSpacing="0" bgcolor="transparent" style="padding:0px 0px 0px 0px;margin:0px 0px 0px 0px;border-radius:0px;overflow:hidden"><tbody><tr><td as="td" class="ck-column ck-column-stack ck-column-1" width="10%" style="background-size:cover;background-position:center;border-radius:0px;box-sizing:border-box;vertical-align:middle"><div style="padding:0px 0px 0px 0px"><table width="100%" border="0" cellSpacing="0" cellPadding="0" style="text-align:left;table-layout:fixed;float:none" class="email-image"><tbody><tr><td align="left"><figure style="margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;max-width:60px;width:100%"><div style="display:block"><img src="https://embed.filekitcdn.com/e/hMaFYHCjGv2jTKsg3QHDt6/woiBSyafGEtL851xemWeq9" width="60" height="auto" style="border-radius:4px 4px 4px 4px;width:60px;height:auto;object-fit:contain"/></div></figure></td></tr></tbody></table></div></td><td style="padding-left:10px"></td><td as="td" class="ck-column ck-column-2" width="90%" style="background-size:cover;background-position:center;border-radius:0px;box-sizing:border-box;vertical-align:top"><div style="padding:0px 0px 0px 0px"><h3 style="font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:22px;color:#000000;font-weight:400;line-height:1.1;margin-top:0;margin-bottom:0" class=""><strong>Pol Piella Abadia</strong></h3><p style="font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:16px;color:#4d4d4d;font-weight:400;line-height:1.2;margin-top:4px;margin-bottom:0" class="">iOS Developer &amp; CI/CD Specialist</p></div></td></tr></tbody></table></div></div></td><td contenteditable="false"></td></tr></tbody></table></center></div>`;

// Intro paragraphs
const introHtml = `<div class="ck-section" style="margin:0px auto 0px auto"><center><table cellPadding="0" cellSpacing="0" style="width:100%;margin:0 auto;max-width:640px"><tbody><tr><td contenteditable="false"></td><td width="640" style="background-color:#ffffff;border-radius:0px;box-sizing:border-box;mso-padding-alt:0px 56px 56px 56px" bgcolor="#ffffff"><div class="ck-inner-section ck-padding-left-mobile-friendly ck-padding-right-mobile-friendly" style="padding:0px 56px 56px 56px"><div style="margin-left:auto;margin-right:auto;max-width:640px">${renderParagraphs(introPart)}</div></div></td><td contenteditable="false"></td></tr></tbody></table></center></div>`;

// Sponsor sections
let sponsorHtml = "";
if (sponsor) {
  const sponsorTag = `<div class="ck-section sponsored" style="margin:0px auto 0px auto"><center><table cellPadding="0" cellSpacing="0" style="width:100%;margin:0 auto;max-width:640px"><tbody><tr><td contenteditable="false"></td><td width="640" style="background-color:#ffffff;border-radius:0px;box-sizing:border-box;mso-padding-alt:0px 56px 0px 56px" bgcolor="#ffffff"><div class="ck-inner-section ck-padding-left-mobile-friendly ck-padding-right-mobile-friendly" style="padding:0px 56px 0px 56px"><div style="margin-left:auto;margin-right:auto;max-width:640px"><p style="font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:16px;color:#ffffff;font-weight:400;line-height:1.5;margin-top:0;margin-bottom:24px" class=""><strong>SPONSORED</strong></p></div></div></td><td contenteditable="false"></td></tr></tbody></table></center></div>`;

  const sponsorContent = `<h3 style="${H3_STYLE}" class="">\u200b<a href="${sponsor.url}" target="_blank" class="ck-link" rel="noopener noreferrer" style="${LINK_STYLE}"><strong>${sponsor.title}</strong></a>\u200b</h3><p style="${ARTICLE_P_STYLE}" class="">${sponsor.description}</p>`;

  sponsorHtml = sponsorTag + wrapArticleSection(sponsorContent);
}

// "FROM THE COMMUNITY" tag
const communityTag = `<div class="ck-section tag ck-hide-in-public-posts" style="margin:0px auto 0px auto"><center><table cellPadding="0" cellSpacing="0" style="width:100%;margin:0 auto;max-width:640px"><tbody><tr><td contenteditable="false"></td><td width="640" style="border-radius:0px;box-sizing:border-box;mso-padding-alt:0px 56px 0px 56px" bgcolor="transparent"><div class="ck-inner-section ck-padding-left-mobile-friendly ck-padding-right-mobile-friendly" style="padding:0px 56px 0px 56px"><div style="margin-left:auto;margin-right:auto;max-width:640px"><p style="font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-size:16px;color:#ffffff;font-weight:400;line-height:1.5;margin-bottom:24px;margin-top:0" class=""><strong>FROM THE COMMUNITY</strong></p></div></div></td><td contenteditable="false"></td></tr></tbody></table></center></div>`;

// Article sections
const articlesHtml = articleParts
  .map((a) => wrapArticleSection(renderArticle(a)))
  .join("");

// Assemble message_content
const messageContent =
  (headerHtml + authorBioHtml + introHtml + sponsorHtml + communityTag + articlesHtml)
    .replace(/utm_medium=web/g, "utm_medium=email");

// ---------------------------------------------------------------------------
// 5. Create draft broadcast via Kit API
// ---------------------------------------------------------------------------

const articleTitles = articleParts
  .map((a) => {
    const m = a.match(/^###\s+\[([^\]]+)\]/);
    return m ? m[1].replace(/^[^\w]*/, "") : null;
  })
  .filter(Boolean);

if (generateKit) {
  const subject = `iOS CI Newsletter - Issue #${issueNumber}`;

  const previewText =
    articleTitles.length > 0
      ? `${articleTitles.slice(0, 3).join(", ")} and more!`
      : "";

  const response = await fetch("https://api.kit.com/v4/broadcasts", {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject,
      content: messageContent,
      preview_text: previewText,
      email_template_id: KIT_TEMPLATE_ID,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to create broadcast:", data);
    process.exit(1);
  }

  const broadcast = data.broadcast;
  console.log(`Draft broadcast created!`);
  console.log(`  ID:      ${broadcast.id}`);
  console.log(`  Subject: ${broadcast.subject}`);
  console.log(`  Template: ${broadcast.email_template?.name}`);
  console.log(`  Preview: ${broadcast.preview_text || "(none)"}`);
  console.log(
    `\nOpen Kit.com to review and send: https://app.kit.com/broadcasts/${broadcast.id}`,
  );
}

// ---------------------------------------------------------------------------
// 6. Generate LinkedIn newsletter text
// ---------------------------------------------------------------------------

if (generateLinkedin) {
  // Build article list with titles, URLs, and descriptions
  const articleEntries = articleParts
    .map((a) => {
      const m = a
        .trim()
        .match(/^###\s+\[([^\]]+)\]\(([^)]+)\)\s*\n\n?([\s\S]*)/);
      if (!m) return null;
      const [, title, url, description] = m;
      return { title, url, description: description.trim() };
    })
    .filter(Boolean);

  // Render intro markdown paragraphs to HTML
  function renderLinkedinParagraphs(text) {
    return text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => !p.startsWith("|") && !p.startsWith("> "))
      .map((p) => {
        let html = md.render(p).trim();
        // Unwrap single <p> tags from markdown-it
        html = html.replace(/^<p>([\s\S]*)<\/p>$/, "$1");
        return `<p>${html}</p>`;
      })
      .join("");
  }

  // Build the LinkedIn HTML
  const htmlParts = [];

  // Intro paragraphs
  htmlParts.push(renderLinkedinParagraphs(introPart));

  // Article sections
  for (const article of articleEntries) {
    htmlParts.push(`<p><strong><a href="${article.url}">${article.title}</a></strong></p>`);
    htmlParts.push(renderLinkedinParagraphs(article.description));
  }

  const linkedinHtml = htmlParts.join("\n").replace(/utm_medium=web/g, "utm_medium=linkedin");

  // Copy HTML to clipboard with the correct pasteboard type (macOS)
  const pbcopyHtml = resolve(__dirname, "pbcopy-html.swift");
  try {
    execSync(pbcopyHtml, { input: linkedinHtml });
    console.log("\nLinkedIn newsletter HTML copied to clipboard!");
    console.log("Paste into the LinkedIn newsletter editor with Cmd+V.");
  } catch {
    // Fallback: print the HTML to stdout
    console.log("\n--- LinkedIn Newsletter HTML ---\n");
    console.log(linkedinHtml);
    console.log("\n--- End ---");
  }
}
