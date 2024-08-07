'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { ShareButtonGroup } from './components/ShareButtonGroup'

import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { CodeEditorShapeUtil } from './CodeEditorShape/CodeEditorShape'
// import { CustomGroupShapeUtil } from './GroupShape/GroupShape'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useEditor, Editor, TLShape, TLShapeId, createShapeId, track, TLEventInfo, TLUiOverrides } from '@tldraw/tldraw'
// import { useEditor } from 'tldraw'
import { CodeEditorShape } from './CodeEditorShape/CodeEditorShape'
import { userStudyTasks, type Task } from './lib/tasks'
import { addCollection } from './lib/firebase'
import { interpretShapes } from './lib/interpretShapes'
import { generateCode } from './lib/generateCode'

// ICONS
import { FaCodePullRequest } from "react-icons/fa6";
import { FiDelete, FiEdit, FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight, FiCircle, FiTriangle, FiMinus, FiX, FiImage, FiBarChart2, FiCode, FiCheck } from 'react-icons/fi';
import { VscInsert } from "react-icons/vsc";
import { IoText } from "react-icons/io5";
import { PiRectangleDashed, PiBracketsCurlyBold, PiWaveSineBold } from "react-icons/pi";
import { FaUnderline } from "react-icons/fa";
import { BiHighlight } from "react-icons/bi";


