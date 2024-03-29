import rss from "@astrojs/rss";
import MarkdownIt from "markdown-it";
import { getCollection } from "astro:content";

const parser = new MarkdownIt();

export const GET = async () => {
  const allNewsletterIssues = await getCollection("newsletter");
  const sortedIssues = allNewsletterIssues.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );

  return rss({
    title: "iOS CI Newsletter",
    description:
      "A fortnightly newsletter gathering all updates and news about Continuous Integration and Continuous Delivery from the iOS community.",
    site: "https://ioscinewsletter.com",
    items: sortedIssues.map((issue) => ({
      title: `iOS CI Newsletter - Issue #${issue.data.number}`,
      link: `/issues/${issue.data.number}`,
      content: removeJSX(parser.render(issue.body)),
      pubDate: issue.data.date,
    })),
    customData: `<language>en-us</language>`,
  });
};

const removeJSX = (html: string) => {
  return html
    .replace(/<p>import\s(Title|NewsletterSponsorSlot.*)(\n|.)*?<\/p>/gm, "")
    .replace(/<p>&lt;(NewsletterSponsorSlot|Title)(\n|.)*?\/&gt;<\/p>/gm, "");
};
