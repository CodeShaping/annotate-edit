import { Editor, createShapeId, getSvgAsImage, Box, track, TLShapeId } from '@tldraw/tldraw'
import { getSelectionAsText } from './getSelectionAsText'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { getCodeFromOpenAI } from './getCodeFromOpenAI'

import { blobToBase64 } from './blobToBase64'
import { addGridToSvg } from './addGridToSvg'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'

import { downloadDataURLAsFile } from './downloadDataUrlAsFile'

export async function makeReal(editor: Editor, apiKey: string, codeShapeId:	TLShapeId) {
	editor.resetZoom()

	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	// const { maxX, midY } = editor.getSelectionPageBounds()!
	const box = editor.getSelectionPageBounds() as Box;
	// const newShapeId = createShapeId()
	// editor.createShape<PreviewShape>({
	// 	id: newShapeId,
	// 	type: 'response',
	// 	x: maxX + 60, // to the right of the selection
	// 	y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
	// 	props: { html: '' },
	// })
	// TODO: d1eterine different actions: {1: edit: using diff view; 2: generate code; 3: execute code}

	// editor.createShape<CodeEditorShape>({
	// 	id: newShapeId,
	// 	type: 'code-editor-shape',
	// 	x: maxX + 60,
	// 	y: midY - (540 * 2) / 3 / 2,
	// 	props: {
	// 		html: 'generating code...',
	// 		w: 200,
	// 		h: 300
	// 	},
	// })

	// Get an SVG based on the selected shapes
	const svg = await editor.getSvg(selectedShapes, {
		scale: 1,
		background: true,
		bounds: box,
	})

	if (!svg) {
		return
	}

	// Add the grid lines to the SVG
	const grid = { color: 'red', size: 100, labels: true }
	addGridToSvg(svg, grid)

	if (!svg) throw Error(`Could not get the SVG.`)

	// Turn the SVG into a DataUrl
	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	const blob = await getSvgAsImage(svg, IS_SAFARI, {
		type: 'png',
		quality: 1,
		scale: 1,
	})
	const dataUrl = await blobToBase64(blob!)
	// downloadDataURLAsFile(dataUrl, 'tldraw.png')

	// Get any previous previews among the selected shapes
	// const previousPreviews = selectedShapes.filter((shape) => {
	// 	return shape.type === 'response'
	// }) as PreviewShape[]
	const previousCodeEditors = selectedShapes.filter((shape) => {
		return shape.type === 'code-editor-shape'
	}) as CodeEditorShape[]

	console.log('dataUrl\n', previousCodeEditors)

	
	try {
		const json = await getCodeFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			grid,
			previousCodeEditors,
		});
		// const json = await getHtmlFromOpenAI({
		// 	image: dataUrl,
		// 	apiKey,
		// 	text: getSelectionAsText(editor),
		// 	previousPreviews,
		// })
		console.log('res\n', json)

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		// const message = json.choices[0].message.content

		// editor.updateShape<PreviewShape>({
		// 	id: newShapeId,
		// 	type: 'response',
		// 	props: {
		// 		html: message,
		// 	},
		// })

		const message = json.choices[0].message.content
		const code = message.match(/```(python|javascript)([\s\S]*?)```/)?.[2] || message
		if (code.length < 30) {
			console.warn(message)
			throw Error('Could not generate a design from those wireframes.')
		}


		// calculate height of code editor (line-height = 1.4)
		const lines = code.split('\n').length;
		// const height = Math.min(300, lines * 1.4 * 16)

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
		await new Promise((resolve) => setTimeout(resolve, 1000))

		editor.updateShape<CodeEditorShape>({
			id: codeShapeId,
			type: 'code-editor-shape',
			props: {
				prevCode: prevCode,
				code: code
			},
		})
	} catch (e) {
		// If anything went wrong, delete the shape.
		// editor.deleteShape(newShapeId)
		console.error(e)
		throw e
	}
}