import { LockCodeEditorButton } from "./components/LockCodeEditorButton";
import { type ControlBrusheType, availableBrushes } from './components/ControlBrushes';

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil, CodeEditorShapeUtil]
function InsideOfContext({
	newShapeId,
	currentTask,
	onManualCodeChange,
}: { newShapeId: TLShapeId, currentTask: Task | null, onManualCodeChange: (code: string, editor: Editor) => void }) {
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
			if (event.target && (event.target as HTMLElement).className === 'cm-line') {
				event.stopPropagation();
				event.preventDefault();
				return
			}

			if (event.target && (event.target as HTMLButtonElement).name === 'accept') {
				const currentCode = (editor.getShape(newShapeId) as CodeEditorShape).props

				editor.updateShape<CodeEditorShape>({
					id: newShapeId,
					type: 'code-editor-shape',
					isLocked: true,
					props: {
						prevCode: currentCode.code,
						code: currentCode.code + ' ',
					},
				})

				onManualCodeChange(currentCode.code, editor)
			} else if (event.target && (event.target as HTMLButtonElement).name === 'reject') {
				const currentCode = (editor.getShape(newShapeId) as CodeEditorShape).props

				editor.updateShape<CodeEditorShape>({
					id: newShapeId,
					type: 'code-editor-shape',
					isLocked: false,
					props: {
						prevCode: currentCode.prevCode,
						code: currentCode.prevCode,
					},
				})

				onManualCodeChange(currentCode.prevCode, editor)
			}

			const currentCameraPosition = editor.getCamera();
			let newY = currentCameraPosition.y;

			editor.setCamera({
				x: initialCameraPosition.x,
				y: newY,
				z: 1,
			})
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

		const handleTouchEnd = async (event: TouchEvent) => {
			if (event.touches.length > 1) {
				if (event.target && (event.target as HTMLElement).className === 'cm-line') {
					return
				}
				event.preventDefault();
				return
			}

			const currentCameraPosition = editor.getCamera();
			let newY = currentCameraPosition.y;

			editor.setCamera({
				x: initialCameraPosition.x,
				y: newY,
				z: 1,
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
				h: (window.innerHeight),
			},
		})

		// when user panning
		window.addEventListener('touchstart', handlePanning)
		window.addEventListener('touchmove', handlePanning)
		window.addEventListener('touchend', handleTouchEnd)

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
			window.removeEventListener('touchend', handleTouchEnd)
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


export const MetaUiHelper = track(function MetaUiHelper({ onStoreLog, codeShapeId }: { onStoreLog: (log: any) => void, codeShapeId: TLShapeId }) {
	const editor = useEditor();

	let currentShapes = editor.getCurrentPageShapes() as TLShape[];
	// currentShapes = currentShapes.filter((shape) => shape.type === 'group');
	currentShapes = currentShapes.filter((shape) => shape.meta.shape && (shape.meta.shape as string).length > 0);

	const onlySelectedShape = editor.getOnlySelectedShape() as TLShape | null;
	const onlyHoveredShape = editor.getHoveredShape() as TLShape | null;
	// if (!onlySelectedShape) {
	// 	editor.setSelectedShapes(currentShapes);
	// }

	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	if (!onlySelectedShape || !onlyHoveredShape) return null;

	// const handleUngroupShapes = () => {
	// 	// console.log('ungroup shape', onlySelectedShape.id);
	// 	// editor.ungroupShapes([onlySelectedShape.id || onlyHoveredShape.id]);
	// 	// remove meta
	// 	editor.updateShape({ ...onlySelectedShape, meta: {} });
	// };

	const handleRemoveShapes = () => {
		onStoreLog({ type: 'remove-shape', data: onlySelectedShape.meta.shape });
		editor.deleteShapes([onlySelectedShape.id || onlyHoveredShape.id]);
	};

	const handleEditClick = () => {
		setIsEditing(true);
		setEditText(onlySelectedShape.meta.intended_edit as string || onlyHoveredShape.meta.intended_edit as string || '');
	};

	const handleEditCancel = () => {
		setIsEditing(false);
		setEditText(onlySelectedShape.meta.intended_edit as string || onlyHoveredShape.meta.intended_edit as string || '');
	};

	const handleEditConfirm = () => {
		if (onlySelectedShape) {
			editor.updateShape({ ...onlySelectedShape, meta: { ...onlySelectedShape.meta, intended_edit: editText } });
		}
		if (onlyHoveredShape) {
			editor.updateShape({ ...onlyHoveredShape, meta: { ...onlyHoveredShape.meta, intended_edit: editText } });
		}
		onStoreLog({ type: 'edit-interpretation', data: editText });
		setIsEditing(false);
	};

	const handleRegenerateCode = async (groupId: TLShapeId) => {
		const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
		if (!apiKey) throw Error('Make sure the input includes your API Key!');
		const onStart = () => setIsGenerating(true);
		const onFinish = (original_code: string, code_edit: string) => {
			setIsGenerating(false);
			toggleExpand(groupId);
			// update onlySelectedShape with the new meta
			editor.updateShape({ ...onlySelectedShape, meta: { ...onlySelectedShape.meta, original_code, code_edit } });
			onStoreLog({ type: 'commit-change', data: code_edit });
		}
		setIsGenerating(true);
		await generateCode(editor, apiKey, codeShapeId as TLShapeId, onStart, onFinish, onStoreLog, groupId);
	}

	const shapeToIcon = (shape: string) => {
		// might be multiple shapes (e.g. 'circle+arrow+text')
		const shapes = shape.split('+');
		const icons: { [key: string]: JSX.Element } = {
			circle: <FiCircle />,
			ellipse: <FiCircle />,
			curve: <PiWaveSineBold />,
			curly_brackets: <PiBracketsCurlyBold />,
			curly_line: <BiHighlight />,
			arrow: <FiArrowRight />,
			arrow_right: <FiArrowRight />,
			text: <IoText />,
			rectangle: <PiRectangleDashed />,
			triangle: <FiTriangle />,
			line: <FiMinus />,
			underline: <FaUnderline />,
			cross: <FiX />,
			cross_out: <FiX />,
			arrow_up: <FiArrowUp />,
			arrow_down: <FiArrowDown />,
			arrow_left: <FiArrowLeft />,
			insert: <VscInsert />,
			image: <FiImage />,
			plot: <FiBarChart2 />,
			visualization: <FiBarChart2 />,
			code: <FiCode />,
		};

		return shapes.map((s, index) => {
			const icon = icons[s];
			return (
				<span key={index}>
					{icon || s}
				</span>
			);
		});
	};

	const toggleExpand = (shapeId: string) => {
		editor.setSelectedShapes([shapeId as TLShapeId]);
		if (onlySelectedShape.id === shapeId) {
			setIsExpanded(!isExpanded);
		}
	}

	return (
		<div>
			{currentShapes.map((shape, index) => (
				<div
					id="meta-ui-helper"
					key={index}
					style={{
						left: shape.x + 10,
						top: shape.y,
					}}>
					{!isExpanded && (<span id="shape" onClick={() => toggleExpand(shape.id)}>
						{shapeToIcon(shape.meta.shape as string).map((icon, index) => (
							<span key={index}>{icon}</span>
						))}
					</span>)}
					{isExpanded && (shape.id === onlySelectedShape.id || shape.id === onlyHoveredShape.id) && (
						<div className="tooltip">
							<div className="header">
								<span id="shape" onClick={() => toggleExpand(shape.id)}>
									{shapeToIcon(shape.meta.shape as string).map((icon, index) => (
										<span key={index}>{icon}</span>
									))}
								</span>
								<div>
									{/* <button onClick={handleUngroupShapes}><PiRectangleDashed /></button> */}
									<button onClick={handleRemoveShapes}><FiDelete /></button>
									<button onClick={() => handleRegenerateCode(shape.id)}><FaCodePullRequest /></button>
								</div>
							</div>
							<div className="content">
								<p>
									{shape.meta.annotated_text && <span id="text">Recognized Text: {shape.meta.annotated_text as string}</span>}
									{isEditing ? (
										<span id="edit">
											<input type="text" style={{ width: `${editText.length * 6}px` }} value={editText} onChange={(e) => setEditText(e.target.value)} />
											<button onClick={handleEditConfirm}><FiCheck /></button>
											<button onClick={handleEditCancel}><FiX /></button>
										</span>
									) : (
										<span id="edit">
											{shape.meta.intended_edit as string} <button onClick={handleEditClick}><FiEdit /></button>
										</span>
									)}
								</p>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
})

export type LogType = 'edit' | 'exit-edit' | 'compile' | 'compiled-result' | 'compiled-error'
	| 'generate-param' | 'generate-code' | 'generate-error' | 'switch-task' | 'end-interpretation' | 'brush' | 
	'commit-change' | 'remove-shape' | 'edit-interpretation' | 'start-interpretation' | 'accept-changes' | 'reject-changes'
export interface LogEvent {
	type: LogType
	userId: string
	taskId: string
	timestamp: number
	data?: any
	createdAt?: any
}

interface RecognitionHistory {
	updatedBy: string;
	updatedAt: number;
	shape: string;
	annotated_text?: string;
	location?: number[];
	intended_edit?: string;
	contained_shapes: string[];
	original_code?: string;
	code_edit?: string;
}

interface RecognitionHistoriesProps {
	histories: Map<string, RecognitionHistory>;
}

const RecognitionHistories: React.FC<RecognitionHistoriesProps> = ({ histories }) => {
	return (
		<div className="recognition-histories">
			<h2>Recognition Histories</h2>
			<table>
				<thead>
					<tr>
						<th>Shape</th>
						<th>Annotated Text</th>
						<th>Intended Edit</th>
						<th>Updated At</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{Array.from(histories.entries()).map(([id, history]) => (
						<tr key={id}>
							<td>{history.shape}</td>
							<td>{history.annotated_text}</td>
							<td>{history.intended_edit}</td>
							<td>{new Date(history.updatedAt).toLocaleString()}</td>
							<td>
								<button>Edit</button>
								<button>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};


const newShapeId = createShapeId() as TLShapeId
export default function App() {
	const [currentTask, setCurrentTask] = useState<Task | null>(null);
	const taskId = useRef<string | null>(null);
	const userId = useRef<string | null>(null);

	const [events, setEvents] = useState<any[]>([])
	const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	const lastEventType = useRef<string | null>(null);

	const [recogHistory, setRecogHistory] = useState<Map<string, any>>(new Map());

	const editorRef = useRef<Editor | null>(null);

	const handleEvent = useCallback(async (data: TLEventInfo, editor: Editor) => {
		// const newEvents = events.slice(0, 100)
		// if (
		// 	newEvents[newEvents.length - 1] &&
		// 	newEvents[newEvents.length - 1].type === 'pointer' &&
		// 	data.type === 'pointer' &&
		// 	data.target === 'canvas'
		// ) {
		// 	newEvents[newEvents.length - 1] = data
		// } else {
		// 	newEvents.unshift(data)
		// }
		// setEvents(newEvents)
		// console.log('events', data)
		if (data.type === 'wheel') {
			// only allow vertical scrolling
			if (Math.abs(data.delta.x) !== 0) {
				editor.setCamera({
					x: 0,
					y: editor.getCamera().y,
					z: editor.getCamera().z,
				})
			}
		}

		if (data.type === 'pointer' && editor.getCurrentToolId() === 'draw') {
			if (data.name === 'pointer_move') {
				lastEventType.current = 'pointer_move';
			} else if (data.name === 'pointer_up' && lastEventType.current === 'pointer_move') {
				if (debounceTimer.current) clearTimeout(debounceTimer.current);

				debounceTimer.current = setTimeout(async () => {
					const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
					if (!apiKey) throw Error('Make sure the input includes your API Key!');
					setIsInterpreting(true);
					await interpretShapes(editor, apiKey, newShapeId, handleStoreLog).then(() => {
						// handleStoreLog({ type: 'interpret-shape', data: { shapeId: newShapeId } });
						setIsInterpreting(false);

						const allShapes = editor.getCurrentPageShapes();
						const shapesWithRecognizedShape = allShapes.filter((shape) =>
							shape.meta.shape && (shape.meta.shape as string).length > 0 &&
							shape.meta.contained_shapes &&
							(shape.meta.contained_shapes as string[]).length > 0);

						const currentRecogHistory = recogHistory || new Map<string, any>();
						shapesWithRecognizedShape.forEach((shape) => {
							if (!currentRecogHistory.has(shape.id)) {
								currentRecogHistory.set(shape.id, shape.meta);
							}
							else {
								const existingMeta = currentRecogHistory.get(shape.id);
								currentRecogHistory.set(shape.id, { ...existingMeta, ...shape.meta });
							}
						});

						setRecogHistory(new Map(currentRecogHistory));
					});
				}, 2000); // Wait for 2 seconds
			}

			if (data.name === 'pointer_up') lastEventType.current = null;
		}
	}, [events, setEvents]);

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

	// useEffect(() => {
	// 	if (recogHistory.size > 0) {
	// 		console.log('recogHistory', recogHistory);
	// 	}
	// }, [recogHistory]);

	const handleTaskChange = (task: Task) => {
		taskId.current = task.id;
		setCurrentTask(task);
	};

	const handleManualCodeChange = async (code: string, editor: Editor) => {
		// update recogHistory with the new code
		const allShapes = editor.getCurrentPageShapes();
		const shapesWithRecognizedShape = allShapes.filter((shape) =>
			shape.meta.shape && (shape.meta.shape as string).length > 0 &&
			shape.meta.contained_shapes &&
			(shape.meta.contained_shapes as string[]).length > 0);

		const currentRecogHistory = recogHistory || new Map<string, any>();
		shapesWithRecognizedShape.forEach((shape) => {
			if (!currentRecogHistory.has(shape.id)) {
				currentRecogHistory.set(shape.id, shape.meta);
			}
			else {
				const existingMeta = currentRecogHistory.get(shape.id);
				currentRecogHistory.set(shape.id, { ...existingMeta, ...shape.meta });
			}
		});

		setRecogHistory(new Map(currentRecogHistory));
	}

	const handleStoreLog = async (log: any) => {
		// console.log('log', log, userId.current, taskId.current);
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

	const handleSelectBrush = (brush: ControlBrusheType) => {
		editorRef.current?.setCurrentTool('draw', { color: 'red' });
		console.log(editorRef.current?.getCurrentTool())
		// const availableBrushes = [
		// 	{ type: 'reference', description: 'Reference', icon: <IoLinkOutline />, color: 'rgb(66, 99, 235)', dataId: 'style.color.blue' },
		// 	{ type: 'delete', description: 'Delete', icon: <FaDeleteLeft />, color: 'rgb(247, 103, 7)', dataId: 'style.color.orange' },
		// 	{ type: 'add', description: 'Add', icon: <IoAddCircle />, color: 'rgb(77, 171, 247)', dataId: 'style.color.light-blue' },
		// 	{ type: 'replace', description: 'Replace', icon: <VscReplace />, color: 'rgb(255, 192, 120)', dataId: 'style.color.yellow' },
		// ];
		const button = document.querySelector(`button[data-testid="${availableBrushes.find(b => b.type === brush)?.dataId}"]`) as HTMLButtonElement;
		if (button) {
			button.click();
		} else {
			console.log('Button not found');
		}
	}


	return (
		<div className="editor">
			<Tldraw
				persistenceKey="make-real"
				shareZone={<ShareButtonGroup
					codeShapeId={newShapeId}
					onTaskChange={handleTaskChange}
					onStoreLog={handleStoreLog}
					onBrushSelect={handleSelectBrush}
					isInterpreting={isInterpreting}
				/>}
				shapeUtils={shapeUtils}
				// components={components}
				onMount={(editor) => {
					editorRef.current = editor;
					editor.on('event', (event) => handleEvent(event, editor));

					editor.getInitialMetaForShape = (_shape) => {
						return {
							updatedBy: editor.user.getId(),
							updatedAt: Date.now(),
						}
					}
					editor.sideEffects.registerBeforeChangeHandler('shape', (_prev, next, source) => {
						if (source !== 'user') return next

						return {
							...next,
							meta: {
								...next.meta,
								updatedBy: editor.user.getId(),
								updatedAt: Date.now(),
							},
						}
					})
				}}
			>
				<InsideOfContext {...{ newShapeId, currentTask, onManualCodeChange: handleManualCodeChange }} />
				<MetaUiHelper onStoreLog={handleStoreLog} codeShapeId={newShapeId} />
				{/* <RecognitionHistories histories={recogHistory} /> */}
				<LockCodeEditorButton codeShapeId={newShapeId} onStoreLog={handleStoreLog} />
			</Tldraw>
		</div>
	)
}