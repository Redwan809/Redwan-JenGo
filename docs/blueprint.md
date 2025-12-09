# **App Name**: Redwan Intel AI Chat

## Core Features:

- Basic Chat Interface: Sets up a basic chat interface with a sidebar, header, chat display, and input area, mirroring the provided HTML structure.
- User Message Display: Allows users to send messages that appear on the right side of the chat interface with a distinct background.
- AI Message Display with Avatar: Displays AI-generated responses on the left side of the chat interface, including a static avatar.
- Loading State Indicator: Implements a loading animation with a spinning ball and 'Thinking...' text while the AI generates a response, to give the user feedback about activity.
- AI Reply Simulation: Simulates AI responses to user messages based on predefined conditions ('hi', 'hello', or 'no'), with a delay to mimic processing time. Expandable to use a tool.
- Dynamic Message Handling: Facilitates adding new messages to the chat display and automatically scrolling to the bottom to ensure the latest messages are always visible.
- Modular File Structure: Structures the Next.js application with separate files for each component (sidebar, header, chat display, input area) to support scalability for adding more response areas.

## Style Guidelines:

- Primary color: Dark gray (#1E1F20) for the sidebar and input background, creating a cohesive dark interface.
- Background color: Very dark gray (#131314) for the main background to ensure readability and focus on chat content.
- Accent color: Medium gray (#444746) for borders and subtle UI elements, providing contrast without being too harsh.
- Body and headline font: 'PT Sans' for a clean, readable, and modern appearance suitable for both headlines and body text.
- Simple, minimalist icons for UI elements (e.g., send button) to maintain a clean and modern look.
- Responsive layout to ensure optimal viewing experience across different screen sizes, with a sidebar that collapses on smaller screens.
- Subtle animations, like a smooth scroll to the bottom of the chat, enhance the user experience without being distracting.