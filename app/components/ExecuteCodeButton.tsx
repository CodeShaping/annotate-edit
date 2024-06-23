import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback, useEffect } from 'react'
import { executeCode } from '../lib/executeCode'

export function ExecuteCodeButton() {
	const editor = useEditor()
	const { addToast } = useToasts()

	const handleClick = useCallback(async () => {
		try {
			await executeCode(editor)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Could not execute code',
				description: (e as Error).message,
			})
		}
	}, [editor, addToast])

	return (
		<button className="executeCodeButton" onClick={handleClick}>
			Run
		</button>
	)
}
