/* eslint-disable react-hooks/rules-of-hooks */
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	SvgExportContext,
	TLBaseShape,
	Vec,
	stopEventPropagation,
	toDomPrecision,
	useIsEditing,
	useToasts,
	useValue,
} from '@tldraw/tldraw'

export type PreviewShape = TLBaseShape<
	'response',
	{
		html: string
		w: number
		h: number
	}
>

export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'response' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = () => false
	override canResize = () => true
	override canBind = () => false
	// override canUnmount = () => false

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		// Kind of a hack—we're preventing users from pinching-zooming into the iframe
		const htmlToUse = shape.props.html.replace(
			`</body>`,
			`<style>
				body {
					touch-action: none;
				}
			</style>
			<script src="https://unpkg.com/html2canvas"></script><script>
			// send the screenshot to the parent window
  			window.addEventListener('message', function(event) {
    		if (event.data.action === 'take-screenshot' && event.data.shapeid === "${shape.id}") {
      		html2canvas(document.body, {useCors : true}).then(function(canvas) {
        		const data = canvas.toDataURL('image/png');
        		window.parent.postMessage({screenshot: data, shapeid: "${shape.id}"}, "*");
      		});
    		}
  			}, false);
			document.body.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); return }, { passive: false })</script>
</body>`
		)

		return (
			<HTMLContainer
				className="tl-embed-container"
				id={shape.id}
				style={{ touchAction: 'none' }}
				draggable={false}
			>
				{htmlToUse ? (
					<iframe
						id={`iframe-1-${shape.id}`}
						srcDoc={htmlToUse}
						width={toDomPrecision(shape.props.w)}
						height={toDomPrecision(shape.props.h)}
						draggable={false}
						style={{
							touchAction: isEditing ? 'auto' : 'none',
							pointerEvents: isEditing ? 'auto' : 'none',
							boxShadow,
							border: '1px solid var(--color-panel-contrast)',
							borderRadius: 'var(--radius-2)',
						}}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						if (navigator && navigator.clipboard) {
							navigator.clipboard.writeText(shape.props.html)
							toast.addToast({
								icon: 'duplicate',
								title: 'Copied to clipboard',
							})
						}
					}}
					onPointerDown={stopEventPropagation}
				>
					{/* <Icon icon="duplicate" /> */}
				</div>
				{htmlToUse && (
					<div
						style={{
							textAlign: 'center',
							position: 'absolute',
							bottom: isEditing ? -40 : 0,
							padding: 4,
							fontFamily: 'inherit',
							fontSize: 12,
							left: 0,
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							pointerEvents: 'none',
						}}
					>
						<span
							style={{
								background: 'var(--color-panel)',
								padding: '4px 12px',
								borderRadius: 99,
								border: '1px solid var(--color-muted-1)',
							}}
						>
							{isEditing ? 'Click the canvas to exit' : 'Double click to interact'}
						</span>
					</div>
				)}
			</HTMLContainer>
		)
	}

	// override toSvg(shape: PreviewShape, _ctx: SvgExportContext): SVGElement | Promise<SVGElement> {
	// 	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
	// 	// while screenshot is the same as the old one, keep waiting for a new one
	// 	return new Promise((resolve, _) => {
	// 		if (window === undefined) return resolve(g)
	// 		const windowListener = (event: MessageEvent) => {
	// 			if (event.data.screenshot && event.data?.shapeid === shape.id) {
	// 				const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
	// 				image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', event.data.screenshot)
	// 				image.setAttribute('width', shape.props.w.toString())
	// 				image.setAttribute('height', shape.props.h.toString())
	// 				g.appendChild(image)
	// 				window.removeEventListener('message', windowListener)
	// 				clearTimeout(timeOut)
	// 				resolve(g)
	// 			}
	// 		}
	// 		const timeOut = setTimeout(() => {
	// 			resolve(g)
	// 			window.removeEventListener('message', windowListener)
	// 		}, 2000)
	// 		window.addEventListener('message', windowListener)
	// 		//request new screenshot
	// 		const firstLevelIframe = document.getElementById(`iframe-1-${shape.id}`) as HTMLIFrameElement
	// 		if (firstLevelIframe) {
	// 			firstLevelIframe.contentWindow!.postMessage(
	// 				{ action: 'take-screenshot', shapeid: shape.id },
	// 				'*'
	// 			)
	// 		} else {
	// 			console.log('first level iframe not found or not accessible')
	// 		}
	// 	})
	// }

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

function getRotatedBoxShadow(rotation: number) {
	const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
		const { offsetX, offsetY, blur, spread, color } = shadow
		const vec = new Vec(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}

const ROTATING_BOX_SHADOWS = [
	{
		offsetX: 0,
		offsetY: 2,
		blur: 4,
		spread: -1,
		color: '#0000003a',
	},
	{
		offsetX: 0,
		offsetY: 3,
		blur: 12,
		spread: -2,
		color: '#0000001f',
	},
]
