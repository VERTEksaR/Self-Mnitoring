import {useState} from 'react';
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    tablePlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    ListsToggle,
    CreateLink,
    linkDialogPlugin,
    InsertTable,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

export function NoteEditor({ initialMarkdown = '', onChange }) {
    const [startingMarkdown] = useState(initialMarkdown);

    return (
        <MDXEditor
            className="dark-theme note-editor"
            contentEditableClassName="markdown note-editor-content"
            placeholder="Напиши конспект…"
            markdown={startingMarkdown}
            onChange={onChange}
            plugins={[
                headingsPlugin({allowedHeadingLevels: [1, 2, 3]}),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                tablePlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <>
                            <UndoRedo />
                            <BlockTypeSelect />
                            <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
                            <ListsToggle />
                            <CreateLink />
                            <InsertTable />
                        </>
                    ),
                }),
            ]}
        />
    );
}