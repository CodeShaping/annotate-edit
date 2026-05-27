import OpenAI from 'openai'
import { CodeEditorShape } from '../CodeEditorShape/CodeEditorShape'
import {
    OPENAI_INTERPRETATION_SKETCH_PROMPT,
    OPENAI_USER_INTERPRETATION_SKETCH_PROMPT,
} from '../prompt'

export async function getInterpretationFromAI({
    image,
    apiKey,
    text,
    grid,
    codeEditorShape,
}: {
    image: string
    apiKey: string
    text: string
    grid?: {
    	color: string
    	size: number
    	labels: boolean
    }
    codeEditorShape: CodeEditorShape
}) {
    if (!apiKey) throw Error('You need to provide an API key (sorry)')

    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: OPENAI_INTERPRETATION_SKETCH_PROMPT,
        },
        {
            role: 'user',
            content: [],
        },
    ]

    const userContent = messages[1].content as OpenAI.Chat.ChatCompletionContentPart[]

    userContent.push({
        type: 'text',
        text: OPENAI_USER_INTERPRETATION_SKETCH_PROMPT,
    })

    userContent.push({
        type: 'image_url',
        image_url: {
            url: image,
            detail: 'high',
        },
    })

    if (text) {
        userContent.push({
            type: 'text',
            text: `Here's a list of text that we found in the annotations:\n${text}`,
        })
    }

    userContent.push(
        {
            type: 'text',
            text: `And here's the code that user annotated with: ${codeEditorShape.props.code}`,
        }
    )

    try {
        return await client.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 4096,
            temperature: 1,
            messages,
            seed: 42,
            n: 1,
        })
    } catch (e: any) {
        throw Error(`Could not contact OpenAI: ${e.message}`)
    }
}
