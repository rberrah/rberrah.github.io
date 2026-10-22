#!/usr/bin/env python3
"""Check live Google Search Console sitemap prerequisites, from a GitHub runner.

No third-party packages. Simulated Googlebot user-agent is only a diagnostic:
it does NOT prove that Google's actual crawler IP can access a resource.
"""
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
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





class LiveHtmlAudit(HTMLParser):
    """Extract indexability basics from server-rendered HTML, without JS."""

    def __init__(self):
        super().__init__()
        self.in_title = False
        self.in_body = False
        self.skip_depth = 0
        self.title = ""
        self.canonicals = []
        self.robots = []
        self.description = []
        self.body_text = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "body":
            self.in_body = True
        elif tag in ("script", "style", "svg", "noscript"):
            self.skip_depth += 1
        elif tag == "meta":
            name = attributes.get("name", "").lower()
            if name in ("robots", "googlebot"):
                self.robots.append(attributes.get("content", ""))
            if name == "description":
                self.description.append(attributes.get("content", ""))
        elif tag == "link" and "canonical" in attributes.get("rel", "").lower():
            self.canonicals.append(attributes.get("href", ""))
        elif tag == "a" and attributes.get("href"):
            self.links.append(attributes.get("href"))

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "body":
            self.in_body = False
        elif tag in ("script", "style", "svg", "noscript"):
            self.skip_depth = max(0, self.skip_depth - 1)

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_body and not self.skip_depth:
            self.body_text.append(data)


def audit_html(path):
    url = ORIGIN + path
    req = urllib.request.Request(url, headers={"User-Agent": GOOGLEBOT_UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            status, final = response.status, response.geturl()
            html = response.read(3_000_000).decode("utf-8", errors="replace")
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as error:
        failures.append(f"HTML {path}: could not fetch ({error})")
        return

    page = LiveHtmlAudit()
    page.feed(html)
    text_length = len(" ".join(" ".join(page.body_text).split()))
    internal_links = sum(1 for link in page.links if link.startswith("/") or link.startswith(ORIGIN))
    print(
        f"HTML [{path}] HTTP {status} -> {final}; "
        f"title={page.title.strip()!r}; "
        f"canonical={page.canonicals!r}; robots={page.robots!r}; "
        f"meta_descriptions={len(page.description)}; "
        f"server_body_text_chars={text_length}; internal_links={internal_links}",
        flush=True,
    )
    if status != 200 or final != url:
        failures.append(f"HTML {path}: HTTP {status} or redirect")
    if not page.title.strip():
        failures.append(f"HTML {path}: missing title")
    if len(page.canonicals) != 1 or page.canonicals[0] != url:
        # Standalone tools belong to independently published repositories:
        # report missing metadata but don't fail the parent site CI.
        if path in ("/multiomics/", "/Omics2PK/"):
            print(f"WARN HTML {path}: canonical metadata needs fixing in its own repo", flush=True)
        else:
            failures.append(f"HTML {path}: missing or non-self canonical {page.canonicals}")
    if any("noindex" in rule.lower() for rule in page.robots):
        failures.append(f"HTML {path}: unexpected noindex")
    if text_length < 180:
        failures.append(f"HTML {path}: little/no text visible without JavaScript ({text_length} chars)")


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
    # Verify representative indexable pages as real HTML, not only sitemap XML.
    for path in [
        "/", "/tools/", "/publications/", "/pharmacometrie/",
        "/pharmacometrie/chapitres/",
        "/pharmacometrie/chapitres/clairance-volume-demi-vie/",
        "/multiomics/", "/stats/", "/Omics2PK/",
    ]:
        audit_html(path)
    if failures:
        print("\nSITEMAP CHECK FAILED:\n- " + "\n- ".join(failures), flush=True)
        return 1
    print("\nAll live HTTP and XML checks passed. If GSC still shows Couldn't fetch, "
          "use URL Inspection > Test live URL for Google's actual fetch evidence.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
