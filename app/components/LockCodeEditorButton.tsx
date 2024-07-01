import { useEditor, type TLShapeId } from '@tldraw/tldraw'
import type { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
import React, { useCallback, useRef } from 'react';


export function LockCodeEditorButton({ codeShapeId, onStoreLog }: { codeShapeId: TLShapeId, onStoreLog: (log: any) => void }) {
    const editor = useEditor();
    let tempCodeEditor = useRef<CodeEditorShape | null>(null);

    const handleClick = useCallback(() => {
        tempCodeEditor.current = editor.getShape(codeShapeId) as CodeEditorShape;
        if (!tempCodeEditor) throw Error('Could not find the code editor shape.');
        
        editor.updateShape<CodeEditorShape>({
            id: codeShapeId,
            type: 'code-editor-shape',
            isLocked: !tempCodeEditor.current.isLocked,
        });


        if (tempCodeEditor.current.isLocked) {
            editor.setSelectedShapes([codeShapeId]);
            editor.setEditingShape(codeShapeId);
            onStoreLog({ type: 'exit-edit'});
        } else {
            editor.setEditingShape(null);
            editor.deselect(tempCodeEditor.current.id);
            onStoreLog({ type: 'edit'});
        }
    }, [codeShapeId, editor]);

    return (
        <button className={'lockCodeEditorButton'} onClick={handleClick}>
            Edit
        </button>
    );
}