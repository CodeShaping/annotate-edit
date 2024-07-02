import { useEditor, useToasts, type TLShapeId } from '@tldraw/tldraw'
import { useCallback, useState } from 'react'
import { executeCode } from '../lib/executeCode'

export function ExecuteCodeButton({ codeShapeId, onStoreLog }: { codeShapeId: TLShapeId, onStoreLog: (log: any) => void }) {
	const editor = useEditor()
	const { addToast } = useToasts()
	const [isExecuting, setIsExecuting] = useState(false)

	const handleClick = useCallback(async () => {
		try {

			setIsExecuting(true);
			let res = await executeCode(editor, codeShapeId)
			// remove html tags
			// res = res.replace(/<[^>]*>?/gm, '')
			
			if (res) {
				setIsExecuting(false);
				addToast({
					icon: 'check',
					title: 'Code executed successfully',
					description: res,
				})
				onStoreLog({ type: 'compiled-result', data: res });
			}
		} catch (e) {
			setIsExecuting(false);
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Could not execute code',
				description: (e as Error).message,
			})

			onStoreLog({ type: 'compiled-error', data: (e as Error).message });
		}
	}, [editor, addToast])

	return (
		<button className="executeCodeButton" onClick={handleClick}>
			{isExecuting ? 'Running...' : '▶️ Run'}
		</button>
	)
}
