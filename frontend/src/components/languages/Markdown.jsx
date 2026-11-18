import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const COMPONENTS = {
    a: ({ href, children}) => <a href={href} target="_blank" rel="noreferrer">{children}</a>
};

export function Markdown({ children }) {
    return (
        <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>{children}</ReactMarkdown>
        </div>
    );
}