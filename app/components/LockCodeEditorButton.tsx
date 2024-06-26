import { useEditor, type TLShapeId } from '@tldraw/tldraw'
import type { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
import React, { useCallback } from 'react';


export function LockCodeEditorButton({ codeShapeId }: { codeShapeId: TLShapeId }) {
    const editor = useEditor();

    const handleClick = useCallback(() => {
        const tempCodeEditor = editor.getShape(codeShapeId) as CodeEditorShape;
        if (!tempCodeEditor) throw Error('Could not find the code editor shape.');
        
        editor.updateShape<CodeEditorShape>({
            id: codeShapeId,
            type: 'code-editor-shape',
            isLocked: !tempCodeEditor.isLocked,
        });


        if (tempCodeEditor.isLocked) {
            editor.setSelectedShapes([codeShapeId]);
            editor.setEditingShape(codeShapeId);
        } else {
            editor.setEditingShape(null);
            editor.deselect(tempCodeEditor.id);
        }
    }, [codeShapeId, editor]);

    return (
        <button className={'lockCodeEditorButton'} onClick={handleClick}>
            Edit
        </button>
    );
}