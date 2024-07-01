import { MakeRealButton } from "./MakeRealButton";
import { ExecuteCodeButton } from "./ExecuteCodeButton";
import { LockCodeEditorButton } from "./LockCodeEditorButton";
import { TLShapeId } from '@tldraw/tldraw'
import { TaskSelector } from "./TaskSelector";

// props: codeShapeId
export function ShareButtonGroup({ 
    codeShapeId,
    onTaskChange,
    onStoreLog
 }: { 
    codeShapeId: TLShapeId,
    onTaskChange: (selectedTask: any) => void,
    onStoreLog: (log: any) => void
 }) {
    return (
        <div className="shareButtonGroup">
            <TaskSelector onTaskChange={onTaskChange} />
            <LockCodeEditorButton codeShapeId={codeShapeId} onStoreLog={onStoreLog} />
            <ExecuteCodeButton codeShapeId={codeShapeId} onStoreLog={onStoreLog} />
            <MakeRealButton codeShapeId={codeShapeId} onStoreLog={onStoreLog} />
        </div>
    )
}