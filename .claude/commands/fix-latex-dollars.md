---
description: Find currency $ in content that breaks LaTeX/math rendering and escape it to \$ (preserves real math and shell code)
argument-hint: "[content-dir]"
allowed-tools: Bash(grep:*), Bash(python3:*), Bash(git status:*), Bash(git diff:*), Bash(mkdir:*), Read, Write, Edit, Grep, Glob
---

# Fix LaTeX/math `$` warnings in content

A literal dollar sign used for currency (`$10`, `$2 billion`, `R$ 549`) gets mis-parsed as
inline math when another `$` appears later on the same line — the text between them is read
as `$...$` math. This produces Quartz build warnings (`unicodeTextInMathMode`,
`unknownSymbol`, `commentAtEnd`) and broken rendering in both Quartz and Obsidian.

Your goal: escape every **currency** `$` to `\$`, **without** touching real math
(`$\rightarrow$`, `$O(1)\text{ streaming}$`) or shell code (`$HOME`, `$(curl …)`,
`${VAR}`, `$ sudo …` inside code blocks). `\$` renders as a literal `$` in Quartz, Obsidian,
and plain Markdown.

> **IMPORTANT — do NOT run any Quartz build.** Never run `npx quartz build`, `npm run serve`,
> `serve:clean`, or any build/serve command. After applying the fix, **print** the
> build/verify/commit instructions in Step 4 for the user to run themselves. Do not commit or
> push either — just report.

## Content directory

Determine the content dir from the argument `$ARGUMENTS` if given; otherwise auto-detect the
first of these that exists and contains `*.md` files: `content/`, then `pinei.github.io/content/`.
Use that path everywhere below as `<CONTENT>`.

## Step 1 — Investigate (report only, change nothing yet)

Run these and summarise the findings to the user:

```sh
# How many files and how many $ total
grep -rln --include="*.md" '\$' <CONTENT> | wc -l
grep -rho --include="*.md" '\$' <CONTENT> | wc -l

# Currency context (these WILL be escaped) — $ followed by an optional space + digit
grep -rhnE '\$ ?[0-9]' --include="*.md" <CONTENT> | head -30

# Non-currency $ (must be PRESERVED): reveals real math and shell code
grep -rhnoE '\$[^0-9 ][^$]{0,40}' --include="*.md" <CONTENT> | sort -u | head -40
```

Classify what you see into exactly three buckets and state the counts:

| Bucket | Pattern | Action |
|---|---|---|
| **Currency** | `$` then optional space then a digit — `$1`, `$2 billion`, `R$ 549`, `US$ 380B` | **escape → `\$`** |
| **Real math** | `$…$` whose inner text has a LaTeX backslash command — `$\rightarrow$`, `$O(1)\text{…}$` | **preserve** |
| **Shell code** | `$` inside fenced/inline code — `$HOME`, `$(curl …)`, `${VAR}`, `$ sudo …` | **preserve** |

If you find a `$` that fits none of these, surface it to the user before proceeding.

## Step 2 — Apply the fix

First check the content working tree is clean so the diff is reviewable:

```sh
cd <CONTENT> && git status --short
```

If it is **not** clean, warn the user (the script below is idempotent — the `(?<!\\)`
lookbehind means re-running never double-escapes — but a dirty tree makes the diff harder to
review). Proceed unless they object.

Write this **exact** script with the Write tool (e.g. to `/tmp/fix_latex_dollars.py`) and run
it with `python3 /tmp/fix_latex_dollars.py <CONTENT>`. Do not improvise the regex — this
version is tested:

```python
#!/usr/bin/env python3
"""Escape currency dollar signs ($ followed by optional space + digit) in markdown
prose, leaving fenced code blocks, inline code, frontmatter, and real LaTeX math
($\\rightarrow$, $O(1)...$) untouched."""
import re
import sys
import pathlib

# A '$' that is (a) not already escaped and (b) immediately followed by an
# optional single space then a digit. Matches only the '$'; the space/digit stay.
CURRENCY = re.compile(r'(?<!\\)\$(?= ?\d)')

# A real inline-math span: $...$ whose inner content contains a LaTeX backslash
# command (e.g. $\rightarrow$, $O(1)\text{ streaming}$). These must be protected
# from currency escaping — their closing $ may legitimately precede a digit.
MATH_SPAN = re.compile(r'\$[^$\n]*\\[^$\n]*\$')

# Inline code spans: a run of N backticks ... matching run of N backticks.
BACKTICK_RUN = re.compile(r'`+')


