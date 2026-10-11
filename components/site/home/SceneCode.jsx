"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useSceneActive } from "@/lib/motion";

/* Scene 02 — a typewriter code editor. Ten real-world snippets rotate at
   random; typing pauses whenever the scene is off-screen. With reduced
   motion the first snippet is shown complete and nothing rotates. */
/* 10-snippet rotation for the SceneCode typewriter. Each snippet types out
   character-by-character then waits 5s before the next one is picked at random. */
const CODE_SNIPPETS = [
  {
    file: "~/automations/payment-reconcile.ts",
    code: `// reconcile Stripe + Whop charges → Airtable
import { table } from "@airtable/scripts";
const charges = await fetchCharges({ since: lastRun });

for (const c of charges) {
  if (await findByExternalId(c.id)) continue;
  await table.createRecord({
    amount: c.amount / 100,
    customer: await resolveCustomer(c),
    commission: splitCommission(c),
  });
}`,
  },
  {
    file: "~/lib/webhook-retry.ts",
    code: `// exponential backoff for transient webhook failures
async function deliver(url, body, attempt = 1) {
  const res = await fetch(url, { method: "POST", body });
  if (res.ok) return res;
  if (attempt >= 5) throw new Error("max retries");

  const wait = 2 ** attempt * 250;
  await sleep(wait);
  return deliver(url, body, attempt + 1);
}`,
  },
  {
    file: "~/sms/inbound-stop.ts",
    code: `// inbound SMS: detect STOP, propagate opt-out
const STOP = new Set(["STOP", "UNSUBSCRIBE", "QUIT"]);

export async function onInbound(msg) {
  const text = msg.body.trim().toUpperCase();
  if (!STOP.has(text)) return;
  const contact = await findContact(msg.from);
  if (!contact) return;
  await markOptOut(contact.id, { source: "sms" });
  await replyAck(msg.from);
}`,
  },
  {
    file: "~/agents/guardrails.ts",
    code: `// validate LLM output before it touches the CRM
const Lead = z.object({
  intent: z.enum(["high", "medium", "low"]),
  budget: z.number().nullable(),
  reply: z.string().max(600),
});

const out = Lead.safeParse(JSON.parse(raw));
if (!out.success) return handoff(lead, out.error);
if (quotesPrice(out.data.reply)) return handoff(lead, "pricing");
await crm.update(lead.id, out.data);`,
  },
  {
    file: "~/cal/conflict-check.ts",
    code: `// team-wide conflict check before booking
async function canBook(slot) {
  const team = await listTeam();
  const events = (await Promise.all(
    team.map(u => listEvents(u.email, slot.start, slot.end))
  )).flat();

  return events.every(e =>
    e.end <= slot.start || e.start >= slot.end
  );
}`,
  },
  {
    file: "~/lead/route.ts",
    code: `// route inbound lead to the right pod
function pickPod(lead) {
  if (lead.budget > 50000) return "enterprise";
  if (lead.region === "EU") return "eu-team";
  if (lead.source === "referral") return "warm";
  return "smb";
}

const pod = pickPod(lead);
await assignTo(pod, lead);
await slackPing(\`#\${pod}\`, lead);`,
  },
  {
    file: "~/esign/callback.ts",
    code: `// eSignatures.io status webhook handler
if (req.body.status !== "signed") return ok();

const deal = await findDeal(req.body.contract_id);
await markSigned(deal.id, req.body.signed_at);
await triggerScenario("payment_link", deal);
await notify(deal.owner, "contract signed");
return ok();`,
  },
  {
    file: "~/ops/digest.ts",
    code: `// nightly ops digest → Slack #ops
const since = startOfDay(new Date());
const wins = await listWins({ since });
const blockers = await listBlockers({ since });

const blocks = composeDigest({ wins, blockers });
await postSlack("#ops-digest", blocks);
await markRunComplete("digest");`,
  },
  {
    file: "~/lib/rate-limit.ts",
    code: `// token-bucket rate limit per workspace
const buckets = new Map();

function take(workspace, cost = 1) {
  const b = buckets.get(workspace) ?? { tokens: 100, refilledAt: now() };
  refill(b);
  if (b.tokens < cost) throw new TooManyRequests();
  b.tokens -= cost;
  buckets.set(workspace, b);
}`,
  },
  {
    file: "~/airtable/upsert.ts",
    code: `// upsert by external key, batched 10/req
const chunks = chunk(records, 10);

for (const batch of chunks) {
  await base(table).update(batch, {
    typecast: true,
    performUpsert: { fieldsToMergeOn: ["external_id"] },
  });
  await sleep(220); // stay under 5 req/s per base
}`,
  },
];

