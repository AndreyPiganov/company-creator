export const SITE_STYLES = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.7;overflow-wrap:anywhere}
a{color:inherit;text-decoration:none}
:focus-visible{outline:3px solid var(--accent);outline-offset:5px}
.skip-link{position:absolute;left:20px;top:-100px;padding:12px;background:var(--surface);z-index:10}
.skip-link:focus{top:10px}
.wrap{width:min(1180px,calc(100% - 48px));margin-inline:auto}
.site-header{width:min(1300px,calc(100% - 32px));margin:20px auto 0;display:flex;align-items:center;justify-content:space-between;gap:24px;border:1px solid var(--line);border-radius:18px;background:var(--surface);padding:18px 24px}
.brand{font-weight:750;font-size:19px;letter-spacing:-.03em;max-width:50%}
.brand small{display:block;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:4px}
nav{display:flex;gap:5px;flex-wrap:wrap}
nav a{padding:9px 14px;border-radius:10px;font-size:14px}
nav a:hover,nav a[aria-current=page]{background:var(--soft);color:var(--accent)}
nav a[aria-current=page]{font-weight:700}
.hero{padding:85px 0 90px;display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center}
.hero>div{min-width:0}
.page-hero{padding:80px 0 65px;max-width:1180px}
.eyebrow,.kicker{text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:750;color:var(--accent)}
.hero .eyebrow{display:inline-block;padding:6px 12px;border:1px solid var(--line);border-radius:24px;background:var(--surface)}
h1,h2,h3,p{margin-top:0}
h1{margin:22px 0 26px;font-size:clamp(38px,5vw,72px);line-height:1.06;letter-spacing:-.055em;text-wrap:balance}
.page-hero h1{max-width:900px;font-size:clamp(38px,5vw,68px)}
.lead{max-width:850px;font-size:clamp(17px,1.8vw,21px);line-height:1.75;color:var(--muted)}
.actions{margin-top:30px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.button{display:inline-flex;align-items:center;gap:14px;background:var(--accent);color:#fff;border:1px solid var(--accent);border-radius:12px;padding:13px 19px;font-weight:650;box-shadow:0 6px 14px color-mix(in srgb,var(--accent) 16%,transparent);transition:transform .2s}
.button:hover{transform:translateY(-2px)}
.text-link{font-weight:650;color:var(--accent)}
.research-board{position:relative;border:1px solid var(--line);border-radius:26px;padding:26px;background:linear-gradient(135deg,var(--surface),var(--soft));box-shadow:0 25px 60px color-mix(in srgb,var(--ink) 8%,transparent)}
.board-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:20px;font-size:12px;color:var(--muted)}
.board-dot{width:8px;height:8px;background:var(--accent);border-radius:50%;display:inline-block;margin-right:7px}
.board-step{background:var(--surface);border:1px solid var(--line);padding:17px;border-radius:14px;display:grid;grid-template-columns:30px 1fr;gap:12px;margin-top:12px}
.board-step>span{color:var(--accent);font-size:12px;font-weight:750;padding-top:3px}
.board-step h3{font-size:15px;margin:0 0 6px}.board-step p{font-size:13px;line-height:1.7;margin:0;color:var(--muted)}
.board-note{margin:18px 0 0;font-size:11px;color:var(--muted)}
.fact-strip{display:flex;gap:24px;justify-content:space-between;flex-wrap:wrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;font-size:12px;color:var(--muted)}
.fact-strip strong{display:block;color:var(--ink);font-size:14px;font-weight:650}
.statement{background:var(--soft);padding:65px 0;margin-top:65px;border-block:1px solid var(--line)}
.split{display:grid;grid-template-columns:180px 1fr;gap:40px}
.split h2{max-width:850px;font-size:clamp(23px,2.5vw,32px);line-height:1.5;letter-spacing:-.025em;font-weight:550}
.split p:last-child{max-width:780px;color:var(--muted)}
.section{padding:80px 0}
.section-head{display:grid;grid-template-columns:180px 1fr;gap:40px;margin-bottom:36px}
.section-head h2{max-width:780px;font-size:clamp(28px,3.3vw,44px);line-height:1.2;letter-spacing:-.04em}
.steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.steps article{padding:28px;border:1px solid var(--line);border-radius:20px;background:var(--surface)}
.steps span{display:grid;place-items:center;width:38px;height:38px;background:var(--soft);border-radius:11px;font-size:12px;font-weight:800;color:var(--accent)}
.steps h3{margin:24px 0 12px;font-size:23px}
.steps p,.product-grid p,.team article>p:last-child{color:var(--muted);font-size:15px}
.callout{margin-bottom:80px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:18px;background:var(--surface);padding:36px 42px}
.callout h2{max-width:950px;font-size:clamp(19px,2vw,25px);font-weight:500;line-height:1.65;letter-spacing:-.02em}
.product-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;padding-top:0}
.product-grid article{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:32px}
.product-grid .limit{background:var(--soft)}
.faq{background:var(--surface);border-block:1px solid var(--line)}
.faq-list{max-width:960px;margin-left:auto}.faq-list details{border-top:1px solid var(--line);padding:22px 0}.faq-list details:last-child{border-bottom:1px solid var(--line)}
summary{cursor:pointer;font-size:18px;font-weight:650;letter-spacing:-.02em;padding-right:12px}.faq-list details p{max-width:850px;margin:16px 0 0;color:var(--muted)}
.team{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.team article{min-width:0;padding:16px 16px 22px;border:1px solid var(--line);border-radius:20px;background:var(--surface)}
.portrait{aspect-ratio:3/4;border-radius:12px;background-size:500% auto;background-position-y:center;background-repeat:no-repeat;background-color:var(--soft)}
.portrait-upload{display:block;width:100%;height:auto;object-fit:cover}
.p0{background-position-x:0}.p1{background-position-x:25%}.p2{background-position-x:50%}.p3{background-position-x:75%}.p4{background-position-x:100%}
.team h3{margin:20px 0 6px;font-size:21px;letter-spacing:-.025em}.team .role{color:var(--accent);font-size:13px;font-weight:650;min-height:44px}.team article>p:last-child{font-size:14px;line-height:1.7;margin-bottom:0}
.contact{padding:65px 0;background:var(--soft);border-top:1px solid var(--line)}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}.contact h2{font-size:clamp(25px,3vw,40px);letter-spacing:-.035em;line-height:1.25}
.contact-grid>div:last-child{display:grid;gap:12px;font-size:clamp(16px,2vw,22px);font-weight:600}.contact-grid a{border-bottom:1px solid var(--line);padding:8px 0}.contact-grid a:hover{color:var(--accent)}
.footer{width:min(1180px,calc(100% - 48px));margin:auto;display:flex;justify-content:space-between;gap:30px;padding:40px 0;color:var(--muted);font-size:12px}.footer p{max-width:720px;margin-top:8px}.footer span{max-width:180px;text-transform:uppercase;letter-spacing:.1em;font-size:10px}
@media(max-width:980px){.hero{grid-template-columns:1fr;gap:32px;padding:55px 0}.research-board{max-width:700px}.team{grid-template-columns:repeat(2,minmax(0,1fr))}.steps{grid-template-columns:1fr}.split,.section-head{grid-template-columns:1fr;gap:12px}.section-head h2{margin-bottom:0}}
@media(max-width:680px){.wrap{width:calc(100% - 32px)}.site-header{align-items:flex-start;flex-direction:column;gap:16px;padding:16px}.brand{max-width:100%}.site-header nav{width:100%;gap:3px}.site-header nav a{padding:6px 8px;font-size:12px}.hero{padding:45px 0}h1{font-size:40px}.research-board{padding:18px}.board-step{padding:14px}.section{padding:50px 0}.product-grid{grid-template-columns:1fr;padding-top:0}.callout{padding:25px;margin-bottom:50px}.team{grid-template-columns:1fr}.portrait{max-width:340px;margin:auto}.contact-grid{grid-template-columns:1fr;gap:20px}.footer{flex-direction:column}.footer span{max-width:none}.page-hero{padding:50px 0 35px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
`;
