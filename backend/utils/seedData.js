/**
 * Seed questions for Round 1: AI tools & trending technology.
 * Each question has exactly one correct answer (correctAnswer = option key).
 * Verified factual questions as of 2024-2025.
 */
const round1Questions = [
  {
    round: 1, type: 'mcq', order: 1,
    questionText: 'Which of these is an example of AI being used in everyday life?',
    options: [
      { key: 'A', text: 'Digital clock' },
      { key: 'B', text: 'Calculator' },
      { key: 'C', text: 'YouTube recommendations' },
      { key: 'D', text: 'USB drive' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 2,
    questionText: 'Which technology allows a computer to understand and process human language?',
    options: [
      { key: 'A', text: 'NLP' },
      { key: 'B', text: 'Speech Synthesis' },
      { key: 'C', text: 'ML' },
      { key: 'D', text: 'GUI' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 3,
    questionText: 'Which term describes AI systems that can create new content?',
    options: [
      { key: 'A', text: 'Generative AI' },
      { key: 'B', text: 'Computer networking' },
      { key: 'C', text: 'Predictive coding' },
      { key: 'D', text: 'Data mining' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 4,
    questionText: 'What is the main idea behind machine learning?',
    options: [
      { key: 'A', text: 'Writing a separate rule for every possible input' },
      { key: 'B', text: 'Learning patterns from examples to make predictions or decisions' },
      { key: 'C', text: 'Increasing the processing speed of a computer' },
      { key: 'D', text: 'Storing large amounts of information for later retrieval' },
    ],
    correctAnswer: 'B', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 5,
    questionText: 'What is the primary purpose of a chatbot?',
    options: [
      { key: 'A', text: 'To automatically repair software errors' },
      { key: 'B', text: 'To convert source code into machine code' },
      { key: 'C', text: 'To interact with users through conversation' },
      { key: 'D', text: 'To manage the physical components of a computer' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 6,
    questionText: 'Which company developed ChatGPT?',
    options: [
      { key: 'A', text: 'Google' },
      { key: 'B', text: 'Microsoft' },
      { key: 'C', text: 'META' },
      { key: 'D', text: 'OpenAI' },
    ],
    correctAnswer: 'D', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 7,
    questionText: 'Which of these is least likely to require AI?',
    options: [
      { key: 'A', text: 'Face recognition on a smartphone' },
      { key: 'B', text: 'Movie recommendations on a streaming platform' },
      { key: 'C', text: 'A digital clock showing the current time' },
      { key: 'D', text: 'A spam filter classifying emails' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 8,
    questionText: 'Which AI field is most directly involved in analyzing photographs?',
    options: [
      { key: 'A', text: 'Computer Vision' },
      { key: 'B', text: 'Natural Language Processing' },
      { key: 'C', text: 'Reinforcement Learning' },
      { key: 'D', text: 'Knowledge Representation' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 9,
    questionText: 'Which is a practical advantage of using AI?',
    options: [
      { key: 'A', text: 'It can automate repetitive tasks' },
      { key: 'B', text: 'It eliminates the need for human decisions' },
      { key: 'C', text: 'It guarantees error-free results' },
      { key: 'D', text: 'It can understand every situation like a human' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 10,
    questionText: 'What does a machine learning model primarily learn from?',
    options: [
      { key: 'A', text: 'The processor architecture' },
      { key: 'B', text: 'The programming language used to build it' },
      { key: 'C', text: 'The amount of RAM in the computer' },
      { key: 'D', text: 'Patterns present in the training data' },
    ],
    correctAnswer: 'D', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 11,
    questionText: 'Who founded OpenAI?',
    options: [
      { key: 'A', text: 'Sundar Pichai' },
      { key: 'B', text: 'Jensen Huang' },
      { key: 'C', text: 'Sam Altman' },
      { key: 'D', text: 'Satya Nadella' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 12,
    questionText: 'Which AI tool is primarily known for generating images from text prompts?',
    options: [
      { key: 'A', text: 'Midjourney' },
      { key: 'B', text: 'GitHub' },
      { key: 'C', text: 'Docker' },
      { key: 'D', text: 'Postman' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 13,
    questionText: 'Claude is developed by which company?',
    options: [
      { key: 'A', text: 'OpenAI' },
      { key: 'B', text: 'IBM' },
      { key: 'C', text: 'NVIDIA' },
      { key: 'D', text: 'Anthropic' },
    ],
    correctAnswer: 'D', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 14,
    questionText: 'Which company is behind the Copilot AI coding assistant?',
    options: [
      { key: 'A', text: 'Microsoft' },
      { key: 'B', text: 'NVIDIA' },
      { key: 'C', text: 'Oracle' },
      { key: 'D', text: 'Adobe' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 15,
    questionText: 'Which of these is primarily an AI coding assistant?',
    options: [
      { key: 'A', text: 'Canva' },
      { key: 'B', text: 'GitHub Copilot' },
      { key: 'C', text: 'ChatGPT' },
      { key: 'D', text: 'Anthropic Claude' },
    ],
    correctAnswer: 'B', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 16,
    questionText: 'What does LLM stand for?',
    options: [
      { key: 'A', text: 'Large Language Model' },
      { key: 'B', text: 'Large Logic Machine' },
      { key: 'C', text: 'Language Learning Module' },
      { key: 'D', text: 'Long Learning Machine' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 17,
    questionText: 'Which term is commonly used for an AI-generated false or fabricated response?',
    options: [
      { key: 'A', text: 'Fine Tuning' },
      { key: 'B', text: 'Hallucination' },
      { key: 'C', text: 'Encryption' },
      { key: 'D', text: 'Rendering' },
    ],
    correctAnswer: 'B', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 18,
    questionText: 'What is a prompt in generative AI?',
    options: [
      { key: 'A', text: 'A type of neural network' },
      { key: 'B', text: 'A hardware component' },
      { key: 'C', text: 'An instruction given to the AI' },
      { key: 'D', text: 'A training dataset' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 19,
    questionText: 'What does "AI ethics" mainly deal with?',
    options: [
      { key: 'A', text: 'Responsible and fair use of AI' },
      { key: 'B', text: 'Writing programming syntax' },
      { key: 'C', text: 'Increasing processor speed' },
      { key: 'D', text: 'Designing computer networks' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 20,
    questionText: 'Which statement about Generative AI is correct?',
    options: [
      { key: 'A', text: 'It is designed only to classify existing information' },
      { key: 'B', text: 'It is another name for traditional database software' },
      { key: 'C', text: 'It can operate only on numerical datasets' },
      { key: 'D', text: 'It can generate new content such as text, images, or audio' },
    ],
    correctAnswer: 'D', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 21,
    questionText: 'What is the main idea behind Agentic AI?',
    options: [
      { key: 'A', text: 'AI systems that only analyze images' },
      { key: 'B', text: 'AI systems that store large amounts of training data' },
      { key: 'C', text: 'AI systems that can plan and take actions toward a goal' },
      { key: 'D', text: 'AI systems that only generate text from prompts' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 22,
    questionText: 'Which AI tool is specifically designed for generating videos from text prompts?',
    options: [
      { key: 'A', text: 'Canva' },
      { key: 'B', text: 'Runway' },
      { key: 'C', text: 'Notion' },
      { key: 'D', text: 'GitHub Copilot' },
    ],
    correctAnswer: 'B', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 23,
    questionText: 'Which of these is an open-source large language model family developed by Meta?',
    options: [
      { key: 'A', text: 'Llama' },
      { key: 'B', text: 'GPT' },
      { key: 'C', text: 'Claude' },
      { key: 'D', text: 'Gemini' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 24,
    questionText: 'Which technology allows an AI system to perform a sequence of tasks instead of only responding to a single prompt?',
    options: [
      { key: 'A', text: 'Computer Vision' },
      { key: 'B', text: 'Agentic AI' },
      { key: 'C', text: 'OCR' },
      { key: 'D', text: 'Speech Recognition' },
    ],
    correctAnswer: 'B', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 25,
    questionText: 'Which platform provides access to a large collection of open-source AI models and datasets?',
    options: [
      { key: 'A', text: 'Docker Hub' },
      { key: 'B', text: 'npm' },
      { key: 'C', text: 'GitHub Pages' },
      { key: 'D', text: 'Hugging Face' },
    ],
    correctAnswer: 'D', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 26,
    questionText: 'Which AI model family is developed by Anthropic?',
    options: [
      { key: 'A', text: 'Gemini' },
      { key: 'B', text: 'Claude' },
      { key: 'C', text: 'GPT' },
      { key: 'D', text: 'Llama' },
    ],
    correctAnswer: 'B', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 27,
    questionText: 'Which term is commonly used for AI systems capable of working with more than one type of input, such as text and images?',
    options: [
      { key: 'A', text: 'Symbolic AI' },
      { key: 'B', text: 'Narrow AI' },
      { key: 'C', text: 'Multimodal AI' },
      { key: 'D', text: 'Rule-based AI' },
    ],
    correctAnswer: 'C', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 28,
    questionText: 'Which AI platform is particularly known for answering questions with web search and cited sources?',
    options: [
      { key: 'A', text: 'Midjourney' },
      { key: 'B', text: 'ChatGPT' },
      { key: 'C', text: 'GitHub Copilot' },
      { key: 'D', text: 'Perplexity' },
    ],
    correctAnswer: 'D', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 29,
    questionText: 'Which company is strongly associated with the development of GPUs widely used for AI computing?',
    options: [
      { key: 'A', text: 'NVIDIA' },
      { key: 'B', text: 'Oracle' },
      { key: 'C', text: 'IBM' },
      { key: 'D', text: 'Dropbox' },
    ],
    correctAnswer: 'A', marks: 1,
  },
  {
    round: 1, type: 'mcq', order: 30,
    questionText: 'Which AI tool is commonly used to generate presentations from a text prompt?',
    options: [
      { key: 'A', text: 'Postman' },
      { key: 'B', text: 'Git' },
      { key: 'C', text: 'MongoDB Compass' },
      { key: 'D', text: 'Gamma' },
    ],
    correctAnswer: 'D', marks: 1,
  },
];

const round2Questions = [
  {
    round: 2,
    type: 'image',
    order: 1,
    questionText: 'Which AI-powered development tool does this logo represent?',
    imageUrl: '/uploads/q1.png',
    options: [
      { key: 'A', text: 'Replit' },
      { key: 'B', text: 'Cursor' },
      { key: 'C', text: 'Windsurf' },
      { key: 'D', text: 'GitHub Copilot' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'image',
    order: 2,
    questionText: 'I this: ',
    imageUrl: '/uploads/q2.png',
    options: [
      { key: 'A', text: 'Real photo' },
      { key: 'B', text: 'AI-generated' },
      { key: 'C', text: 'AI-edited' },
      { key: 'D', text: 'Composite image' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 3,
    questionText: 'Task: You want AI to create a professional poster for a college coding competition.\n\nWhich prompt is most effective?',
    options: [
      { key: 'A', text: 'Create a coding competition poster.' },
      { key: 'B', text: 'Create a really amazing professional coding competition poster with attractive colors, great design, exciting text, cool graphics, modern fonts, and everything needed to make it look perfect and impressive for students.' },
      { key: 'C', text: 'Create a poster for our coding competition with a dark theme.' },
      { key: 'D', text: 'Create a professional poster for a college coding competition. Include the event name, date, venue, registration deadline, and a clear call-to-action. Use a modern tech theme.' },
    ],
    correctAnswer: 'D',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 4,
    questionText: 'I don\'t need to be told every rule.\nShow me enough examples, and I can discover patterns hidden within them.\n\nBut unlike my supervised cousin, nobody tells me which answer is correct.\nWhat am I?',
    options: [
      { key: 'A', text: 'Reinforcement Learning' },
      { key: 'B', text: 'Unsupervised Learning' },
      { key: 'C', text: 'Transfer Learning' },
      { key: 'D', text: 'Few-shot Learning' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 5,
    questionText: 'You have a long research report and want an AI tool to analyze documents, answer questions about them, and work with large amounts of text. Which is the best choice?',
    options: [
      { key: 'A', text: 'Claude' },
      { key: 'B', text: 'Midjourney' },
      { key: 'C', text: 'Microsoft Copilot' },
      { key: 'D', text: 'ElevenLabs' },
    ],
    correctAnswer: 'A',
    marks: 1,
  },

  {
    round: 2,
    type: 'image',
    order: 6,
    questionText: 'Which of these images is AI-generated?',
    imageUrl: '/uploads/q6.png',
    options: [
      { key: 'A', text: 'Image A' },
      { key: 'B', text: 'Image B' },
      { key: 'C', text: 'Image C' },
      { key: 'D', text: 'Image D' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 7,
    questionText: 'Which statement about large language models (LLMs) is correct?',
    options: [
      { key: 'A', text: 'They produce responses using fixed rules' },
      { key: 'B', text: 'They retrieve every answer from the internet' },
      { key: 'C', text: 'They store complete copies of training documents' },
      { key: 'D', text: 'They predict likely sequences of tokens' },
    ],
    correctAnswer: 'D',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 8,
    questionText: 'An AI chatbot gives two different answers to the same question. What is the most likely reason?',
    options: [
      { key: 'A', text: 'AI uses only fixed rules' },
      { key: 'B', text: 'AI cannot process questions' },
      { key: 'C', text: 'AI responses can vary by context' },
      { key: 'D', text: 'AI always copies old answers' },
    ],
    correctAnswer: 'C',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 9,
    questionText: 'I can be trained with rewards,\nI learn through trial and error,\nand no one gives me the correct answer after each attempt.\nWhat am I?',
    options: [
      { key: 'A', text: 'Supervised Learning' },
      { key: 'B', text: 'Transfer Learning' },
      { key: 'C', text: 'Unsupervised Learning' },
      { key: 'D', text: 'Reinforcement Learning' },
    ],
    correctAnswer: 'D',
    marks: 1,
  },

  {
    round: 2,
    type: 'image',
    order: 10,
    questionText: 'Which AI tool does this logo represent?',
    imageUrl: '/uploads/q10.png',
    options: [
      { key: 'A', text: 'Sea AI' },
      { key: 'B', text: 'Sailboat AI' },
      { key: 'C', text: 'Midjourney' },
      { key: 'D', text: 'Adobe Firefly' },
    ],
    correctAnswer: 'C',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 11,
    questionText: 'You are producing a short college event video. You already have the script written, but you don\'t want to record your own voice. You want an AI tool that can turn the script into a natural-sounding voiceover with different voice styles and tones. Which tool would be the best fit?',
    options: [
      { key: 'A', text: 'ElevenLabs' },
      { key: 'B', text: 'Runway' },
      { key: 'C', text: 'Midjourney' },
      { key: 'D', text: 'Suno' },
    ],
    correctAnswer: 'A',
    marks: 1,
  },

  {
    round: 2,
    type: 'image',
    order: 12,
    questionText: 'Is this image real or AI-generated?',
    imageUrl: '/uploads/q12.jpg',
    options: [
      { key: 'A', text: 'Real photo' },
      { key: 'B', text: 'AI-generated' },
      { key: 'C', text: 'AI-edited' },
      { key: 'D', text: 'Composite image' },
    ],
    correctAnswer: 'A',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 13,
    questionText: 'You ask an AI assistant to summarize a 50-page research report. The response sounds convincing and well-written, but after checking the original report, you notice that the AI has included a statistic that was never mentioned in the document. What does this situation most likely represent?',
    options: [
      { key: 'A', text: 'Fine-tuning' },
      { key: 'B', text: 'AI hallucination' },
      { key: 'C', text: 'Data compression' },
      { key: 'D', text: 'Model training' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 14,
    questionText: 'Your team is developing a website and wants an AI coding assistant that can suggest code, complete functions, explain code, and help fix errors while you work in your development environment. Which tool is the best fit?',
    options: [
      { key: 'A', text: 'Lovable' },
      { key: 'B', text: 'GitHub Copilot' },
      { key: 'C', text: 'Windsurf' },
      { key: 'D', text: 'Replit' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 15,
    questionText: 'I can recognize patterns without being told every rule.\nI improve my performance by learning from data.\nI can be used to predict whether an email is spam or not.\nWhat am I?',
    options: [
      { key: 'A', text: 'Machine Learning' },
      { key: 'B', text: 'Generative AI' },
      { key: 'C', text: 'Natural Language Processing' },
      { key: 'D', text: 'Expert System' },
    ],
    correctAnswer: 'A',
    marks: 1,
  },

  {
    round: 2,
    type: 'image',
    order: 16,
    questionText: 'Which AI-powered development platform does this logo represent?',
    imageUrl: '/uploads/q16.jpg',
    options: [
      { key: 'A', text: 'Lovable' },
      { key: 'B', text: 'Replit' },
      { key: 'C', text: 'Bolt' },
      { key: 'D', text: 'v0' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 17,
    questionText: 'An AI assistant is asked: “Explain recursion to a beginner using a simple real-world example.” Which response follows the instruction most accurately?',
    options: [
      { key: 'A', text: 'A highly technical explanation using mathematical notation and formal definitions' },
      { key: 'B', text: 'A short explanation using a simple everyday analogy and one basic example' },
      { key: 'C', text: 'A detailed history of recursion and its development in programming' },
      { key: 'D', text: 'A comparison of recursion with every major programming concept' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 18,
    questionText: 'A student uses an AI tool to generate an assignment. The AI produces a few claims that sound convincing, but the student cannot find reliable sources supporting them. What is the best thing to do before submitting the assignment?',
    options: [
      { key: 'A', text: 'Submit it because the answer sounds correct' },
      { key: 'B', text: 'Ask another AI to rewrite the same claims' },
      { key: 'C', text: 'Remove every AI-generated sentence' },
      { key: 'D', text: 'Verify the claims using reliable sources' },
    ],
    correctAnswer: 'D',
    marks: 1,
  },

  {
    round: 2,
    type: 'mcq',
    order: 19,
    questionText: 'I can work with text, images, audio, and sometimes video.\nI don\'t have to be limited to just one type of input.\nWhat kind of AI am I?',
    options: [
      { key: 'A', text: 'Generative AI' },
      { key: 'B', text: 'Multimodal AI' },
      { key: 'C', text: 'Conversational AI' },
      { key: 'D', text: 'Narrow AI' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },

  {
    round: 2,
    type: 'image',
    order: 20,
    questionText: 'Which AI assistant does this logo represent?',
    imageUrl: '/uploads/q20.jpg',
    options: [
      { key: 'A', text: 'Claude' },
      { key: 'B', text: 'Grok' },
      { key: 'C', text: 'Gemini' },
      { key: 'D', text: 'Perplexity' },
    ],
    correctAnswer: 'B',
    marks: 1,
  },
];

module.exports = { round1Questions, round2Questions };
