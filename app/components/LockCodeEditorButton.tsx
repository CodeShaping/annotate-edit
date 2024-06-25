import { useEditor } from '@tldraw/tldraw'
import { useCallback, useEffect, useState } from 'react'
import { TLShapeId } from '@tldraw/tldraw'
import type { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'

export function LockCodeEditorButton({ codeShapeId }: { codeShapeId: TLShapeId }) {
    const editor = useEditor()
    const [codeEditor, setCodeEditor] = useState<CodeEditorShape | null>(null)
    const [isLocked, setIsLocked] = useState<boolean>(false)

    // Conditionally set the button text and CSS class based on isLocked
    // const buttonText = isLocked ? 'Unlock' : 'Lock'
    // const buttonClass = isLocked ? 'unlockCodeEditorButton' : 'lockCodeEditorButton'

    const handleClick = useCallback(async () => {
        const tempCodeEditor = editor.getShape(codeShapeId) as CodeEditorShape
        setCodeEditor(tempCodeEditor)
        if (!tempCodeEditor) throw Error('Could not find the code editor shape.')

        editor.updateShape<CodeEditorShape>({
            id: codeShapeId,
            type: 'code-editor-shape',
            isLocked: !tempCodeEditor.isLocked,
        })

        setIsLocked(!isLocked)
    }, [editor, codeShapeId, isLocked])

    useEffect(() => {
        setCodeEditor(editor.getShape(codeShapeId) as CodeEditorShape)
        setIsLocked(codeEditor?.isLocked || false)
    }, [editor, codeShapeId, codeEditor])


    return (
        <button className={isLocked ? 'unlockCodeEditorButton' : 'lockCodeEditorButton'} onClick={handleClick}>
            {isLocked ? 'Unlock' : 'Lock'}
        </button>
    )

}
