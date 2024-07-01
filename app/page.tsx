'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { ShareButtonGroup } from './components/ShareButtonGroup'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { CodeEditorShapeUtil } from './CodeEditorShape/CodeEditorShape'
import { useState, useEffect, useRef } from 'react'
import { useEditor, TLShape, TLShapeId, createShapeId } from '@tldraw/tldraw'
// import { useEditor } from 'tldraw'
import { CodeEditorShape } from './CodeEditorShape/CodeEditorShape'
import { userStudyTasks, type Task } from './lib/tasks'
import { addCollection } from './lib/firebase'


const initalCode1 = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn import datasets

iris = datasets.load_iris()

_, ax = plt.subplots()
scatter = ax.scatter(iris.data[:, 0], iris.data[:, 1], c=iris.target)
ax.set(xlabel=iris.feature_names[0], ylabel=iris.feature_names[1])
_ = ax.legend(
    scatter.legend_elements()[0], iris.target_names, loc="lower right", title="Classes"
)
plt.show()	
` as string;


const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil, CodeEditorShapeUtil]
function InsideOfContext({ newShapeId, currentTask }: { newShapeId: TLShapeId, currentTask: Task | null }) {
	const editor = useEditor()

	useEffect(() => {
		editor.zoomToFit()
		editor.zoomIn()
		editor.resetZoom()
		editor.setCamera({
			x: 0,
			y: 0,
			z: 1,
		})
		const initialCameraPosition = editor.getCamera()

		const handlePanning = (event: TouchEvent) => {
			const currentCameraPosition = editor.getCamera();
			let newY = currentCameraPosition.y;

			editor.setCamera({
				x: initialCameraPosition.x,
				y: newY,
				z: 1,
			})

			if (event.touches.length > 1) {
				if (event.target && (event.target as HTMLElement).className === 'cm-line') {
					return
				}
				event.preventDefault();
			}
		};
		const handleResize = () => {
			editor.updateShape<CodeEditorShape>({
				id: newShapeId,
				type: 'code-editor-shape',
				props: {
					w: window.innerWidth,
					h: window.innerHeight,
				},
			})
		}


		editor.createShape<CodeEditorShape>({
			id: newShapeId,
			type: 'code-editor-shape',
			isLocked: true,
			x: 0,
			y: 0,
			props: {
				prevCode: userStudyTasks[3].starterCode,
				code: userStudyTasks[3].starterCode,
				w: (window.innerWidth),
				h: (window.innerHeight * 2),
			},
		})

		// when user panning
		window.addEventListener('touchstart', handlePanning)
		window.addEventListener('touchmove', handlePanning)
		window.addEventListener('touchend', handlePanning)

		window.addEventListener('resize', handleResize)
		return () => {
			const shapes = editor.getCurrentPageShapes() as TLShape[]
			shapes.forEach((shape) => {
				editor.updateShape({
					...shape,
					isLocked: false,
				})
			})
			editor.deleteShapes([...shapes.map((shape) => shape.id)])
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('touchstart', handlePanning)
			window.removeEventListener('touchmove', handlePanning)
			window.removeEventListener('touchend', handlePanning)
		}
	}, [])

	useEffect(() => {
		if (currentTask) {
			console.log('currentTask', currentTask)
			editor.updateShape<CodeEditorShape>({
				id: newShapeId,
				type: 'code-editor-shape',
				isLocked: true,
				props: {
					prevCode: currentTask.starterCode,
					code: currentTask.starterCode,
				},
			})
		}
	}, [currentTask])

	return null
}


export type LogType = 'edit' | 'exit-edit' | 'compile' | 'compiled-result' | 'compiled-error'
	| 'generate-param' | 'generate-code' | 'generate-error'
export interface LogEvent {
	type: LogType
	userId: string
	taskId: string
	timestamp: number
	data?: any
	createdAt?: any
}


const newShapeId = createShapeId() as TLShapeId
export default function App() {
	const [currentTask, setCurrentTask] = useState<Task | null>(null);
	const taskId = useRef<string | null>(null);
	const userId = useRef<string | null>(null);

	// Parse URL for userId once on component mount
	useEffect(() => {
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(window.location.search);
		const userIdFromUrl = urlParams.get('userId');
		if (userIdFromUrl) {
			userId.current = userIdFromUrl;
		}
		console.log('userIdFromUrl', userIdFromUrl);
	}, []);

	const handleTaskChange = (task: Task) => {
		taskId.current = task.id;
		setCurrentTask(task);
	};

	const handleStoreLog = async (log: any) => {
		console.log('log', log, userId.current, taskId.current);
		if (!taskId.current) {
			console.error('No taskId or userId');
			return;
		}

		const logEvent: LogEvent = {
			type: log.type,
			userId: userId.current || 'anonymous',
			taskId: taskId.current,
			data: log.data || null,
			timestamp: Date.now(),
		};

		await addCollection(`${userId.current}_${taskId.current}`, logEvent);
	};

	return (
		<div className="editor">
			<Tldraw
				persistenceKey="make-real"
				shareZone={<ShareButtonGroup
					codeShapeId={newShapeId}
					onTaskChange={handleTaskChange}
					onStoreLog={handleStoreLog}
				/>}
				shapeUtils={shapeUtils}
			>
				<InsideOfContext {...{ newShapeId, currentTask }} />
			</Tldraw>
		</div>
	)
}