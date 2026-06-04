import OpenAI from 'openai'
import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
import {
    OPENAI_MAKE_CODE_PROMPT,
    OPENAI_USER_MAKE_CODE_PROMPT,
    OPENAI_EDIT_PARTIAL_CODE_PROMPT,
    OPENAI_USER_EDIT_PARTIAL_CODE_PROMPT,
} from '../prompt'

export async function getCodeFromOpenAI({
    interpretation,
    image,
    apiKey,
    text,
    grid,
    previousCodeEditors = [],
    intended_edit,
}: {
    interpretation: string
    image: string
    apiKey: string
    text: string
    grid?: {
        color: string
        size: number
        labels: boolean
    }
    previousCodeEditors?: CodeEditorShape[]
    intended_edit?: string
}) {
    if (!apiKey) throw Error('You need to provide an API key (sorry)')

    // Client-side demo app; apiKey is user-supplied at runtime, mirroring the prior raw-fetch Authorization header pattern.
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: intended_edit?.length ? OPENAI_EDIT_PARTIAL_CODE_PROMPT : OPENAI_MAKE_CODE_PROMPT,
        },
        {
            role: 'user',
            content: [],
        },
    ]

    const userContent = messages[1].content as OpenAI.Chat.ChatCompletionContentPart[]

    userContent.push({
        type: 'text',
        text: intended_edit?.length ? OPENAI_USER_EDIT_PARTIAL_CODE_PROMPT : OPENAI_USER_MAKE_CODE_PROMPT,
    })

    userContent.push({
        type: 'image_url',
        image_url: {
            url: image,
            detail: 'high',
        },
    })

    if (interpretation) {
        userContent.push({
            type: 'text',
            text: `The user specified following action to take: "${interpretation}"`,
        })
    }

    if (text) {
        userContent.push({
            type: 'text',
            text: `Here's a list of text that we found in the annotations:\n${text}`,
        })
    }

    if (grid) {
        userContent.push({
            type: 'text',
            text: `The user have a ${grid.color} grid overlaid on top. Each cell of the grid is ${grid.size}x${grid.size}px.`,
        })
    }

    for (let i = 0; i < previousCodeEditors.length; i++) {
        const preview = previousCodeEditors[i]
        userContent.push({
            type: 'text',
            text: `The users also included the code in the code editor:\n${preview.props.code}`,
        })
    }

    if (intended_edit?.length) {
        userContent.push({
            type: 'text',
            text: `The user intended to edit the code to: "${intended_edit}"`,
        })
    }

    try {
        return await client.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 4096,
            temperature: 0,
            messages,
            seed: 42,
            n: 1,
        })
    } catch (e: any) {
        throw Error(`Could not contact OpenAI: ${e.message}`)
    }
}
