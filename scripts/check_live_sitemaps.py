#!/usr/bin/env python3
"""Check live Google Search Console sitemap prerequisites, from a GitHub runner.

No third-party packages. Simulated Googlebot user-agent is only a diagnostic:
it does NOT prove that Google's actual crawler IP can access a resource.
"""
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

ORIGIN = "https://rberrah.github.io"
GOOGLEBOT_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)"
NORMAL_UA = "Mozilla/5.0 (compatible; SitemapAudit/1.0)"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
failures = []


def get(url, label, ua=NORMAL_UA, kind=None):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": ua, "Accept": "application/xml,text/xml,text/plain,*/*"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            status = response.status
            final = response.geturl()
            ctype = response.headers.get("Content-Type", "<missing>")
            body = response.read(2_000_000)
    except urllib.error.HTTPError as error:
        print(f"FAIL [{label}] HTTP {error.code} {url}", flush=True)
        failures.append(f"{label}: HTTP {error.code}")
        return None
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        print(f"FAIL [{label}] {url}: {error}", flush=True)
        failures.append(f"{label}: connection error")
        return None

    print(f"HTTP [{label}] {status} {url} -> {final} ({ctype}, {len(body)} bytes)", flush=True)
    if status != 200 or final != url:
        failures.append(f"{label}: HTTP {status} or redirect to {final}")
    if kind == "xml":
        if "html" in ctype.lower():
            failures.append(f"{label}: HTML Content-Type rather than XML")
        try:
            root = ET.fromstring(body)
        except ET.ParseError as error:
            failures.append(f"{label}: invalid XML ({error})")
            return None
        node = root.tag.split("}")[-1]
        if node not in ("sitemapindex", "urlset"):
            failures.append(f"{label}: unexpected XML root <{node}>")
            return None
        locations = [element.text.strip() for element in root.iter() if element.tag == NS + "loc" and element.text]
        print(f"XML [{label}] <{node}>; {len(locations)} <loc> values", flush=True)
        if not locations:
            failures.append(f"{label}: empty sitemap")
        for location in locations:
            if urlparse(location).netloc != "rberrah.github.io":
                failures.append(f"{label}: outside-site <loc>: {location}")
        return node, locations
    if kind == "robots":
        data = body.decode("utf-8", errors="replace")
        if "Sitemap: " + ORIGIN + "/sitemap-index.xml" not in data:
            failures.append(f"{label}: missing sitemap index declaration")
        if "Disallow: /" in data:
            failures.append(f"{label}: root disallowed in robots.txt")
    return body


def main():
    get(ORIGIN + "/", "homepage")
    get(ORIGIN + "/robots.txt", "robots.txt", kind="robots")
    get(ORIGIN + "/google57e0271e75bd6e07.html", "Google verification")
    index = get(ORIGIN + "/sitemap-index.xml", "index/browser", kind="xml")
    get(ORIGIN + "/sitemap-index.xml", "index/simulated-Googlebot", ua=GOOGLEBOT_UA, kind="xml")
    get(ORIGIN + "/sitemap.xml", "portal/browser", kind="xml")
    get(ORIGIN + "/sitemap.xml", "portal/simulated-Googlebot", ua=GOOGLEBOT_UA, kind="xml")
    if index and index[0] == "sitemapindex":
        # Check independently deployed children too: a successful deployment
        # in this repo alone does not guarantee that those child files exist.
        for child in index[1]:
            if child != ORIGIN + "/sitemap.xml":
                get(child, "index child " + urlparse(child).path, kind="xml")
    if failures:
        print("\nSITEMAP CHECK FAILED:\n- " + "\n- ".join(failures), flush=True)
        return 1
    print("\nAll live HTTP and XML checks passed. If GSC still shows Couldn't fetch, "
          "use URL Inspection > Test live URL for Google's actual fetch evidence.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