// Tokenize a code line into syntax-highlighted spans (light JS/TS lexer).
function tokenizeCodeLine(line) {
  if (line.trim().startsWith("//")) return [{ c: "com", t: line }];
  const KW = /^(import|from|const|let|var|await|async|function|for|if|else|return|of|in|new|throw|continue|export|default|try|catch|class|extends|null|undefined|true|false|this|break)\b/;
  const out = [];
  let rest = line;
  while (rest.length > 0) {
    let m;
    if ((m = rest.match(/^"(?:[^"\\]|\\.)*"/)) || (m = rest.match(/^'(?:[^'\\]|\\.)*'/)) || (m = rest.match(/^`(?:[^`\\]|\\.)*`/))) {
      out.push({ c: "str", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(KW))) {
      out.push({ c: "kw", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(/^[0-9]+(\.[0-9]+)?/))) {
      out.push({ c: "num", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/))) {
      out.push({ c: "fn", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/))) {
      out.push({ c: "var", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    out.push({ c: "", t: rest[0] });
    rest = rest.slice(1);
  }
  return out;
}

// Pre-tokenize once at module load so every keystroke is a cheap render.
const SNIPPETS_TOKENIZED = CODE_SNIPPETS.map((s) => {
  const lines = s.code.split("\n").map((line) => ({
    tokens: tokenizeCodeLine(line),
    raw: line,
  }));
  // total chars including newlines
  let total = 0;
  for (const l of lines) total += l.raw.length + 1;
  total -= 1; // last line has no trailing newline
  return { file: s.file, lines, totalChars: total };
});
const MAX_LINES = SNIPPETS_TOKENIZED.reduce((m, s) => Math.max(m, s.lines.length), 0);

export default function SceneCode() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const active = useSceneActive(rootRef);
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduced || !active) return;
    const snippet = SNIPPETS_TOKENIZED[snippetIdx];
    if (typed < snippet.totalChars) {
      // mild jitter so it feels like a person typing, not a constant tick
      const id = setTimeout(() => setTyped((n) => Math.min(snippet.totalChars, n + 2)), 28 + Math.floor(Math.random() * 30));
      return () => clearTimeout(id);
    }
    // Snippet done — wait 5s, then pick a different snippet at random.
    const id = setTimeout(() => {
      let next;
      do {
        next = Math.floor(Math.random() * SNIPPETS_TOKENIZED.length);
      } while (next === snippetIdx && SNIPPETS_TOKENIZED.length > 1);
      setSnippetIdx(next);
      setTyped(0);
    }, 5000);
    return () => clearTimeout(id);
  }, [snippetIdx, typed, active, reduced]);

  const snippet = SNIPPETS_TOKENIZED[snippetIdx];
  const shown = reduced ? snippet.totalChars : typed;
  let charsLeft = shown;
  const lineNodes = [];
  for (let li = 0; li < snippet.lines.length; li++) {
    const line = snippet.lines[li];
    const lineCharLen = line.raw.length;
    if (charsLeft <= 0) {
      lineNodes.push(<span key={li} className="line"><span>&nbsp;</span></span>);
      continue;
    }
    const cut = Math.min(charsLeft, lineCharLen);
    let used = 0;
    const spans = [];
    for (const tok of line.tokens) {
      if (used >= cut) break;
      const take = Math.min(tok.t.length, cut - used);
      spans.push(<span key={spans.length} className={tok.c}>{tok.t.slice(0, take)}</span>);
      used += tok.t.length;
    }
    const isCurrentLine = cut < lineCharLen || (charsLeft <= lineCharLen + 1 && li === snippet.lines.length - 1);
    lineNodes.push(
      <span key={li} className="line">
        {spans.length > 0 ? spans : <span>&nbsp;</span>}
        {isCurrentLine && shown < snippet.totalChars ? <span className="caret"></span> : null}
      </span>
    );
    charsLeft -= lineCharLen + 1; // +1 for the newline between lines
  }

  return (
    <div className="scene" data-scene="1" id="scene-code">
      <div className="scene-text">
        <div className="eyebrow"><span className="dot" aria-hidden="true"></span> Scene 02 / Custom code</div>
        <h2 className="scene-h">Code, <em>where it counts</em>.</h2>
        <p className="scene-body">
          Loops, conditional branching, hundreds of records, audit-traceable retries, APIs without polished connectors. <strong>JavaScript, TypeScript, Node.js, Python</strong> — Airtable scripts, custom webhooks, scheduled jobs that don&rsquo;t time out and explain their own failures.
        </p>
        <div className="scene-meta">
          <span className="chip hot">TypeScript</span>
          <span className="chip">Node.js</span>
          <span className="chip">Python</span>
          <span className="chip">Airtable JS</span>
          <span className="chip">Cloudflare Workers</span>
        </div>
        <Link href="/work/airtable-interface-extensions-react" className="scene-link">
          See a real example <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="scene-visual" ref={rootRef}>
        <div
          className="codeblock"
          role="img"
          aria-label={`Code editor typing ${snippet.file.replace("~/", "")}, one of ten production snippets: payment reconciliation, webhook retries, LLM output guardrails, rate limiting and more.`}
        >
          <div className="head" aria-hidden="true">
            <div className="dots"><span></span><span></span><span></span></div>
            <div className="file">{snippet.file}</div>
          </div>
          <div className="body" aria-hidden="true">
            <div className="gutter">
              {Array.from({ length: MAX_LINES }, (_, i) => (
                <span key={i}>{i < snippet.lines.length ? i + 1 : ""}</span>
              ))}
            </div>
            <div className="code">
              {lineNodes}
              {/* fill remaining lines with empty so codeblock height stays stable */}
              {Array.from({ length: Math.max(0, MAX_LINES - snippet.lines.length) }, (_, i) => (
                <span key={`pad-${i}`} className="line"><span>&nbsp;</span></span>
              ))}
            </div>
          </div>
        </div>

        <div className="codeblock-orbit" aria-hidden="true">
          <span className="chip" style={{ top: "8%", right: "4%" }}>Stripe API ✓</span>
          <span className="chip" style={{ top: "20%", left: "-2%" }}>Webhook recv</span>
          <span className="chip" style={{ bottom: "16%", right: "-2%" }}>Idempotent</span>
          <span className="chip" style={{ bottom: "4%", left: "8%" }}>Schema-validated</span>
        </div>
      </div>
    </div>
  );
}
