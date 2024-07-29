import { GenerateCodeButton } from "./GenerateCodeButton";
import { ExecuteCodeButton } from "./ExecuteCodeButton";
import { LockCodeEditorButton } from "./LockCodeEditorButton";
import { TLShapeId } from '@tldraw/tldraw'
import { TaskSelector } from "./TaskSelector";

// props: codeShapeId
export function ShareButtonGroup({ 
    codeShapeId,
    onTaskChange,
    onStoreLog,
    isInterpreting
 }: { 
    codeShapeId: TLShapeId,
    onTaskChange: (selectedTask: any) => void,
    onStoreLog: (log: any) => void,
    isInterpreting: boolean
 }) {
    return (
        <div className="shareButtonGroup">
            {isInterpreting && <span>Thinking...</span>}
            <TaskSelector onTaskChange={onTaskChange} onStoreLog={onStoreLog} />
            <LockCodeEditorButton codeShapeId={codeShapeId} onStoreLog={onStoreLog} />
            <ExecuteCodeButton codeShapeId={codeShapeId} onStoreLog={onStoreLog} />
            <GenerateCodeButton codeShapeId={codeShapeId} onStoreLog={onStoreLog} />
        </div>
    )
}