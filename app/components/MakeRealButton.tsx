import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback, useEffect } from 'react'
import { makeReal } from '../lib/makeReal'
// import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
import { TLShapeId } from '@tldraw/tldraw'

export function MakeRealButton({ codeShapeId }: { codeShapeId: TLShapeId }) {
	const editor = useEditor()
	const { addToast } = useToasts()

	const handleClick = useCallback(async () => {
		try {
			// const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
			// const apiKey = input?.value ?? null
			const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
			if (!apiKey) throw Error('Make sure the input includes your API Key!')
			await makeReal(editor, apiKey, codeShapeId)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
	}, [editor, codeShapeId, addToast])

	return (
		<button className="makeRealButton" onClick={handleClick}>
			Refactor Code
		</button>
	)
}
