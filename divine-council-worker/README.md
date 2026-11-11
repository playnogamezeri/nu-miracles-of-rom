# Divine Council AI Debate Gateway

This optional Cloudflare Worker enables a genuine four-round AI debate for the GitHub Pages Divine Council. The website itself remains static; the Worker securely calls the OpenAI Responses API.

## Why a gateway is required

**Never put an OpenAI API key in `divine-debate.js`, HTML, or any public repository file.** Browser-side keys can be copied by visitors. The Worker reads the key from a private server-side secret.

## Deploy

1. Create a Cloudflare account and install Wrangler (or use the Cloudflare dashboard).
2. Create a Worker named `rom-divine-council`.
3. Copy `worker.js` into the Worker editor and deploy it.
4. In the Worker settings, add a secret named `OPENAI_API_KEY` containing your OpenAI API key.
5. Optionally add a variable named `OPENAI_MODEL` with a model available to your API project. The default in this Worker is `gpt-5`.
6. Set `ALLOWED_ORIGIN` to `https://playnogamezeri.github.io` (or comma-separated exact origins if you also run a test site).
7. Copy the deployed Worker HTTPS URL into the Secure debate gateway URL field on the Divine Council page.

## Four rounds

1. Independent opening positions grounded in each selected God’s existing record.
2. Cross-examination: questions between perspectives, grounded in actual arguments and domains.
3. Replies and rebuttals: responses to the prior round, including valid challenges and unresolved gaps.
4. Chair's synthesis: supported insights, tensions, options, risks, evidence gaps, and provisional recommendation if justified.

Each round is a separate model request. The browser sends only the selected pantheon records, the question, and the preceding round transcript. The Worker does not save debate transcripts.

## Important boundaries

- The AI is not communicating with supernatural beings. Each voice is a constructed interpretation of the supplied record.
- Existing source records are evidence; generated reasoning is not canon.
- The AI must not invent divine quotations, allegiances, relationships, votes, or new Gods.
- The Worker does not store the API key in the browser or return it to the browser.
- Review your API provider's data controls and usage costs before enabling this feature. Each complete debate uses four model requests.
- For production use, consider rate limiting, abuse protection, and a stricter origin policy. CORS is a browser access control, not authentication.
