import { Editor, createShapeId, getSvgAsImage, Box, TLShape, TLShapeId } from '@tldraw/tldraw'
import { getSelectionAsText } from './getSelectionAsText'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { getCodeFromOpenAI } from './getCodeFromOpenAI'

import { blobToBase64 } from './blobToBase64'
import { addGridToSvg } from './addGridToSvg'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'

import { downloadDataURLAsFile } from './downloadDataUrlAsFile'

export async function makeReal(editor: Editor, apiKey: string, codeShapeId: TLShapeId, onStart: () => void, onFinish: () => void) {
	onStart()
	editor.resetZoom()
	// let originalLockStatus = false
	
	const shapes = editor.getCurrentPageShapes() as TLShape[]
	shapes.forEach(async (shape) => {
		if (shape.type === 'code-editor-shape' && shape.isLocked) {
			editor.updateShape({
				...shape,
				isLocked: false,
			})
		}
	})

	let selectedShapes = editor.getSelectedShapes()
	if (selectedShapes.length === 0) {
		editor.selectAll()
		selectedShapes = editor.getSelectedShapes()
	}

	console.log('selectedShapes2', selectedShapes)

	// const { maxX, midY } = editor.getSelectionPageBounds()!
	const box = editor.getSelectionPageBounds() as Box;
	
	const svg = await editor.getSvg(selectedShapes, {
		scale: 1,
		background: true,
		bounds: box,
	})

	if (!svg) {
		return
	}

	const grid = { color: 'red', size: 100, labels: true }
	addGridToSvg(svg, grid)

	if (!svg) throw Error(`Could not get the SVG.`)

	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	const blob = await getSvgAsImage(svg, IS_SAFARI, {
		type: 'png',
		quality: 1,
		scale: 1,
	})
	const dataUrl = await blobToBase64(blob!)
	// downloadDataURLAsFile(dataUrl, 'tldraw.png')

	const previousCodeEditors = selectedShapes.filter((shape) => {
		return shape.type === 'code-editor-shape'
	}) as CodeEditorShape[]

	try {
		const json = await getCodeFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			grid,
			previousCodeEditors,
		});
		console.log('res\n', json.choices[0].message.content)

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}


		const message = json.choices[0].message.content
		const code = message.match(/```(python|javascript)([\s\S]*?)```/)?.[2] || message
		if (code.length < 30) {
			console.warn(message)
			throw Error('Could not generate a design from those wireframes.')
		}


		// const lines = code.split('\n').length;
		// const height = Math.max(300, lines * 1.4 * 16)

		const newTempCode = `
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Load the dataset
data = pd.read_csv('data.csv')

# Preprocess the data by removing NaN values and duplicates
def preprocess(data):
    data = data.dropna()
    data = data.drop_duplicates()
    return data

data = preprocess(data)

# Select features and target variable
X = data[['petal width', 'petal length']]
y = data['target']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# Initialize and train the Logistic Regression model
model = LogisticRegression()
model.fit(X_train, y_train)
`

		const prevCode = editor.getShape<CodeEditorShape>(codeShapeId)?.props.code || ''
		// await new Promise((resolve) => setTimeout(resolve, 1000))

		editor.updateShape<CodeEditorShape>({
			id: codeShapeId,
			type: 'code-editor-shape',
			isLocked: true,
			props: {
				prevCode: prevCode,
				code: code,
			},
		})

		// setEditing
		// editor.setSelectedShapes([codeShapeId])
		// editor.setEditingShape(codeShapeId)

	} catch (e) {
		// editor.deleteShape(newShapeId)
		console.error(e)
		throw e
	} finally {
		onFinish()
	}
}
