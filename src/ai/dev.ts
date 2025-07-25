import { config } from 'dotenv';
config();

import '@/ai/flows/compose-email.ts';
import '@/ai/flows/chatbot.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/summarize-text.ts';