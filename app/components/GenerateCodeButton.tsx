import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback, useState } from 'react'
import { generateCode } from '../lib/generateCode'
// import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
import { TLShapeId } from '@tldraw/tldraw'

export function GenerateCodeButton({ codeShapeId, onStoreLog }: { codeShapeId: TLShapeId, onStoreLog: (log: any) => void }) {
	const editor = useEditor()
	const { addToast } = useToasts()
	const [isGenerating, setIsGenerating] = useState(false)

	const handleClick = useCallback(async () => {
		try {
			// const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
			// const apiKey = input?.value ?? null
			const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
			if (!apiKey) throw Error('Make sure the input includes your API Key!')

			const onStart = () => setIsGenerating(true);
			const onFinish = (original_code: string, code_edit: string) => {
				// console.log('Original Code:', original_code)
				// console.log('Code Edit:', code_edit)
				setIsGenerating(false)
			}
			
			await generateCode(editor, apiKey, codeShapeId, onStart, onFinish, onStoreLog)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		} finally {
			setIsGenerating(false)
		}
	}, [editor, codeShapeId, addToast])

	return (
		<button className="makeRealButton" onClick={handleClick}>
			{isGenerating ? 'Generating...' : '🪄 Generate'}
		</button>
	)
}
