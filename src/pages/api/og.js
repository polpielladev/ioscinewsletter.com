import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";

export const prerender = false;

export async function GET({ url }) {
  const { searchParams } = url;
  const issue = searchParams.get("issue");

  if (!issue) {
    return new Response("Missing issue", { status: 400 });
  }

  const inter = await fetch("http://localhost:4321/inter.ttf").then((res) =>
    res.arrayBuffer()
  );

  const opts = {
    background: "#000000",
    fitTo: {
      mode: "width",
      value: 2400,
    },
  };

  const markup = html`<html>
    <body style="margin: 0; padding: 0">
      <div
        style="display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; overflow: hidden; position: relative;"
      >
        <div
          style="display: flex; left: 0; right: 0; top: 0; bottom: 0; position: absolute; background-image: url(http://localhost:4321/og-background.png); background-size: 100%; background-repeat: no-repeat; background-position: center;"
        ></div>
        <img
          src="http://localhost:4321/rocket.png"
          style="position: absolute; width: 721.54px; height: 733.25px; right: -50px; top: 90px;"
        />
        <div style="display: flex;">
          <p style="font-size: 106px">Issue</p>
        </div>
      </div>
    </body>
  </html>`;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: inter,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, opts);

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, { headers: { "Content-Type": "image/png" } });
}
