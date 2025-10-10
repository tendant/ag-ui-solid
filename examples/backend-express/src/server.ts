import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: req.headers['x-model'] as string || 'gpt-3.5-turbo',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);

    if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else if (error.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Chat endpoint with function calling
app.post('/api/chat/tools', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get the current weather for a location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state, e.g. San Francisco, CA'
                },
                unit: {
                  type: 'string',
                  enum: ['celsius', 'fahrenheit'],
                  description: 'The temperature unit'
                }
              },
              required: ['location']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'search_web',
            description: 'Search the web for information',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query'
                }
              },
              required: ['query']
            }
          }
        }
      ]
    });

    const message = completion.choices[0].message;

    // Handle function calls
    if (message.tool_calls) {
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          let output = '';

          // Execute the function
          if (toolCall.function.name === 'get_weather') {
            output = `The weather in ${args.location} is sunny and 72°F`;
          } else if (toolCall.function.name === 'search_web') {
            output = `Found 10 results for "${args.query}"`;
          }

          return {
            id: toolCall.id,
            toolName: toolCall.function.name,
            input: args,
            output: output,
            status: 'success',
            timestamp: new Date().toISOString()
          };
        })
      );

      res.json({
        content: message.content || 'Processing your request...',
        toolResults
      });
    } else {
      res.json({
        content: message.content,
        toolResults: []
      });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock endpoint (for testing without API key)
app.post('/api/chat/mock', async (req, res) => {
  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1];

    // Set streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Simulate streaming response
    const response = `You said: "${lastMessage.content}". This is a mock response for testing.`;
    const words = response.split(' ');

    for (const word of words) {
      res.write(word + ' ');
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.end();
  } catch (error) {
    console.error('Mock chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/chat - Streaming chat`);
  console.log(`   POST /api/chat/tools - Chat with function calling`);
  console.log(`   POST /api/chat/mock - Mock endpoint for testing`);
  console.log(`   GET  /health - Health check`);
});
