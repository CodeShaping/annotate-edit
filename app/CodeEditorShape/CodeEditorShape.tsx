/* eslint-disable react-hooks/rules-of-hooks */
import {
    BaseBoxShapeUtil,
    TLBaseShape,
    SvgExportContext,
    useIsEditing,
    useValue,
    Vec,
} from '@tldraw/tldraw'

import { RecordProps, T } from 'tldraw'
// import CodeMirrorMerge, { CodeMirrorMergeProps } from 'react-codemirror-merge';

import CodeMirror, { EditorView, EditorState, type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
// import * as JsDiff from "diff";
// import { unifiedMergeView, updateOriginalDoc } from '@codemirror/merge';
// import { createTheme } from '@uiw/codemirror-themes';
// const Original = CodeMirrorMerge.Original;
// const Modified = CodeMirrorMerge.Modified;

export type CodeEditorShape = TLBaseShape<
    'code-editor-shape',
    {
        w: number
        h: number
        code: string
        prevCode: string
        res: string
    }
>

export class CodeEditorShapeUtil extends BaseBoxShapeUtil<CodeEditorShape> {
    static override type = 'code-editor-shape' as const

    static override props: RecordProps<CodeEditorShape> = {
        w: T.number,
        h: T.number,
        code: T.string,
        prevCode: T.string,
        res: T.string,
    }

    getDefaultProps(): CodeEditorShape['props'] {
        return {
            w: 400,
            h: 300,
            code: '',
            prevCode: '',
            res: '1243',
        }
    }

    override canEdit = () => true
    override isAspectRatioLocked = () => false
    override canResize = () => true
    override canBind = () => false
    override canUnmount = () => false
    override hideSelectionBoundsFg = () => true
    override hideSelectionBoundsBg = () => true
    override canScroll = () => true
    override canSnap = () => true


    override component(shape: CodeEditorShape) {
        const isEditing = useIsEditing(shape.id)

        const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null)
        const extensions = [
            python(),
            javascript(),
        ]

        const boxShadow = useValue(
            'box shadow',
            () => {
                const rotation = this.editor.getShapePageTransform(shape)!.rotation()
                return getRotatedBoxShadow(rotation)
            },
            [this.editor]
        )

        useEffect(() => {
            const view = codeMirrorRef.current?.view
            // console.log('editor', view?.contentHeight, view?.defaultLineHeight, state?.doc.lines)
            this.editor.updateShape<CodeEditorShape>({
                id: shape.id,
                type: 'code-editor-shape',
                props: {
                    ...shape.props,
                    h: Math.max(window.innerHeight, (view?.contentHeight || shape.props.h))
                }
            })
            if (isEditing) {
                codeMirrorRef.current?.view?.focus();
            }
        }, [isEditing])

        useEffect(() => {
            console.log('shape.props.code', shape.props.code)
            // update the height
            const view = codeMirrorRef.current?.view
            this.editor.updateShape<CodeEditorShape>({
                id: shape.id,
                type: 'code-editor-shape',
                props: {
                    ...shape.props,
                    h: Math.max(window.innerHeight, (view?.contentHeight || shape.props.h))
                }
            })
        }, [shape.props.code])


        function handleShowResult() {
            const editor = document.getElementById(`editor-${shape.id}`);
            codeMirrorRef.current?.view?.focus();
            const resultView = document.getElementById('result-view');
            if (resultView?.style.width === '15px') {
                if (editor) {
                    editor.style.width = `${shape.props.w / 1.5}px`;
                }
                if (resultView) {
                    resultView.style.width = shape.props.w - (shape.props.w / 1.5) + 'px';
                }
                return;
            } else {
                if (editor) {
                    editor.style.width = `${shape.props.w - 20}px`;
                }

                if (resultView) {
                    resultView.style.width = '15px';
                }
            }
        }


        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return (
            <div
                style={{
                    touchAction: isTouchDevice ? 'auto' : 'none',
                    pointerEvents: isEditing ? 'auto' : 'none',
                    // display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    minHeight: `${shape.props.h}px`,
                }}
            >
                <div
                    style={{ flexGrow: 1, position: 'relative', zIndex: 1 }}
                >
                    <CodeMirror
                        id={`editor-${shape.id}`}
                        ref={codeMirrorRef}
                        value={shape.props.code}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                            fontSize: '18px',
                            pointerEvents: isEditing ? 'auto' : 'none',
                            touchAction: isEditing || isTouchDevice ? 'auto' : 'none',
                            // boxShadow,
                            border: '1px solid var(--color-panel-contrast)',
                            borderRadius: 'var(--radius-2)',
                            backgroundColor: 'var(--color-background)',
                            width: `${shape.props.w - 15}px`,
                        }}
                        onTouchStart={(e) => { e.preventDefault(); return; }}
                        extensions={[...extensions]}
                        // maxWidth={`${shape.props.w}px`}
                        height={`${shape.props.h}px`}
                        editable={true}
                        onChange={(value) => {
                            this.editor.updateShape<CodeEditorShape>({
                                id: shape.id,
                                type: 'code-editor-shape',
                                props: {
                                    ...shape.props,
                                    code: value
                                }
                            })
                        }}
                    />
                </div>
                <div id="resizer" style={{
                    width: '15px',
                    height: '100vh',
                    backgroundColor: '#ccc',
                }}
                    onMouseDown={(e) => { handleShowResult(); e.stopPropagation(); }}
                    onPointerDown={(e) => { handleShowResult(); e.stopPropagation(); }}
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />
                {shape.props.res && (
                    <div id="result-view" style={{
                        flexGrow: 1,
                        overflow: 'auto',
                        borderLeft: '1px solid #ccc',
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: shape.props.res }}></div>
                    </div>
                )}
            </div>
        )
    }

    override async toSvg(shape: CodeEditorShape, _ctx: SvgExportContext): Promise<SVGElement> {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        const screenShot = await html2canvas(document.getElementById(`editor-${shape.id}`) as HTMLElement, { useCORS: true }).then(function (canvas) {
            const data = canvas.toDataURL('image/png');
            return data;
        });

        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', screenShot)
        image.setAttribute('width', (shape.props.w).toString())
        image.setAttribute('height', (shape.props.h).toString())
        g.appendChild(image)

        return g
    }

    // override onClick: TLOnEditEndHandler<CodeEditorShape> = (shape) => {
    //     console.log('onClick', shape)
    //     this.editor.setEditingShape(shape.id)
    // }

    // override onEditEnd: TLOnEditEndHandler<CodeEditorShape> = (shape) => {
    //     this.editor.updateShape<CodeEditorShape>({
    //         id: shape.id,
    //         type: 'code-editor-shape',
    //         isLocked: true,
    //         props: {
    //             ...shape.props,
    //             prevCode: shape.props.code,
    //             h: height,
    //             w: window.innerWidth,
    //         },
    //     })
    // }

    indicator(shape: CodeEditorShape) {
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