def escape_prose_segment(text: str) -> tuple[str, int]:
    # Protect real LaTeX math spans behind placeholders first.
    protected: list[str] = []

    def stash(m: re.Match) -> str:
        protected.append(m.group(0))
        return f'\x00{len(protected) - 1}\x00'

    text = MATH_SPAN.sub(stash, text)
    new, n = CURRENCY.subn(r'\\$', text)
    # Restore protected math spans verbatim.
    new = re.sub(r'\x00(\d+)\x00', lambda m: protected[int(m.group(1))], new)
    return new, n


def process_prose_line(line: str) -> tuple[str, int]:
    """Escape currency $ in a line, skipping inline-code spans."""
    out = []
    count = 0
    i = 0
    n = len(line)
    while i < n:
        if line[i] == '`':
            m = BACKTICK_RUN.match(line, i)
            fence = m.group(0)
            close = line.find(fence, m.end())
            if close == -1:
                out.append(fence)  # unmatched run; treat as literal
                i = m.end()
            else:
                end = close + len(fence)
                out.append(line[i:end])  # inline code verbatim
                i = end
        else:
            j = line.find('`', i)
            if j == -1:
                j = n
            seg, c = escape_prose_segment(line[i:j])
            out.append(seg)
            count += c
            i = j
    return ''.join(out), count


def process_file(path: pathlib.Path) -> int:
    src = path.read_text(encoding='utf-8')
    lines = src.split('\n')
    result = []
    idx = 0

    # Skip YAML frontmatter
    if lines and lines[0].strip() == '---':
        result.append(lines[0])
        idx = 1
        while idx < len(lines):
            result.append(lines[idx])
            done = lines[idx].strip() == '---'
            idx += 1
            if done:
                break

    in_fence = False
    fence_char = None
    total = 0
    for k in range(idx, len(lines)):
        line = lines[k]
        m = re.match(r'^\s*(```+|~~~+)', line)
        if m:
            ch = m.group(1)[0]
            if not in_fence:
                in_fence, fence_char = True, ch
            elif fence_char == ch:
                in_fence, fence_char = False, None
            result.append(line)
            continue
        if in_fence:
            result.append(line)
        else:
            new, c = process_prose_line(line)
            result.append(new)
            total += c

    if total:
        path.write_text('\n'.join(result), encoding='utf-8')
    return total


def main():
    root = pathlib.Path(sys.argv[1])
    grand = 0
    for md in sorted(root.rglob('*.md')):
        c = process_file(md)
        if c:
            print(f'{c:3d}  {md.relative_to(root)}')
            grand += c
    print(f'\nTotal: {grand} currency $ escaped')


if __name__ == '__main__':
    main()
```

## Step 3 — Verify the diff (this is the safety net)

Confirm nothing that should be preserved was touched:

```sh
cd <CONTENT>

# Real math must be UNCHANGED — these greps should print NOTHING:
git diff | grep -E '^\+' | grep -iE 'rightarrow|\\text' | grep '\\\$'

# Shell vars/prompts must be UNCHANGED — should print NOTHING:
git diff | grep -E '^\+' | grep -E '\\\$\(|\\\$\{|\\\$HOME|\\\$PWD|\\\$ (ssh|sudo|pip|python|mkdir|source|fc-match)'

# Spot-check a few currency escapes look right:
git diff | grep -E '^\+' | grep '\\\$' | head -10
git diff --stat
```

If either "must be UNCHANGED" grep prints anything, something legitimate was escaped — run
`cd <CONTENT> && git checkout -- .` to revert, report the offending case, and stop. (The most
likely culprit is a real-math closing `$` that precedes a digit, e.g. `$\rightarrow$ 2026`;
the `MATH_SPAN` protection already handles backslash-containing spans, so investigate any new
pattern before changing the script.)

## Step 4 — Print instructions for the user (do NOT run these)

Report the per-file counts and total, then output this block for the user to run themselves:

> **Verify the build** (warnings should drop to zero). Run a build in your usual environment
> and check there are no `LaTeX-incompatible` lines:
> ```sh
> npx quartz build 2>&1 | grep -c "LaTeX-incompatible"   # expect 0
> ```
> If the build instead fails with `Could not resolve "./logo"` / `./meta` / `./page-views`,
> that's the stale local-plugin symlink issue, not this change — clear and rebuild:
> ```sh
> rm -rf .quartz && npm run serve:clean
> ```
>
> **Commit & push the content** (it lives in the `content/` submodule = the `quartz-content`
> repo):
> ```sh
> cd content
> git add -A
> git commit -m "Escape currency \$ to avoid LaTeX math mis-parsing"
> git push
> ```
> Pushing `quartz-content` triggers the garden's auto-deploy.

End by reminding the user that you did **not** build, commit, or push — those steps are theirs.
