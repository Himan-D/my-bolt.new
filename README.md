[![Bolt.new: AI-Powered Full-Stack Web Development in the Browser](./public/social_preview_index.jpg)](https://bolt.new)

# Bolt.new - Enhanced Fork

A personalized fork of [Bolt.new](https://github.com/stackblitz/bolt.new) with custom enhancements and optimizations for AI-powered full-stack web development in the browser.

**Latest Update (April 2, 2026):**
- Refactored UI components to client-side rendering for improved performance
- Enhanced LLM configuration with better provider and model handling
- Added new UI component library (Button, ContextMenu, Input, ScrollArea)
- Improved GitHub integration utilities
- Enhanced persistence layer and state management
- Added PDF utility functions for document processing

## About Bolt.new

Bolt.new is an AI-powered web development agent that allows you to prompt, run, edit, and deploy full-stack applications directly from your browser—no local setup required. If you're here to build your own AI-powered web dev agent using the Bolt.new open source codebase, [click here to get started!](./CONTRIBUTING.md)

## What Makes Bolt.new Different

Claude, v0, etc are incredible- but you can't install packages, run backends or edit code. That’s where Bolt.new stands out:

- **Full-Stack in the Browser**: Bolt.new integrates cutting-edge AI models with an in-browser development environment powered by **StackBlitz’s WebContainers**. This allows you to:

  - Install and run npm tools and libraries (like Vite, Next.js, and more)
  - Run Node.js servers
  - Interact with third-party APIs
  - Deploy to production from chat
  - Share your work via a URL

- **AI with Environment Control**: Unlike traditional dev environments where the AI can only assist in code generation, Bolt.new gives AI models **complete control** over the entire environment including the filesystem, node server, package manager, terminal, and browser console. This empowers AI agents to handle the entire app lifecycle—from creation to deployment.

Whether you’re an experienced developer, a PM or designer, Bolt.new allows you to build production-grade full-stack applications with ease.

For developers interested in building their own AI-powered development tools with WebContainers, check out the open-source Bolt codebase in this repo!

## Tips and Tricks

Here are some tips to get the most out of Bolt.new:

- **Be specific about your stack**: If you want to use specific frameworks or libraries (like Astro, Tailwind, ShadCN, or any other popular JavaScript framework), mention them in your initial prompt to ensure Bolt scaffolds the project accordingly.

- **Use the enhance prompt icon**: Before sending your prompt, try clicking the 'enhance' icon to have the AI model help you refine your prompt, then edit the results before submitting.

- **Scaffold the basics first, then add features**: Make sure the basic structure of your application is in place before diving into more advanced functionality. This helps Bolt understand the foundation of your project and ensure everything is wired up right before building out more advanced functionality.

- **Batch simple instructions**: Save time by combining simple instructions into one message. For example, you can ask Bolt to change the color scheme, add mobile responsiveness, and restart the dev server, all in one go saving you time and reducing API credit consumption significantly.

## FAQs

**What is this fork?**  
This is an enhanced fork of the official [Bolt.new](https://github.com/stackblitz/bolt.new) repository with custom improvements including optimized client-side rendering, enhanced LLM provider configuration, improved UI components, and better state management. It maintains compatibility with the upstream Bolt.new project.

**What recent enhancements have been made?**  
Recent updates include client-side rendering optimizations, refactored UI components with a new component library, enhanced LLM configuration and streaming, improved GitHub integration, and better persistence layer management.

**Can this generate good code?**  
Yes. With clear prompts, the right model selection, and iterative refinement, this fork can generate strong full-stack code including UI, APIs, and integrations. Code quality improves significantly when you ask for tests, lint fixes, and small step-by-step changes instead of one large prompt.

**Is this comparable to Lovable?**  
It is comparable for rapid app generation, but the strengths differ. Lovable is optimized for fast product scaffolding, while Bolt.new-style workflows excel when you need direct environment control (files, terminal, package installs, backend processes) and deeper iteration inside a real runtime.

**Where do I sign up for a paid plan?**  
Bolt.new is free to get started. If you need more AI tokens or want private projects, you can purchase a paid subscription in your [Bolt.new](https://bolt.new) settings, in the lower-left hand corner of the application.

**What happens if I hit the free usage limit?**  
Once your free daily token limit is reached, AI interactions are paused until the next day or until you upgrade your plan.

**Is Bolt in beta?**  
Yes, Bolt.new is in beta, and the project is actively being improved based on feedback and community contributions.

**How can I report issues with this fork?**  
Check out the [Issues section](https://github.com/Himan-D/my-bolt.new/issues) to report issues or request features. For issues with the original Bolt.new project, see the [upstream Issues section](https://github.com/stackblitz/bolt.new/issues).

**What frameworks/libraries currently work on Bolt?**  
Bolt.new supports most popular JavaScript frameworks and libraries. If it runs on StackBlitz, it will run on Bolt.new as well.

**How can I partner or contribute?**  
For the original Bolt.new project, reach out via [hello@stackblitz.com](mailto:hello@stackblitz.com). For contributions to this fork, please submit pull requests and follow standard GitHub contribution practices.
