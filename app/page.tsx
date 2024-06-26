'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { ShareButtonGroup } from './components/ShareButtonGroup'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { CodeEditorShapeUtil } from './CodeEditorShape/CodeEditorShape'
import { useCallback, useEffect } from 'react'
import { Editor, useEditor, TLShape, TLShapeId, createShapeId, Box } from '@tldraw/tldraw'
// import { useEditor } from 'tldraw'
import { CodeEditorShape } from './CodeEditorShape/CodeEditorShape'
const initalCode = `
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

data = pd.read_csv('data.csv')

def preprocess(data):
    data = data.dropna()
    data = data.drop_duplicates()
    return data

data = preprocess(data)

X = data[['feature1', 'feature2']]
y = data['target']

X_train, X_test, y_train, y_test = train_test_split(
  X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)
` as string;


const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil, CodeEditorShapeUtil]
function InsideOfContext({ newShapeId }: { newShapeId: TLShapeId }) {
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
			// const box = editor.getSelectionPageBounds() as Box
			const codeEditor = editor.getShape<CodeEditorShape>(newShapeId)
			const box = {
				x: 0,
				y: 0,
				w: codeEditor?.props.w || window.innerWidth,
				h: codeEditor?.props.h || window.innerHeight,
			}
			let newY = currentCameraPosition.y;
			// console.log('box', box.y, newY)
			// if (newY < box.y) {
			// 	newY = box.y;
			// } else if (newY > box.y + box.h) {
			// 	newY = box.y + box.h;
			// }

			editor.setCamera({
				x: initialCameraPosition.x,
				y: newY,
				z: 1,
			})

			if (event.touches.length > 1) {
				event.preventDefault();
			}
		};


		editor.createShape<CodeEditorShape>({
			id: newShapeId,
			type: 'code-editor-shape',
			isLocked: true,
			x: 0,
			y: 0,
			props: {
				prevCode: initalCode,
				code: initalCode,
				w: (window.innerWidth),
				h: (window.innerHeight),
			},
		})
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

	return null
}

export default function App() {
	const newShapeId = createShapeId() as TLShapeId
	return (
		<div className="editor">
			<Tldraw
				persistenceKey="make-real"
				shareZone={<ShareButtonGroup codeShapeId={newShapeId} />}
				shapeUtils={shapeUtils}
			>
				<InsideOfContext {...{ newShapeId }} />
			</Tldraw>
		</div>
	)
}