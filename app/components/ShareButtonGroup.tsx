import { MakeRealButton } from "./MakeRealButton";
import { ExecuteCodeButton } from "./ExecuteCodeButton";
import { LockCodeEditorButton } from "./LockCodeEditorButton";
import { TLShapeId } from '@tldraw/tldraw'

// props: codeShapeId
export function ShareButtonGroup({ codeShapeId }: { codeShapeId: TLShapeId }) {
    return (
        <div className="shareButtonGroup">
            <LockCodeEditorButton codeShapeId={codeShapeId} />
            <MakeRealButton codeShapeId={codeShapeId} />
            <ExecuteCodeButton />
        </div>
    )
}