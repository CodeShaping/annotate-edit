import { MakeRealButton } from "./MakeRealButton";
import { ExecuteCodeButton } from "./ExecuteCodeButton";
import { TLShapeId } from '@tldraw/tldraw'

// props: codeShapeId
export function ShareButtonGroup({ codeShapeId }: { codeShapeId: TLShapeId }) {
    return (
        <div className="shareButtonGroup">
            <MakeRealButton codeShapeId={codeShapeId} />
            <ExecuteCodeButton />
        </div>
    )
}