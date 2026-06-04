import OpenAI from 'openai'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import {
	OPENAI_USER_PROMPT,
	OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN,
	OPEN_AI_SYSTEM_PROMPT,
} from '../prompt'

export async function getHtmlFromOpenAI({
	image,
	apiKey,
	text,
	grid,
	theme = 'light',
	previousPreviews = [],
}: {
	image: string
	apiKey: string
	text: string
	theme?: string
	grid?: {
		color: string
		size: number
		labels: boolean
	}
	previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	// Client-side demo app; apiKey is user-supplied at runtime, mirroring the prior raw-fetch Authorization header pattern.
	const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

	const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: OPEN_AI_SYSTEM_PROMPT,
		},
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[1].content as OpenAI.Chat.ChatCompletionContentPart[]

	userContent.push({
		type: 'text',
		text:
			previousPreviews?.length > 0 ? OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN : OPENAI_USER_PROMPT,
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
			text: `Here's a list of text that we found in the design:\n${text}`,
		})
	}

	if (grid) {
		userContent.push({
			type: 'text',
			text: `The designs have a ${grid.color} grid overlaid on top. Each cell of the grid is ${grid.size}x${grid.size}px.`,
		})
	}

	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		userContent.push(
			{
				type: 'text',
				text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
			},
			{
				type: 'text',
				text: `And here's the HTML you came up with for it: ${preview.props.html}`,
			}
		)
	}

	userContent.push({
		type: 'text',
		text: `Please make your result use the ${theme} theme.`,
	})

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
