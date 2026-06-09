import { tokenize, tokenizeInline, type Token } from "src/utils/markdown";
import type { Tokens } from "marked";

interface MarkdownProps {
  source: string;
  className?: string;
}

export function Markdown({ source, className }: MarkdownProps) {
  const tokens = tokenize(source);
  return (
    <div
      className={["space-y-3 text-sm text-alvaro-muted leading-relaxed", className]
        .filter(Boolean)
        .join(" ")}
    >
      {tokens.map((token, i) => (
        <RenderToken key={i} token={token} />
      ))}
    </div>
  );
}

function RenderToken({ token }: { token: Token }) {
  switch (token.type) {
    case "heading":
      return <HeadingNode token={token as Tokens.Heading} />;
    case "paragraph":
      return <ParagraphNode token={token as Tokens.Paragraph} />;
    case "list":
      return <ListNode token={token as Tokens.List} />;
    case "blockquote":
      return <BlockquoteNode token={token as Tokens.Blockquote} />;
    case "code":
      return <CodeNode token={token as Tokens.Code} />;
    case "hr":
      return <hr className="border-alvaro-border" />;
    case "space":
      return null;
    default:
      return null;
  }
}

function HeadingNode({ token }: { token: Tokens.Heading }) {
  const depth = Math.min(Math.max(token.depth, 1), 6);
  const Tag = `h${depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const sizes: Record<number, string> = {
    1: "text-xl font-semibold text-alvaro-white",
    2: "text-lg font-semibold text-alvaro-white",
    3: "text-base font-semibold text-alvaro-white",
    4: "text-sm font-medium text-alvaro-white",
    5: "text-sm font-medium text-alvaro-white",
    6: "text-xs font-medium text-alvaro-white",
  };
  return <Tag className={sizes[depth]}>{token.text}</Tag>;
}

function ParagraphNode({ token }: { token: Tokens.Paragraph }) {
  return (
    <p className="whitespace-pre-line">
      <Inline tokens={token.tokens} />
    </p>
  );
}

function ListNode({ token }: { token: Tokens.List }) {
  const Tag = token.ordered ? "ol" : "ul";
  const listClass = token.ordered ? "list-decimal pl-5 space-y-1" : "list-disc pl-5 space-y-1";
  return (
    <Tag className={listClass}>
      {token.items.map((item, i) => (
        <li key={i}>
          <ListItemBody item={item} />
        </li>
      ))}
    </Tag>
  );
}

function ListItemBody({ item }: { item: Tokens.ListItem }) {
  // ListItem.tokens can be any block-level token. The common case is a
  // single `text` token whose `.tokens` are the inline children. For more
  // complex items (multi-paragraph, nested blocks), render each child with
  // the right helper.
  const inline: Token[] = [];
  const others: Token[] = [];
  for (const t of item.tokens) {
    const tok = t as Token;
    if (tok.type === "text") {
      const text = tok as Tokens.Text;
      inline.push(...(text.tokens as Token[]));
    } else if (tok.type === "paragraph") {
      const p = tok as Tokens.Paragraph;
      inline.push(...(p.tokens as Token[]));
    } else {
      others.push(tok);
    }
  }
  return (
    <div>
      {inline.length > 0 && <Inline tokens={inline} />}
      {others.map((t, i) => (
        <RenderToken key={i} token={t} />
      ))}
    </div>
  );
}

function BlockquoteNode({ token }: { token: Tokens.Blockquote }) {
  return (
    <blockquote className="border-l-2 border-alvaro-primary/60 pl-4 italic text-alvaro-muted/90 space-y-2">
      {token.tokens.map((t, i) => (
        <RenderToken key={i} token={t as Token} />
      ))}
    </blockquote>
  );
}

function CodeNode({ token }: { token: Tokens.Code }) {
  return (
    <pre className="rounded-lg bg-alvaro-base/70 border border-alvaro-border p-3 overflow-x-auto text-xs font-mono text-alvaro-white">
      <code>{token.text}</code>
    </pre>
  );
}

export function Inline({ tokens }: { tokens: Tokens.Generic[] }) {
  if (tokens.length === 0) return null;
  return (
    <>
      {tokens.map((token, i) => {
        switch (token.type) {
          case "strong":
            return (
              <strong key={i} className="font-semibold text-alvaro-white">
                {token.text}
              </strong>
            );
          case "em":
            return <em key={i}>{token.text}</em>;
          case "codespan":
            return (
              <code
                key={i}
                className="rounded bg-alvaro-base/70 border border-alvaro-border px-1 py-0.5 text-xs font-mono"
              >
                {token.text}
              </code>
            );
          case "link":
            return (
              <a
                key={i}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-alvaro-primary hover:underline underline-offset-2"
              >
                {token.text}
              </a>
            );
          case "br":
            return <br key={i} />;
          case "text":
            return <span key={i}>{token.text}</span>;
          case "image":
            return (
              <img
                key={i}
                src={token.href}
                alt={token.text}
                className="inline max-h-6 align-middle"
              />
            );
          case "del":
            return <del key={i}>{token.text}</del>;
          default:
            return <span key={i}>{(token as { text?: string }).text ?? ""}</span>;
        }
      })}
    </>
  );
}

// Re-export for direct use in callers that want a quick string conversion.
export { tokenizeInline };
