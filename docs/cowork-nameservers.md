# The nameserver change, as a Cowork job

Standing rule 3 in CLAUDE.md: anything that is clicking through a console is a
Cowork job, not a step list. Four rounds of "open this page, tap that" for one
Vercel environment variable did not land; one paste into Cowork did it in a
single go.

This is that paste, for the half of the Cloudflare move that happens at
Hostinger. A Claude session cannot start Cowork — it hands over the prompt.

**Check first.** The dashboard's *Turn on forwarding* panel says where it has
got to and checks itself every twenty seconds. If *The domain is on Cloudflare*
already has a tick, this job is done and should not be run again.

---

```
Move getturnup.com's nameservers from Vercel to Cloudflare, so Cloudflare
Email Routing can receive mail for in.getturnup.com.

I have already signed up to Cloudflare and added the domain there.

1. Open https://dash.cloudflare.com and choose getturnup.com.
   On the Overview page find the two Cloudflare nameservers it tells me to
   use. They look like something.ns.cloudflare.com. Write both down.

2. Before changing anything, open the DNS > Records page for getturnup.com in
   Cloudflare and check the records it imported are there. I need to see:
     - a record for www pointing at Vercel (cname.vercel-dns.com or similar)
     - a record for the bare domain getturnup.com
   If either is missing, STOP and tell me what you see. Do not go on.

3. Open https://hpanel.hostinger.com and sign in.
   Go to Domains, then getturnup.com, then DNS / Nameservers.
   Choose "Change nameservers" / "Use custom nameservers".
   Replace what is there with the two Cloudflare nameservers from step 1.
   Save.

4. Tell me what the page says after saving, and roughly how long it says it
   will take.

Then check it worked:
   - Cloudflare's Overview page for getturnup.com should eventually say
     Active rather than Pending. It can take 15 minutes or a few hours.
   - https://www.getturnup.com should still load. Check it now and again in
     ten minutes. If it stops loading, tell me immediately.

Rules:
- Do not change, delete or add any DNS record anywhere. Only the nameservers.
- Do not turn on any Cloudflare proxy, SSL or redirect setting.
- If anything asks me to buy or upgrade something, stop and tell me.
- Never paste any password or API token into this chat.
```
