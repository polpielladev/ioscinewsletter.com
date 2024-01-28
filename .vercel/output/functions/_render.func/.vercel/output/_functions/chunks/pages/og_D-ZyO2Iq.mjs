import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { html } from 'satori-html';

const prerender = false;

async function GET({ url }) {
  const { searchParams } = url;
  const artworkURL = searchParams.get("url");
  const textColor = searchParams.get("textColor");
  const bgColor = searchParams.get("bgColor");

  const opts = {
    background: "#" + bgColor,
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
          style="display: flex; left: 0; right: 0; top: 0; bottom: 0; position: absolute; background-image: url(${artworkURL}); background-size: 100%; background-repeat: no-repeat; background-position: center; filter: blur(40px); opacity: 0.75;"
        ></div>
        <img
          src="${artworkURL}"
          style="width: 70%; object-fit: cover; bottom: -25%; border-radius: 14px; box-shadow: 0px 0px 3px rgba(0,0,0, 0.2), 0px 7px 14px rgba(0,0,0, 0.3); border: 2.343718px solid rgba(151,151,151, 1);"
        />
        <svg
          style="height: 80px; width: 80px; float: right; bottom: 40px; right: 52px; position: absolute;"
          height="32"
          viewBox="0 0 32 32"
          width="32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            fill="#${textColor}"
            fill-rule="evenodd"
            transform="translate(1.2 1)"
          >
            <path
              d="m32 20.8108108v9.1891892l-17.0589499-.0002081c-.026359.0001387-.0527342.0002081-.0791254.0002081-8.20801437 0-14.8619247-6.7157288-14.8619247-15 0-8.28427125 6.65391033-15 14.8619247-15 8.2080143 0 14.8619247 6.71572875 14.8619247 15 0 1.2584111-.1535371 2.4806284-.4427359 3.6486106l-9.9382961.0003084c.7983523-.9974294 1.2764295-2.266825 1.2764295-3.648919 0-3.2092222-2.577641-5.81081081-5.7573222-5.81081081-3.1796813 0-5.75732219 2.60158861-5.75732219 5.81081081s2.57764089 5.8108108 5.75732219 5.8108108z"
            />
            <circle cx="14.8" cy="15" r="1" />
          </g>
        </svg>
      </div>
    </body>
  </html>`;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
  });

  const resvg = new Resvg(svg, opts);

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, { headers: { "Content-Type": "image/png" } });
}

export { GET, prerender };
