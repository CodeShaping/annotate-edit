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

import CodeMirror, { EditorView, EditorState, type ReactCodeMirrorRef} from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
// import * as JsDiff from "diff";
import { unifiedMergeView, updateOriginalDoc } from '@codemirror/merge';
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
            res: '',
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
        const startPosition = useRef<number | null>(null)

        const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null)
        const extensions = [
            python(),
            javascript(),
            unifiedMergeView({
                original: shape.props.prevCode,
                syntaxHighlightDeletions: false,
                mergeControls: true
            }),
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
                // set to the current edit position
                // const cursor = codeMirrorRef.current?.view?.state.selection.main.head
                // if (cursor) {
                //     codeMirrorRef.current?.view?.dispatch({ selection: { anchor: cursor, head: cursor } })
                // }
            }
        }, [isEditing])

        useEffect(() => {
            const view = codeMirrorRef.current?.view
            // console.log('shape.props.code', shape.props.code, view?.contentHeight)
            this.editor.updateShape<CodeEditorShape>({
                id: shape.id,
                type: 'code-editor-shape',
                isLocked: false,
                props: {
                    ...shape.props,
                    // h: Math.max(window.innerHeight, (view?.contentHeight || shape.props.h))
                    h: view?.contentHeight || shape.props.h
                }
            })

            this.editor.updateShape<CodeEditorShape>({
                id: shape.id,
                type: 'code-editor-shape',
                isLocked: true,
            })

        }, [shape.props.code])


        // function handleShowResult() {
        //     const editor = document.getElementById(`editor-${shape.id}`);
        //     codeMirrorRef.current?.view?.focus();
        //     const resultView = document.getElementById('result-view');
        //     if (resultView?.style.height === '15px') {
        //         if (editor) {
        //             editor.style.height = `${shape.props.h / 1.5}px`;
        //         }
        //         if (resultView) {
        //             resultView.style.height = shape.props.h - (shape.props.h / 1.5) + 'px';
        //         }
        //         return;
        //     } else {
        //         if (editor) {
        //             editor.style.height = `${shape.props.h - 20}px`;
        //         }

        //         if (resultView) {
        //             resultView.style.height = '15px';
        //         }
        //     }
        // }

        // useEffect(() => {
        //     if (shape.props.res && shape.props.res !== '') {
        //         handleShowResult();
        //     }
        // }, [shape.props.res])


        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
            // set cursor to the location of the touch
            const touch = e.touches[0];
            const editorView = codeMirrorRef.current?.view;
            if (editorView) {
                const pos = editorView.posAtCoords({ x: touch.clientX, y: touch.clientY });
                if (pos) {
                    editorView.dispatch({ selection: { anchor: pos, head: pos } });
                }
                startPosition.current = editorView.posAtCoords({ x: touch.clientX, y: touch.clientY }) || 0;
            }
            e.stopPropagation();
            return;
        }

        const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
            // select code while moving
            const touch = e.touches[0];
            const editorView = codeMirrorRef.current?.view;
            if (editorView) {
                const pos = editorView.posAtCoords({ x: touch.clientX, y: touch.clientY });
                if (pos && startPosition.current) {
                    editorView.dispatch({ selection: { anchor: startPosition.current, head: pos } });
                }
            }
            return;
        }

        const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
            startPosition.current = null;
            e.stopPropagation();
        };

        return (
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    touchAction: isTouchDevice ? 'auto' : 'none',
                    pointerEvents: isEditing ? 'auto' : 'none',
                    // display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    alignItems: 'center',
                    // display: 'flex',
                    // flexDirection: 'column',
                    position: 'relative',
                    minHeight: `${shape.props.h}px`
                }}
            >
                <div
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <CodeMirror
                        id={`editor-${shape.id}`}
                        ref={codeMirrorRef}
                        value={shape.props.code}
                        // onPointerDown={(e) => e.stopPropagation()}
                        style={{
                            fontSize: '18px',
                            // pointerEvents: isEditing ? 'auto' : 'none',
                            // touchAction: isEditing || isTouchDevice ? 'auto' : 'none',
                            // boxShadow,
                            border: '1px solid var(--color-panel-contrast)',
                            borderRadius: 'var(--radius-2)',
                            backgroundColor: 'var(--color-background)',
                            width: `${shape.props.w}px`,
                            height: `${shape.props.h + 10}px`
                        }}
                        // onTouchStart={(e) => { e.preventDefault(); return; }}
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
                {shape.props.res && (
                    <div id="result-view" style={{
                        width: '100%',
                        minHeight: '20vh',
                        maxHeight: '60vh',
                        overflow: 'auto',
                        borderTop: '5px solid #ccc',
                        fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                        backgroundColor: 'rgb(248 248 248)',
                        color: '#000',
                        padding: '20px',
                        boxSizing: 'border-box',
                        zIndex: 10,
                        whiteSpace: 'pre-wrap'
                    }}
                        contentEditable={false}
                        tabIndex={-1}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); return; }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); return; }}
                        onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); return; }}
                    // onPointerDown={(e) => { handleShowResult(); e.stopPropagation(); }}
                    // onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
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

        // Create an SVG filter for grayscale
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'grayscale-filter');

        const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrix.setAttribute('type', 'matrix');
        feColorMatrix.setAttribute('values', '0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0');
        filter.appendChild(feColorMatrix);
        g.appendChild(filter);

        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', screenShot)
        image.setAttribute('width', (shape.props.w).toString())
        image.setAttribute('height', (shape.props.h).toString())
        image.setAttribute('filter', 'url(#grayscale-filter)')
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