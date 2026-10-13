import ReactMarkdown from "react-markdown";

const MarkdownRender = ({ children }: { children: string }) => (
  <div className="prose prose-sm dark:prose-invert prose-headings:mb-2 prose-headings:mt-3 prose-a:text-primary max-w-none">
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
);

export default MarkdownRender;
