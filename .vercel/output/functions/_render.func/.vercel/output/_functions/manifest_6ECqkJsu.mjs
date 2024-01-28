import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import 'string-width';
import './chunks/astro_7yJCppZW.mjs';
import 'clsx';
import 'cssesc';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    })
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"issues/rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/issues/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/issues\\/rss\\.xml\\/?$","segments":[[{"content":"issues","dynamic":false,"spread":false}],[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/issues/rss.xml.ts","pathname":"/issues/rss.xml","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"sponsor/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/sponsor","isIndex":false,"type":"page","pattern":"^\\/sponsor\\/?$","segments":[[{"content":"sponsor","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sponsor.astro","pathname":"/sponsor","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/og","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/og\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"og","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/og.js","pathname":"/api/og","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/components/Header.astro",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/layouts/BaseLayout.astro",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/pages/issues/[issue].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/issues/[issue]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/pages/sponsor.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/sponsor@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/layouts/IssueLayout.astro",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/1.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/1.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/10.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/10.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/11.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/11.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/12.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/12.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/13.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/13.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/14.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/14.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/15.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/15.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/16.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/16.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/17.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/17.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/18.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/18.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/19.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/19.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/2.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/2.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/20.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/20.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/21.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/21.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/22.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/22.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/23.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/23.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/24.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/24.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/25.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/25.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/26.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/26.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/27.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/27.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/28.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/28.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/29.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/29.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/3.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/3.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/30.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/30.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/31.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/31.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/32.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/32.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/33.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/33.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/4.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/4.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/5.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/5.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/6.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/6.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/7.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/7.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/8.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/8.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/9.mdx",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/9.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["/Users/polpielladev/Developer/ioscinewsletter.com/src/pages/issues/rss.xml.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/issues/rss.xml@_@ts",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","/src/pages/api/og.js":"chunks/pages/og_D-ZyO2Iq.mjs","\u0000@astrojs-manifest":"manifest_6ECqkJsu.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_3wEZly-Z.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_vhh7QTlk.mjs","\u0000@astro-page:src/pages/api/og@_@js":"chunks/og_ojBbuSSv.mjs","\u0000@astro-page:src/pages/issues/rss.xml@_@ts":"chunks/rss_YQeZi_oA.mjs","\u0000@astro-page:src/pages/issues/[issue]@_@astro":"chunks/_issue__RN0Pt0M5.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_aXuEICBb.mjs","\u0000@astro-page:src/pages/sponsor@_@astro":"chunks/sponsor_nvKv7X1f.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/1.mdx?astroContentCollectionEntry=true":"chunks/1_9p9GiGPh.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/10.mdx?astroContentCollectionEntry=true":"chunks/10_lhcJJX2Q.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/11.mdx?astroContentCollectionEntry=true":"chunks/11_CAuLUuF2.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/12.mdx?astroContentCollectionEntry=true":"chunks/12_q7cFWP-q.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/13.mdx?astroContentCollectionEntry=true":"chunks/13_oOj2T8Rv.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/14.mdx?astroContentCollectionEntry=true":"chunks/14_CsAetS0B.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/15.mdx?astroContentCollectionEntry=true":"chunks/15_MqPN9wiQ.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/16.mdx?astroContentCollectionEntry=true":"chunks/16_72H7Z5-9.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/17.mdx?astroContentCollectionEntry=true":"chunks/17_8kRs0OVe.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/18.mdx?astroContentCollectionEntry=true":"chunks/18_Y1SIulHR.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/19.mdx?astroContentCollectionEntry=true":"chunks/19_lUmZ6sHO.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/2.mdx?astroContentCollectionEntry=true":"chunks/2_-VaPgOeZ.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/20.mdx?astroContentCollectionEntry=true":"chunks/20_XeJdBtUa.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/21.mdx?astroContentCollectionEntry=true":"chunks/21_09kL4sSz.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/22.mdx?astroContentCollectionEntry=true":"chunks/22_cAJHjJvt.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/23.mdx?astroContentCollectionEntry=true":"chunks/23_I2Y9fUIH.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/24.mdx?astroContentCollectionEntry=true":"chunks/24_0t6vCcmQ.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/25.mdx?astroContentCollectionEntry=true":"chunks/25_2K5-YjSa.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/26.mdx?astroContentCollectionEntry=true":"chunks/26_wGuksay4.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/27.mdx?astroContentCollectionEntry=true":"chunks/27_rSJUiSvP.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/28.mdx?astroContentCollectionEntry=true":"chunks/28_7RmXbpoL.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/29.mdx?astroContentCollectionEntry=true":"chunks/29_GEqvbVj_.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/3.mdx?astroContentCollectionEntry=true":"chunks/3_mdWyKr7Q.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/30.mdx?astroContentCollectionEntry=true":"chunks/30_-HlUgpWN.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/31.mdx?astroContentCollectionEntry=true":"chunks/31_yEYOLivI.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/32.mdx?astroContentCollectionEntry=true":"chunks/32_Qh38ONu1.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/33.mdx?astroContentCollectionEntry=true":"chunks/33_iUboTKxz.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/4.mdx?astroContentCollectionEntry=true":"chunks/4_pfAiqD3A.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/5.mdx?astroContentCollectionEntry=true":"chunks/5_fZo_M9OR.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/6.mdx?astroContentCollectionEntry=true":"chunks/6_fmJhE3Nm.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/7.mdx?astroContentCollectionEntry=true":"chunks/7_mmktzipg.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/8.mdx?astroContentCollectionEntry=true":"chunks/8_hzPYyKUs.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/9.mdx?astroContentCollectionEntry=true":"chunks/9_aFuHQVuN.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/1.mdx?astroPropagatedAssets":"chunks/1_PuCo3O-h.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/10.mdx?astroPropagatedAssets":"chunks/10_YRETedys.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/11.mdx?astroPropagatedAssets":"chunks/11_NJfBOY5X.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/12.mdx?astroPropagatedAssets":"chunks/12_r0XVWuR1.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/13.mdx?astroPropagatedAssets":"chunks/13_dZYY3kbj.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/14.mdx?astroPropagatedAssets":"chunks/14_PoLzIWu9.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/15.mdx?astroPropagatedAssets":"chunks/15_Z-JV9GaG.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/16.mdx?astroPropagatedAssets":"chunks/16_aSaCf4Z-.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/17.mdx?astroPropagatedAssets":"chunks/17_vEqa7TmJ.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/18.mdx?astroPropagatedAssets":"chunks/18_idmm2x-J.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/19.mdx?astroPropagatedAssets":"chunks/19_ib_KW7V3.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/2.mdx?astroPropagatedAssets":"chunks/2_RHT_5704.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/20.mdx?astroPropagatedAssets":"chunks/20_s-1R9Xn9.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/21.mdx?astroPropagatedAssets":"chunks/21_O-mAtvFN.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/22.mdx?astroPropagatedAssets":"chunks/22_uUidCHqP.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/23.mdx?astroPropagatedAssets":"chunks/23_LET-HTUq.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/24.mdx?astroPropagatedAssets":"chunks/24_bjfQj6-q.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/25.mdx?astroPropagatedAssets":"chunks/25_9s-5m9o1.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/26.mdx?astroPropagatedAssets":"chunks/26_KWzsy9Z8.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/27.mdx?astroPropagatedAssets":"chunks/27_WnXFnFsW.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/28.mdx?astroPropagatedAssets":"chunks/28_PtbUnEh2.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/29.mdx?astroPropagatedAssets":"chunks/29_J2Vb5RZU.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/3.mdx?astroPropagatedAssets":"chunks/3_1Pef6TMd.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/30.mdx?astroPropagatedAssets":"chunks/30_WdBa1teC.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/31.mdx?astroPropagatedAssets":"chunks/31_7ARASl7J.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/32.mdx?astroPropagatedAssets":"chunks/32_mqUBbW8z.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/33.mdx?astroPropagatedAssets":"chunks/33_3UsX-g4u.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/4.mdx?astroPropagatedAssets":"chunks/4_P2Iv_ATF.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/5.mdx?astroPropagatedAssets":"chunks/5_-rCBNWZ5.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/6.mdx?astroPropagatedAssets":"chunks/6_I3oiAPwN.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/7.mdx?astroPropagatedAssets":"chunks/7_Pu3aufue.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/8.mdx?astroPropagatedAssets":"chunks/8_n97a6iCB.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/9.mdx?astroPropagatedAssets":"chunks/9_Yxelv553.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/1.mdx":"chunks/1_EU66fekz.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/10.mdx":"chunks/10_pp4tkjCZ.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/11.mdx":"chunks/11_4XjIT5a8.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/12.mdx":"chunks/12_adESIQ5h.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/13.mdx":"chunks/13_tHzBbU-g.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/14.mdx":"chunks/14_-_fcwyxk.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/15.mdx":"chunks/15_Zp-N9z30.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/16.mdx":"chunks/16_wthrAnqV.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/17.mdx":"chunks/17_GFhvQI8w.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/18.mdx":"chunks/18_pCyxKKZE.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/19.mdx":"chunks/19_q05NSuyd.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/2.mdx":"chunks/2_5EuwxJwD.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/20.mdx":"chunks/20_5ceNPM-m.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/21.mdx":"chunks/21_CpR5C75Z.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/22.mdx":"chunks/22_O3910Im_.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/23.mdx":"chunks/23_txuZ1GdS.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/24.mdx":"chunks/24_ZY36zRBP.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/25.mdx":"chunks/25_FFAOK6qO.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/26.mdx":"chunks/26_Rr5kpUmo.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/27.mdx":"chunks/27_n4QyHglg.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/28.mdx":"chunks/28_l4umIa5W.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/29.mdx":"chunks/29_ePj0DeB8.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/3.mdx":"chunks/3_a-hSkMiv.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/30.mdx":"chunks/30_FLSHYqO2.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/31.mdx":"chunks/31_DkUrt56o.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/32.mdx":"chunks/32_ghKHkCMg.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/33.mdx":"chunks/33_YinAaMT1.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/4.mdx":"chunks/4_8wrB60ww.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/5.mdx":"chunks/5_eUJ03hwZ.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/6.mdx":"chunks/6__RnCBjfu.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/7.mdx":"chunks/7_oEI9L4mi.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/8.mdx":"chunks/8_GIrqZvD4.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/content/newsletter/9.mdx":"chunks/9_Kj1hHO8D.mjs","/Users/polpielladev/Developer/ioscinewsletter.com/src/layouts/IssueLayout.astro":"chunks/IssueLayout_lFrW64HU.mjs","@astrojs/react/client.js":"_astro/client.7zMtztfk.js","/Users/polpielladev/Developer/ioscinewsletter.com/src/components/Toast.tsx":"_astro/Toast.PsLaVKzt.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/index.2agtENQu.css","/ci-newsletter.svg","/og.jpg","/qreate.webp","/runway-alt.png","/_astro/Toast.PsLaVKzt.js","/_astro/client.7zMtztfk.js","/_astro/index.6YJ0o9Me.js","/issues/rss.xml","/index.html","/sponsor/index.html"],"buildFormat":"directory"});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
