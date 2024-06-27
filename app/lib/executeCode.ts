import {
    Editor, createShapeId, TLBaseShape, TLImageShape, TLTextShape,
    AssetRecordType, type TLShapeId
} from '@tldraw/tldraw'
import { getSelectionAsText } from './getSelectionAsText'
import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
//@ts-ignore
import * as xPython from '@x-python/core'
import { downloadDataURLAsFile } from './downloadDataUrlAsFile';
import { PreviewShape } from '../PreviewShape/PreviewShape';
// import { writeFileSync } from 'fs';
// import { promisify } from 'util';

// const writeFileSyncAsync = promisify(writeFileSync)


export type CodeExecResultType = "image" | "text" | "table";
export interface CodeExecReturnValue {
    result: string | null;
    error: string | null;
    stdout: string | null;
    stderr: string | null;
    type: CodeExecResultType;
}

const packages = {
    official: ["pandas", "matplotlib", "numpy", "scipy"],
    micropip: ["seaborn", "scikit-learn"],
};
const matplotlibCode = `import os
import base64
from io import BytesIO\n
# Set this _before_ importing matplotlib
os.environ['MPLBACKEND'] = 'AGG'\n
import matplotlib.pyplot as plt\n
# Patch
def ensure_matplotlib_patch():
  _old_show = plt.show\n
  def show():
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    # Encode to a base64 str
    img = 'data:image/png;base64,' + \\
    base64.b64encode(buf.read()).decode('utf-8')
    # Write to stdout
    print(img)
    plt.clf()\n
  plt.show = show\n\n
ensure_matplotlib_patch()\n
`;

function tableToHtml(output: string, id: TLShapeId, className: string): string {
    const lines = output.split("\n");
    let html = `<style>
        .${className} {
            width: 100%;
            text-align: left;
            color: #718096;
            border-collapse: collapse;
            border-radius: 15px;
            overflow: hidden;
        }

        .${className} thead {
            font-size: 12px;
            color: #4a5568;
            background-color: #f7fafc;
        }

        .${className} thead th {
            padding: 12px 15px;
        }

        .${className} tbody {
            background-color: #fff;
        }

        .${className} tbody tr {
            color: #718096;
            border-bottom: 1px solid #e2e8f0;
        }

        .${className} tbody tr:hover {
            background-color: #f7fafc;
        }

        .${className} tbody td {
            padding: 12px 15px;
        }
        </style>`;

    html += `<table id="${id}" class="${className}">`;

    // Header, add a blank cell to the start
    const headers = lines[0].split(/\s{2,}/);
    html += "<thead>";
    html += "<tr>";
    html += "<th ></th>";
    for (const header of headers) {
        html += `<th >${header}</th>`;
    }
    html += "</tr>";

    // Rows
    html += "</thead>";
    html += "<tbody>";
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(/\s{2,}/);
        html += "<tr>";
        for (const column of columns) {
            html += `<td>${column}</td>`;
        }
        html += "</tr>";
    }
    html += "</tbody>";

    html += "</table>";

    return html;
}

const codeRefactoring = async (code: string): Promise<string> => {
    let lines = code.split("\n");
    let lastLineIndex = lines.length - 1;

    // Find the last non-empty line
    while (lastLineIndex >= 0 && lines[lastLineIndex].trim() === '') {
        lastLineIndex--;
    }

    if (lastLineIndex < 0) {
        return code;
    }

    const lastLine = lines[lastLineIndex];

    if (
        code.includes("matplotlib") ||
        code.includes("plt.show") ||
        code.includes("sns")
    ) {
        return `${matplotlibCode}\n${code}`;
    }
    else if (lastLine.includes("df.") && !lastLine.includes("print")) {
        return code.replace(lastLine, `print(${lastLine})`);
    }
    else {
        return code;
    }
};

const installExtraPackages = async (code: string) => {
    if (code.includes("import seaborn") || code.includes("sns")) {
        await xPython.install(["seaborn"]);
    } else if (code.includes("import sklearn") || code.includes("sklearn")) {
        await xPython.install(["scikit-learn"]);
    } else if (code.includes("import keras") || code.includes("keras")) {
        await xPython.install(["keras"]);
    } else if (code.includes("import nltk") || code.includes("nltk")) {
        await xPython.install(["nltk"]);
    } else if (code.includes("import spacy") || code.includes("spacy")) {
        await xPython.install(["spacy"]);
    }
};

const isTable = (result: string): boolean => {
    // detect if the result(string) is a table, and parse it to html
    // example string that contains table: "sepal length (cm)  sepal width (cm)  petal length (cm)  petal width (cm)\n0                5.1               3.5                1.4               0.2\n1                4.9               3.0                1.4               0.2\n2                4.7               3.2                1.3               0.2\n3                4.6               3.1                1.5               0.2\n4                5.0               3.6                1.4               0.2"
    const lines = result.split("\n");
    if (lines.length <= 1) {
        return false;
    }
    const columnsLine1 = lines[0].split(/\s{2,}/);
    const columnsLine2 = lines[1].split(/\s{2,}/);
    const columnsLine3 = lines[2].split(/\s{2,}/);

    return (
        columnsLine1.length === columnsLine2.length - 1 &&
        columnsLine2.length === columnsLine3.length
    );
};

const decideExecResultType = (result: any) => {
    if (result && result.toString().includes("data:image/png;base64")) {
        return "image";
    } else if (result && isTable(result)) {
        return "table";
    } else {
        return "text";
    }
};


export async function executeCode(editor: Editor, codeShapeId: TLShapeId) {
    const selectedShapes = editor.getSelectedShapes()

    if (selectedShapes.length === 0) throw Error('First select something to execute.')
    await xPython.init();


    const { maxX, midY } = editor.getSelectionPageBounds()!
    // const newShapeId = createShapeId()
    // for (const shape of selectedShapes) {
    //     if (shape.type === 'code-editor-shape') {
    //         allSelectedCode += (shape as CodeEditorShape).props.code
    //     }
    // }

    const codeEditorShape = editor.getShape<CodeEditorShape>(codeShapeId)
    if (!codeEditorShape || codeEditorShape.props.code === '') { throw Error('No code to execute.') }

    const allSelectedCode = await codeRefactoring(codeEditorShape.props.code)
    await installExtraPackages(allSelectedCode);

    const { error, stdout, stderr } = (await xPython.exec({
        code: allSelectedCode,
    })) as CodeExecReturnValue;

    if (error) {
        throw Error(error)
    }


    const resultType = decideExecResultType(stdout) as CodeExecResultType;
    // console.log(`resultType: ${resultType}\n\nstdout: ${stdout}\nstderr: ${error || stderr}`);

    let htmlResult = '';
    if (resultType === 'image' && stdout) {
        htmlResult = `<img src="${stdout}" alt="vis-${codeShapeId}" width="300">`
    } else if (resultType === 'table' && stdout) {
        htmlResult = tableToHtml(stdout, codeShapeId, 'exec-res-table')
    } else {
        htmlResult = `<pre>${stdout}</pre>`
    }

    if (htmlResult === '') {
        throw Error('No result to display.')
    }
    console.log(`[Exec]: ${resultType}-${htmlResult}`);

    editor.updateShape<CodeEditorShape>({
        id: codeShapeId,
        type: 'code-editor-shape',
        props: {
            ...codeEditorShape.props,
            res: htmlResult,
        },
    })
}